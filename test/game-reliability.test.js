'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');

test('heartbeat tolerates two misses, terminates on third, and pong resets it', () => {
  const { heartbeat, markPong } = require('../game-reliability');
  const ws = { readyState: 1, isAlive: true, ping() {}, terminate() { this.terminated = true; } };
  heartbeat(ws); heartbeat(ws); heartbeat(ws);
  assert.equal(ws.missedPings, 2);
  assert.equal(ws.terminated, undefined);
  markPong(ws, 123);
  assert.equal(ws.lastPongAt, 123);
  assert.equal(ws.missedPings, 0);
  heartbeat(ws); heartbeat(ws); heartbeat(ws); heartbeat(ws);
  assert.equal(ws.terminated, true);
});

test('backpressure never silently drops critical state and numbering is per sent packet', () => {
  const { createGameSender } = require('../game-reliability');
  const sent = [], reconnects = [];
  const send = createGameSender(x => x, ws => reconnects.push(ws));
  const ws = { readyState: 1, bufferedAmount: 0, send(x, cb) { sent.push(x); cb(); } };
  const payload = Object.freeze({ type: 'game_join', packet: 5 });
  send(ws, payload); send(ws, payload);
  assert.equal(sent[1].packet, sent[0].packet + 1);
  assert.equal(payload.packet, 5);
  ws.bufferedAmount = 2_000_000;
  send(ws, { type: 'typing' });
  assert.equal(reconnects.length, 0);
  for (const type of ['game_enter', 'game_join', 'game_leave', 'game_turn', 'game_action_ok', 'game_action_error', 'item_purchase', 'update_user']) {
    send(ws, { type });
  }
  assert.equal(reconnects.length, 8);
  ws.bufferedAmount = 0;
  ws.send = () => { throw Error('transport'); };
  assert.doesNotThrow(() => send(ws, { type: 'game_enter' }));
  assert.equal(reconnects.length, 9);
});

test('socket replacement preserves identity, seat, gifts and pending spin', () => {
  const { replaceRoomSocket } = require('../game-reliability');
  const player = { id: '7', seat: 3 }, old = {}, fresh = {};
  const gifts = new Map([['7', { hat: 'hat' }]]);
  const room = { players: new Map([[old, player]]), stickedGifts: gifts, pendingSpin: { players: [{ ws: old, p: player }] } };
  old.gameRoom = room; old.gamePlayer = player;
  replaceRoomSocket(room, old, fresh);
  assert.equal(room.players.get(fresh), player);
  assert.equal(room.players.has(old), false);
  assert.equal(room.pendingSpin.players[0].ws, fresh);
  assert.equal(room.stickedGifts, gifts);
  assert.equal(old.gameRoom, null);
  assert.equal(old.gamePlayer, null);
});

test('asset refresh coalesces callers and skips unchanged disk writes', async () => {
  const { createAssetRefresh } = require('../game-reliability');
  let loads = 0, writes = 0;
  const refresh = createAssetRefresh(async () => { loads++; return { same: true }; }, {
    readFile: async () => '{"same":true}', writeFile: async () => { writes++; }
  }, 'unused');
  const [a, b] = await Promise.all([refresh(), refresh()]);
  assert.equal(a, b); assert.equal(loads, 1); assert.equal(writes, 0);
  await refresh(); assert.equal(writes, 0);
});

test('source regression guards for production and lifecycle changes', () => {
  const server = source('server.js'), client = source('game_v2/preloader_new.js');
  assert.ok(!/\.send\(encodeMessage\(/.test(server), 'all WS sends must use the safe sender');
  assert.ok(!/packetCounter\+\+|packetCounter\s*=/.test(server), 'only nextPacket allocates numbers');
  assert.ok(!/console\.log\('WS RECV:', JSON\.stringify/.test(server), 'no raw WS logs');
  const admin = server.split("app.get('/api/admin/users',")[1].split("app.get('/api/admin/leaderboard'")[0];
  assert.doesNotMatch(admin, /SELECT \*|password_hash|JSON\.stringify\(rows/);
  assert.ok(!/console\.log\(`recv: \$\{jsonData\}/.test(client), 'no raw client WS logs');
  assert.ok(/this\.resizeObserver\?\.disconnect\(\)/.test(client), 'observer cleanup');
  assert.ok(/w === this\.root\.width && h === this\.root\.height/.test(client), 'layout early exit');
  assert.ok(/this\.giftAnimations\.destroy\(\)/.test(client), 'table cleanup');
  assert.doesNotMatch(source('game_v2/yandex_v2.html'), /forceYoutubePlay/);
});

test('duplicate sockets count active time once, disconnect removes the user', () => {
  const { ActivityTracker } = require('../game-reliability');
  const tracker = new ActivityTracker(), a = { readyState: 1 }, b = { readyState: 1 }, updates = [];
  tracker.add(7, a, 0); tracker.add(7, b, 30000);
  tracker.flush((...args) => updates.push(args), 60000);
  assert.deepEqual(updates, [[7, 60]]);
  tracker.remove(7, a);
  tracker.flush((...args) => updates.push(args), 120000);
  assert.deepEqual(updates, [[7, 60], [7, 60]]);
  tracker.remove(7, b);
  assert.equal(tracker.users.size, 0);
});

test('asset load and write failures settle and allow retry', async () => {
  const { createAssetRefresh } = require('../game-reliability');
  let fail = true, errors = 0;
  const refresh = createAssetRefresh(async () => { if (fail) throw Error('network'); return {}; }, {
    readFile: async () => '', writeFile: async () => { throw Error('disk'); }
  }, 'unused', () => errors++);
  await assert.rejects(refresh());
  fail = false;
  assert.equal(await refresh(), '{}');
  assert.equal(errors, 1);
});

function clientClass(name, end, globals = {}) {
  const text = source('game_v2/preloader_new.js');
  const from = text.indexOf(`class ${name} {`), to = text.indexOf(end, from);
  assert.ok(from >= 0 && to > from);
  return vm.runInNewContext(`${text.slice(from, to)}; ${name}`, { console, ...globals });
}

function youtubeHarness(ready = false) {
  const scripts = [], timers = new Map(); let timerId = 0;
  const window = { setInterval: () => 1, YT: ready ? { Player: function () {} } : undefined };
  const document = {
    querySelector: () => scripts[0] || null,
    createElement: () => ({
      addEventListener(type, fn) { this[type] = fn; },
      removeEventListener(type) { delete this[type]; },
      remove() { scripts.splice(scripts.indexOf(this), 1); }
    }),
    head: { appendChild: script => scripts.push(script) }
  };
  const YT = { PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0, UNSTARTED: -1 } };
  const Klass = clientClass('YouTubePlayer', ';// ./js/html/utils/cssClass', {
    window, document, YT, html2dom: () => ({ remove() {} }),
    setTimeout: (fn, ms) => { timers.set(++timerId, { fn, ms }); return timerId; },
    clearTimeout: id => timers.delete(id), clearInterval() {}
  });
  return { Klass, window, scripts, timers, YT };
}

test('YouTube first clip shares one API load; failure/timeout can retry', async () => {
  const h = youtubeHarness();
  const first = h.Klass.prepare(), second = h.Klass.prepare();
  assert.equal(first, second); assert.equal(h.scripts.length, 1);
  h.window.YT = { Player: function () {} };
  h.window.onYouTubeIframeAPIReady();
  await first;
  assert.equal(h.timers.size, 0);
  await h.Klass.prepare(); assert.equal(h.scripts.length, 1);
  const errorHarness = youtubeHarness();
  const failed = errorHarness.Klass.prepare();
  errorHarness.scripts[0].error();
  await assert.rejects(failed);
  const retry = errorHarness.Klass.prepare();
  assert.equal(errorHarness.scripts.length, 1);
  const timer = [...errorHarness.timers.values()][0];
  assert.equal(timer.ms, 10000); timer.fn();
  await assert.rejects(retry);
  assert.equal(errorHarness.Klass.preparePromise, null);
});

test('YouTube exit before API readiness creates no zombie; reentry creates and destroys one player', async () => {
  const h = youtubeHarness(); let created = 0, destroyed = 0;
  h.YT.Player = function () { created++; this.destroy = () => destroyed++; };
  const config = { song: { song_id: 'clip' }, startPosition: 0, containerElement: { appendChild() {} },
    pageInteractionSignal: { add() {}, remove() {} }, muted: true, volume: 0.5 };
  const first = new h.Klass(config);
  first.play(); first.destroy();
  h.window.YT = h.YT; h.window.onYouTubeIframeAPIReady();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(created, 0);
  const returned = new h.Klass(config); returned.play();
  await Promise.resolve();
  assert.equal(created, 1);
  // Must destroy even before onReady fires.
  returned.destroy(); returned.destroy();
  assert.equal(destroyed, 1);
});

test('gift capacity follows timeline destruction, not wall time; table teardown empties everything', async () => {
  const Klass = clientClass('GiftAnimations', 'GiftAnimations.GIFT_SCALE =', { Promise });
  const timelines = [], destroyed = [];
  const manager = {
    timeline() { const tl = { add() {}, complete() { this.ondestroy?.(); } }; timelines.push(tl); return tl; },
    tweenf() { return {}; }, tween() { return {}; }
  };
  const presenter = { tableView: { createGift: () => ({}), destroyGift: view => destroyed.push(view), caps: {} },
    getUserView: () => ({}), user2presenter: {} };
  const gifts = new Klass(manager, presenter);
  gifts.calcGiftPosition = () => ({}); gifts.userToLayer = () => ({}); gifts.onFly = () => {};
  const sender = { id: 's', game: {} }, receiver = { id: 'r', game: {} }, gift = { stickPoint: 'ava' };
  for (let i = 0; i < 40; i++) gifts.flyGift(sender, receiver, gift);
  assert.equal(gifts.activeGiftAnimations, 4);
  assert.equal(gifts.pendingGiftAnimations.length, 24);
  assert.equal(timelines.length, 4);
  timelines[0].complete(); await Promise.resolve();
  assert.equal(gifts.activeGiftAnimations, 4); assert.equal(timelines.length, 5);
  gifts.destroy(); await Promise.resolve();
  assert.equal(gifts.activeGiftAnimations, 0);
  assert.equal(gifts.pendingGiftAnimations.length, 0);
  assert.equal(gifts.timelines.size, 0);
  gifts.flyGift(null, receiver, null);
  assert.equal(timelines.length, 5);
});

test('real animation timelines release fly slots once, including early user departure', async () => {
  const text = source('game_v2/preloader_new.js');
  const animationCode = text.slice(text.indexOf('class Tween {'), text.indexOf('const FPS = 30;'));
  const Manager = vm.runInNewContext(`${animationCode}; AnimationManager`, { exception: error => { throw error; } });
  const Gifts = clientClass('GiftAnimations', 'GiftAnimations.GIFT_SCALE =', { Promise });
  const manager = new Manager();
  const presenter = { tableView: { createGift: () => ({}), destroyGift() {}, caps: {} }, getUserView: () => ({}), user2presenter: {} };
  const gifts = new Gifts(manager, presenter);
  gifts.calcGiftPosition = () => ({}); gifts.userToLayer = () => ({}); gifts.onFly = () => {};
  gifts.stickGift = () => ({});
  const s = { id: 's', game: {} }, r = { id: 'r', game: {} }, gift = { stickPoint: 'ava' };
  for (let i = 0; i < 5; i++) gifts.flyGift(s, r, gift);
  manager.enterFrame(2.1);
  assert.equal(gifts.activeGiftAnimations, 4, '2 seconds must not release slots');
  manager.enterFrame(3.1);
  await Promise.resolve();
  assert.equal(gifts.activeGiftAnimations, 1);
  gifts.leaveUser(r);
  await Promise.resolve();
  assert.equal(gifts.activeGiftAnimations, 0);
  gifts.destroy();
  assert.equal(gifts.timelines.size, 0);
});

test('packet receiver detects a gap before storing it, then reconnects', () => {
  const text = source('game_v2/preloader_new.js');
  const code = text.slice(text.indexOf('  trackedRecv(obj) {'), text.indexOf('  subscribeToMessage(type, handler) {'));
  const Receiver = vm.runInNewContext(`class Receiver { ${code} }; Receiver`, { window: {}, console, capture_message() {} });
  const receiver = new Receiver(); let received = 0, reconnects = 0;
  receiver.recvCount = 0; receiver.recv = () => received++; receiver.reconnect = () => reconnects++;
  receiver.reconnectOnPacketDrop = true;
  receiver.trackedRecv({ packet: 1001 }); receiver.trackedRecv({ packet: 1002 });
  receiver.trackedRecv({ packet: 1004 });
  assert.equal(received, 2); assert.equal(reconnects, 1); assert.equal(receiver.packet, 1002);
});

test('pointer bursts are coalesced and teardown cancels queued work', () => {
  const text = source('game_v2/preloader_new.js');
  const code = text.slice(text.indexOf('    onPointerMove(nativeEvent) {'), text.indexOf('    processPointerMove(nativeEvent) {'));
  const frames = new Map(); let id = 0;
  const Moves = vm.runInNewContext(`class Moves { ${code} }; Moves`, {
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; }, cancelAnimationFrame: id => frames.delete(id)
  });
  const moves = new Moves(), handled = []; moves.domElement = {}; moves.processPointerMove = e => handled.push(e);
  for (let i = 0; i < 50; i++) moves.onPointerMove(i);
  assert.equal(frames.size, 1);
  const callback = [...frames.values()][0]; frames.clear(); callback();
  assert.deepEqual(handled, [49]);
  moves.onPointerMove(51); moves.cancelPointerMove(); assert.equal(frames.size, 0);
});

function awaiter(context, args, ignored, body) {
  return new Promise((resolve, reject) => {
    const iterator = body.call(context);
    const step = (method, value) => {
      let item; try { item = iterator[method](value); } catch (error) { reject(error); return; }
      if (item.done) resolve(item.value);
      else Promise.resolve(item.value).then(v => step('next', v), e => step('throw', e));
    };
    step('next');
  });
}

test('PhotoLoader deduplicates concurrent and repeated URLs with distinct consumer nodes', async () => {
  const Loader = clientClass('PhotoLoader', '// EXTERNAL MODULE: ./node_modules/html2canvas', { __awaiter: awaiter });
  const loader = new Loader(); let count = 0;
  const image = { cloneNode: () => ({ src: '/api/avatar/7' }) };
  loader.tryLoadFromUrls = async () => { count++; return { img: image }; };
  const [a, b] = await Promise.all([loader.load('/api/avatar/7'), loader.load('/api/avatar/7')]);
  assert.notEqual(a, b); assert.equal(count, 1);
  await loader.load('/api/avatar/7'); assert.equal(count, 1);
  await loader.load('/api/avatar/8'); assert.equal(count, 2);
});

test('missing avatars return same-origin cacheable SVG; gul failures do not redirect', async () => {
  const text = source('server.js');
  const code = text.slice(text.indexOf('const DEFAULT_AVATAR ='), text.indexOf('// Google ile giris'));
  let handler, row;
  vm.runInNewContext(code, {
    app: { get(route, fn) { assert.equal(route, '/api/avatar/:id'); handler = fn; } },
    db: { prepare: () => ({ get: () => row }) }, URL, Buffer, AbortSignal,
    fetch: async () => { throw Error('offline'); }
  });
  for (const value of [undefined, { avatar_data: '' }, { avatar_data: 'https://gul.az/no_profil.jpg' }, { avatar_data: 'https://gul.az/avatar/7.jpg' }]) {
    row = value;
    const res = { headers: {}, set(k, v) { this.headers[k] = v; return this; }, type(v) { this.contentType = v; return this; }, send(v) { this.body = v; return this; } };
    await handler({ params: { id: '7' } }, res);
    assert.equal(res.contentType, 'image/svg+xml'); assert.match(res.body, /^<svg/);
    assert.equal(res.headers['Cache-Control'], 'public, max-age=300');
  }
});

test('actual gift charge SQL cannot overdraw an isolated in-memory balance', () => {
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE users(id INTEGER PRIMARY KEY, coins INTEGER); INSERT INTO users VALUES(7, 10)');
    const sql = source('server.js').match(/const charge = db.prepare\('([^']+)'\)/)[1];
    const charge = db.prepare(sql);
    assert.equal(charge.run(8, 7, 8).changes, 1);
    assert.equal(charge.run(8, 7, 8).changes, 0);
    assert.equal(db.prepare('SELECT coins FROM users').get().coins, 2);
  } finally { db.close(); }
});

test('gift queue overflow does not lose or double-apply receiver balance state', async () => {
  const Gifts = clientClass('GiftAnimations', 'GiftAnimations.GIFT_SCALE =', { Promise });
  const timelines = [];
  const manager = { timeline() { const tl = { add() {}, complete() { this.ondestroy(); } }; timelines.push(tl); return tl; }, tweenf() {} };
  const presenter = { tableView: { createGift: () => ({}), destroyGift() {} }, getUserView: () => ({}), user2presenter: {} };
  const gifts = new Gifts(manager, presenter);
  gifts.calcGiftPosition = () => ({}); gifts.userToLayer = () => ({}); gifts.onFly = () => {};
  let credited = 0;
  const sender = { id: 's', game: {} }, receiver = { id: 'r', game: {}, viewer: { incCurrency(kind, amount) { credited += amount; } } };
  presenter.tableView.caps = {};
  for (let i = 0; i < 40; i++) gifts.flyGift(sender, receiver, { stickPoint: 'ava', gold: 1 });
  assert.equal(credited, 40);
  assert.equal(gifts.pendingGiftAnimations.length, 24);
  timelines[0].complete(); await Promise.resolve();
  assert.equal(credited, 40);
  gifts.destroy(); await Promise.resolve(); assert.equal(credited, 40);
});

test('player effect destroys old player when song/provider changes even with the same URL', () => {
  const text = source('game_v2/preloader_new.js');
  const from = text.indexOf('const UniversalPlayer ='), to = text.indexOf(';// ./js/html/components/Music/MusicViewPreact', from);
  const effects = []; let cursor = 0, created = 0, destroyed = 0;
  const Player = vm.runInNewContext(`${text.slice(from, to)}; UniversalPlayer`, {
    compat_module_D: fn => fn, MusicProvider: { isVideo: () => true },
    hooks_module_A: () => ({ current: {} }), hooks_module_d: init => [typeof init === 'function' ? init() : init, () => {}],
    hooks_module_y: (fn, deps) => {
      const index = cursor++, previous = effects[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
        previous?.cleanup?.(); effects[index] = { deps, cleanup: fn() };
      }
    },
    Scope: class { removeAll() {} }, getSongIcon: () => '',
    createPlayer: () => { created++; return { destroy() { destroyed++; } }; },
    preact_module_: () => ({}), clsJoin: () => '', UniversalPlayer_cls: () => ''
  });
  const render = (provider, song) => { cursor = 0; Player({ provider, song: { song_id: song }, url: 'unchanged' }, { current: null }); };
  render('yt', 'first'); render('yt', 'first'); assert.equal(created, 1);
  render('yt', 'second'); assert.equal(destroyed, 1);
  render('cz', 'second'); assert.equal(destroyed, 2);
  effects.forEach(effect => effect.cleanup?.()); assert.equal(destroyed, 3);
});

test('YouTube ready callback preserves the explicit mute choice', () => {
  const h = youtubeHarness(true), calls = [];
  h.window.__wantMusicMuted = true;
  const player = new h.Klass({ song: { song_id: 'clip' }, startPosition: 0, containerElement: { appendChild() {} }, muted: false, volume: 1 });
  player._player = { getDuration: () => 100, mute: () => calls.push('mute'), unMute: () => calls.push('unmute'), playVideo() {}, seekTo() {}, destroy() {} };
  player.onReady();
  assert.deepEqual(calls, ['mute']); player.destroy();
});

test('normal close cleans immediately; abnormal close reserves the seat until grace expires', () => {
  const text = source('server.js');
  const from = text.indexOf("    if (ws.gameRoom) {", text.indexOf("ws.on('close', (code, reason) => {", text.indexOf("ws.on('message'")));
  const to = text.indexOf('    if (ws.liveStreamId)', from);
  assert.ok(from > 0 && to > from);
  const timers = [], left = [];
  const close = vm.runInNewContext(`(ws, code, wsUser) => { ${text.slice(from, to)} }`, {
    setTimeout: fn => { timers.push(fn); return { unref() {} }; }, removePlayerFromRoom: (room, ws) => left.push(ws)
  });
  close({ gameRoom: {} }, 1000, { id: 7 }); assert.equal(left.length, 1);
  const disconnected = { gameRoom: {} };
  close(disconnected, 1006, { id: 7 }); assert.equal(left.length, 1);
  timers[0](); assert.equal(left.length, 2);
  const resumed = { gameRoom: {} };
  close(resumed, 4002, { id: 7 }); resumed.gameRoom = null; timers[1]();
  assert.equal(left.length, 2, 'old close timeout cannot remove a transferred player');
});

test('client resync closes with the grace code while logout closes normally', () => {
  const Socket = clientClass('JSONSocket', ';// ./js/presenters/SfxPresenter');
  const socket = new Socket('example.invalid'), codes = [];
  socket.socket = { close: code => codes.push(code) };
  socket.close(); socket.reconnecting = true; socket.close();
  assert.deepEqual(codes, [1000, 4002]);
});

test('normal leave keeps the player snapshot needed by existing room-switch handlers', () => {
  const text = source('server.js');
  const code = text.slice(text.indexOf('function removePlayerFromRoom('), text.indexOf('function startBottleTurn('));
  const broadcasts = [];
  const remove = vm.runInNewContext(`${code}; removePlayerFromRoom`, { clearTimeout() {}, broadcastToRoom: (room, ws, msg) => broadcasts.push(msg) });
  const player = { id: '7', seat: 2 }, ws = { gamePlayer: player };
  const room = { players: new Map([[ws, player]]), stickedGifts: new Map([['7', {}]]) };
  ws.gameRoom = room;
  remove(room, ws); remove(room, ws);
  assert.equal(ws.gamePlayer, player, 'room switching clones this snapshot after leave');
  assert.equal(room.players.size, 0); assert.equal(room.stickedGifts.size, 0);
  assert.equal(broadcasts.length, 1); assert.equal(broadcasts[0].type, 'game_leave');
});
