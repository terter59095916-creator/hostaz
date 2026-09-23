'use strict';

const MAX_BUFFERED_BYTES = 1024 * 1024;
const TRANSIENT_MESSAGES = new Set(['pointer', 'pointer_move', 'typing', 'preview', 'live_frame', 'live_audio']);

function nextPacket(ws) {
  ws.packetCounter = (ws.packetCounter || 1000) + 1;
  return ws.packetCounter;
}

function markPong(ws, now = Date.now()) {
  ws.isAlive = true;
  ws.missedPings = 0;
  ws.lastPongAt = now;
}

function heartbeat(ws) {
  if (ws.readyState !== 1) return;
  if (!ws.isAlive) ws.missedPings = (ws.missedPings || 0) + 1;
  if (ws.missedPings >= 3) {
    ws.disconnectCause = 'heartbeat_timeout';
    ws.terminate();
    return;
  }
  ws.isAlive = false;
  try { ws.ping(undefined, undefined, error => { if (error) ws.disconnectCause = 'ping_error'; }); }
  catch (_) { ws.disconnectCause = 'ping_error'; ws.terminate(); }
}

function requestReconnect(ws) {
  if (ws.reconnectRequested || ws.readyState !== 1) return;
  ws.reconnectRequested = true;
  ws.disconnectCause = 'state_resync';
  // A congested connection must resnapshot, never continue after a lost state packet.
  try { ws.close(4002, 'state_resync'); } catch (_) { ws.terminate(); }
  ws.reconnectTimer = setTimeout(() => {
    if (ws.readyState !== 3) ws.terminate();
  }, 5000);
  ws.reconnectTimer.unref?.();
}

function createGameSender(encode, reconnect = requestReconnect) {
  return function sendGame(ws, payload) {
    if (!ws || ws.readyState !== 1 || ws.reconnectRequested) return false;
    if (ws.bufferedAmount > MAX_BUFFERED_BYTES) {
      if (!TRANSIENT_MESSAGES.has(payload.type)) reconnect(ws);
      return false;
    }
    try {
      const data = encode({ ...payload, packet: nextPacket(ws) });
      ws.send(data, error => { if (error) reconnect(ws); });
      return true;
    } catch (_) {
      reconnect(ws);
      return false;
    }
  };
}

function replaceRoomSocket(room, oldWs, ws) {
  const player = room.players.get(oldWs);
  if (!player) return false;
  clearTimeout(oldWs.roomLeaveTimer);
  room.players.delete(oldWs);
  room.players.set(ws, player);
  if (room.pendingSpin) {
    for (const participant of room.pendingSpin.players) {
      if (participant.ws === oldWs) participant.ws = ws;
    }
  }
  ws.gameRoom = room;
  ws.gamePlayer = player;
  oldWs.lastGameRoomId = room.gameId;
  oldWs.gameRoom = null;
  oldWs.gamePlayer = null;
  return true;
}

function createAssetRefresh(load, fs, file, onWriteError = () => {}) {
  let inFlight = null;
  return function refresh() {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      const text = JSON.stringify(await load());
      try {
        let previous;
        try { previous = await fs.readFile(file, 'utf8'); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
        if (previous !== text) await fs.writeFile(file, text, 'utf8');
      } catch (error) { onWriteError(error); }
      return text;
    })().finally(() => { inFlight = null; });
    return inFlight;
  };
}

class ActivityTracker {
  constructor() { this.users = new Map(); }
  add(id, ws, now = Date.now()) {
    if (!this.users.has(id)) this.users.set(id, { sockets: new Set(), lastAt: now });
    this.users.get(id).sockets.add(ws);
  }
  remove(id, ws) {
    const entry = this.users.get(id);
    if (!entry) return;
    entry.sockets.delete(ws);
    if (!entry.sockets.size) this.users.delete(id);
  }
  flush(update, now = Date.now()) {
    for (const [id, entry] of this.users) {
      if (![...entry.sockets].some(ws => ws.readyState === 1)) continue;
      const seconds = Math.min(60, Math.floor((now - entry.lastAt) / 1000));
      if (seconds < 1) continue;
      update(id, seconds);
      entry.lastAt = now;
    }
  }
}

module.exports = { nextPacket, markPong, heartbeat, requestReconnect, createGameSender, replaceRoomSocket, createAssetRefresh, ActivityTracker };
