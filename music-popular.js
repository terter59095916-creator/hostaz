'use strict';

const TTL = 30 * 60 * 1000;
const QUERIES = ['Roya', 'Miri Yusif', 'Aygun Kazimova'];
// Verified Azerbaijani catalogue entry; stream URLs always come from Ciliz.
const AUDIO_IDS = ['dp/508']; // Roya — Unuduldum

function normalize(provider, items) {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).filter(item => {
    if (!item || !item.id || !item.title || !(item.duration > 0) || seen.has(String(item.id))) return false;
    if (provider === 'yt' && !/^[\w-]{11}$/.test(item.id)) return false;
    if (provider === 'cz' && (!item.playable || !/^https:\/\/music-cdn-wp\.ciliz\.com\//.test(item.url))) return false;
    seen.add(String(item.id));
    return true;
  }).slice(0, 12).map(item => provider === 'yt'
    ? { id: item.id, title: item.title, duration: item.duration, icon: '/api/thumbnail/' + item.id }
    : { id: item.id, title: item.title, artist: item.artist || '', duration: item.duration, url: item.url, provider: 'cz' });
}

function createPopular({ resolve, now = Date.now, timeoutMs = 10000 }) {
  const cache = new Map(), pending = new Map(), clients = new Map();
  async function get(provider) {
    if (!['yt', 'cz'].includes(provider)) throw new Error('invalid_provider');
    const hit = cache.get(provider);
    if (hit && hit.expires > now()) return hit.result;
    if (pending.has(provider)) return pending.get(provider);
    const controller = new AbortController();
    let timer;
    const task = Promise.race([
      Promise.resolve().then(() => resolve(provider, controller.signal)),
      new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('timeout')); }, timeoutMs); })
    ]).then(items => ({ provider, items: normalize(provider, items), error: null }))
      .catch(() => ({ provider, items: [], error: 'provider_unavailable' }))
      .then(result => { cache.set(provider, { result, expires: now() + (result.error ? 60000 : TTL) }); return result; })
      .finally(() => { clearTimeout(timer); pending.delete(provider); });
    pending.set(provider, task);
    return task;
  }
  async function handler(req, res) {
    const provider = req.query.provider;
    if (!['yt', 'cz'].includes(provider)) return res.status(400).json({ items: [], error: 'invalid_provider' });
    const time = now(), key = req.ip;
    for (const [ip, entry] of clients) if (entry.until <= time) clients.delete(ip);
    const client = clients.get(key) || { count: 0, until: time + 60000 };
    if (clients.size >= 10000 && !clients.has(key)) return res.status(429).json({ provider, items: [], error: 'rate_limited' });
    clients.set(key, client);
    if (++client.count > 30) return res.status(429).json({ provider, items: [], error: 'rate_limited' });
    res.set('Cache-Control', 'no-store');
    const result = await get(provider);
    return res.status(result.error ? 503 : 200).json(result);
  }
  return { get, handler };
}

function providerResolver({ getInnertube, fetchImpl = fetch }) {
  return async (provider, signal) => {
    const groups = await Promise.all((provider === 'yt' ? QUERIES : [null]).map(async query => {
      if (provider === 'yt') {
        const youtube = await getInnertube();
        if (signal.aborted) throw new Error('timeout');
        const result = await youtube.search(query + ' official music video', { type: 'video' });
        return (result.videos || []).slice(0, 4).map(item => ({
          id: item.id || item.video_id, title: item.title && item.title.text,
          duration: item.duration && item.duration.seconds
        }));
      }
      const response = await fetchImpl('https://music.ciliz.com/api/get_by_ids_and_popular?count=0&ids=' + encodeURIComponent(AUDIO_IDS.join(',')), { signal });
      if (!response.ok) throw new Error('provider_unavailable');
      const items = await response.json();
      if (!Array.isArray(items)) throw new Error('invalid_response');
      return Promise.all(items.filter(item => AUDIO_IDS.includes(item.id)).slice(0, 12).map(async item => {
        const url = String(item.url || '').replace(/^http:/, 'https:');
        if (!/^https:\/\/music-cdn-wp\.ciliz\.com\//.test(url)) return null;
        try {
          const media = await fetchImpl(url, { method: 'HEAD', signal, redirect: 'error' });
          return media.ok && /^audio\//i.test(media.headers.get('content-type') || '') ? { ...item, url, playable: true } : null;
        } catch { return null; }
      }));
    }));
    return groups.flat();
  };
}

module.exports = { createPopular, providerResolver, normalize };
