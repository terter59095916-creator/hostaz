'use strict';

// A separate LiveKit room for group camera/microphone conversations.
// Uses the project's existing jsonwebtoken dependency and LiveKit's RoomService API.
const jwt = require('jsonwebtoken');

module.exports = function installVideoRooms(app, { authLib, db, findRoom, env = process.env, fetchImpl = fetch }) {
  const maxParticipants = 12;
  let countCache = {}, countsUntil = 0, countRequest = null;

  // Kiraye servisini esas saytin goruntulu otagindan ayri saxlayir.
  // Isteye gore Railway-de LIVEKIT_ROOM_PREFIX ile deyisdirile biler.
  const roomPrefix = String(env.LIVEKIT_ROOM_PREFIX || 'ikiurey-kiraye-video-room')
    .trim().replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 80) || 'ikiurey-kiraye-video-room';

  function config() {
    const url = String(env.LIVEKIT_URL || '').trim();
    const key = String(env.LIVEKIT_API_KEY || '').trim();
    const secret = String(env.LIVEKIT_API_SECRET || '').trim();
    if (!url || !key || !secret) throw new Error('video_room_not_configured');
    let parsed;
    try { parsed = new URL(url); } catch (_) { throw new Error('video_room_not_configured'); }
    if (!['wss:', 'ws:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('video_room_not_configured');
    return { url: parsed.href, httpUrl: parsed.href.replace(/^ws/, 'http'), key, secret };
  }

  function tokenFor(c, claims, identity) {
    return jwt.sign(claims, c.secret, { algorithm: 'HS256', issuer: c.key, subject: identity, expiresIn: '10m', notBefore: 0 });
  }

  async function service(c, method, body, grant, timeoutMs = 8000) {
    const response = await fetchImpl(new URL('/twirp/livekit.RoomService/' + method, c.httpUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tokenFor(c, { video: grant }, 'video-room-service') },
      body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) throw new Error('video_room_service_unavailable');
    return response.json();
  }

  app.post('/api/video-room/:id/token', authLib.requireUser, async (req, res) => {
    res.set('Cache-Control', 'no-store, private');
    const room = findRoom(String(req.params.id));
    if (!room || !room.isVideoCallRoom) return res.status(404).json({ error: 'video_room_not_found' });
    try {
      const user = db.prepare('SELECT id, username, display_name, avatar_data FROM users WHERE id = ?').get(req.user.id);
      if (!user) return res.status(401).json({ error: 'invalid_user' });
      const c = config(), roomName = roomPrefix + '-' + room.id;
      await service(c, 'CreateRoom', { name: roomName, empty_timeout: 120, departure_timeout: 20, max_participants: maxParticipants }, { roomCreate: true });
      const identity = 'user-' + user.id;
      const token = tokenFor(c, {
        name: String(user.display_name || user.username || 'Oyunçu').slice(0, 100),
        metadata: JSON.stringify({ photo: user.avatar_data ? '/api/avatar/' + user.id : '' }),
        video: { room: roomName, roomJoin: true, canSubscribe: true, canPublish: true, canPublishData: true, canPublishSources: ['camera', 'microphone'], canUpdateOwnMetadata: false }
      }, identity);
      res.json({ url: c.url, token, identity, roomName, maxParticipants });
    } catch (error) {
      const code = error.message === 'video_room_not_configured'
        ? 'video_room_not_configured' : 'video_room_service_unavailable';
      res.status(503).json({ error: code });
    }
  });

  async function counts(roomIds) {
    if (Date.now() < countsUntil) return countCache;
    if (countRequest) return countRequest;
    countRequest = (async () => {
      try {
        const c = config();
        const data = await service(c, 'ListRooms', { names: roomIds.map(id => roomPrefix + '-' + id) }, { roomList: true }, 2500);
        const next = {};
        for (const id of roomIds) {
          const info = (data.rooms || []).find(room => room.name === roomPrefix + '-' + id);
          next[id] = info ? Number(info.num_participants || info.numParticipants || 0) : 0;
        }
        countCache = next;
      } catch (_) { /* Music rooms remain accessible if the media service is temporarily down. */ }
      countsUntil = Date.now() + 5000;
      return countCache;
    })();
    try { return await countRequest; } finally { countRequest = null; }
  }
  return { counts };
};
