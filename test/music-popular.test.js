'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createPopular, providerResolver, normalize } = require('../music-popular');
const source = fs.readFileSync(require('node:path').join(__dirname, '../game_v2/preloader_new.js'), 'utf8');
const video = (id = 'abcdefghijk') => ({ id, title: 'Mahnı', duration: 200 });
const audio = { id: 'dp/508', artist: 'Roya', title: 'Unuduldum', duration: 229, url: 'https://music-cdn-wp.ciliz.com/dp/508.mp3', playable: true };
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

test('server coalesces requests, caches 30 minutes, separates providers and expires', async () => {
  let time = 0, calls = 0;
  const gate = deferred();
  const service = createPopular({ now: () => time, resolve: async provider => { calls++; await gate.promise; return provider === 'yt' ? [video()] : [audio]; } });
  const one = service.get('yt'), two = service.get('yt');
  gate.resolve();
  assert.deepEqual(await one, await two); assert.equal(calls, 1);
  time = 29 * 60000; await service.get('yt'); assert.equal(calls, 1);
  assert.equal((await service.get('cz')).items[0].provider, 'cz'); assert.equal(calls, 2);
  time = 30 * 60000 + 1; await service.get('yt'); assert.equal(calls, 3);
});

test('normalization rejects non-playable/mixed results, duplicates and limits to 12', () => {
  const items = Array.from({ length: 20 }, (_, i) => video(String(i).padStart(11, '0')));
  assert.equal(normalize('yt', [...items, audio]).length, 12);
  assert.equal(normalize('yt', [video(), video()]).length, 1);
  const result = normalize('cz', [video(), { ...audio, url: 'https://youtube.com/watch?v=abcdefghijk' }, { ...audio, playable: false }, audio]);
  assert.equal(result.length, 1); assert.equal(result[0].provider, 'cz'); assert.match(result[0].url, /\.mp3$/);
});

test('provider failure and timeout return bounded empty responses, with negative cache', async () => {
  let calls = 0;
  const service = createPopular({ resolve: () => { calls++; throw Error('secret upstream detail'); } });
  assert.deepEqual(await service.get('yt'), { provider: 'yt', items: [], error: 'provider_unavailable' });
  await service.get('yt'); assert.equal(calls, 1);
  let signal;
  const timed = createPopular({ timeoutMs: 5, resolve: (_, s) => { signal = s; return new Promise(() => {}); } });
  assert.equal((await timed.get('cz')).error, 'provider_unavailable'); assert.equal(signal.aborted, true);
});

test('endpoint validates provider and rate limits each client', async () => {
  const service = createPopular({ resolve: async () => [] });
  const response = () => ({ code: 200, status(n) { this.code = n; return this; }, set() {}, json(data) { this.data = data; return this; } });
  const invalid = response(); await service.handler({ query: { provider: 'bad' }, ip: 'a' }, invalid); assert.equal(invalid.code, 400);
  let res;
  for (let i = 0; i < 31; i++) { res = response(); await service.handler({ query: { provider: 'yt' }, ip: 'a' }, res); }
  assert.equal(res.code, 429);
});

test('Ciliz resolves stable IDs and validates real audio before returning it', async () => {
  const urls = [];
  const resolve = providerResolver({ fetchImpl: async (url, options) => {
    urls.push(url);
    if (options.method === 'HEAD') return { ok: true, headers: new Headers({ 'content-type': 'audio/mpeg' }) };
    return { ok: true, json: async () => [{ ...audio, url: audio.url.replace('https:', 'http:') }, { ...audio, id: 'foreign' }] };
  } });
  const result = normalize('cz', await resolve('cz', new AbortController().signal));
  assert.equal(result.length, 1); assert.equal(result[0].url, audio.url);
  assert.match(urls[0], /ids=dp%2F508/); assert.equal(urls[1], audio.url);
});

test('Ciliz rejects HTML responses posing as media', async () => {
  const resolve = providerResolver({ fetchImpl: async (_, options) => options.method === 'HEAD'
    ? { ok: true, headers: new Headers({ 'content-type': 'text/html' }) }
    : { ok: true, json: async () => [audio] } });
  assert.equal(normalize('cz', await resolve('cz', new AbortController().signal)).length, 0);
});

function clientHarness(fetchImpl) {
  const __awaiter = (self, args, _, fn) => new Promise((resolve, reject) => {
    const iterator = fn.apply(self, args || []);
    function step(method, value) { let next; try { next = iterator[method](value); } catch (e) { reject(e); return; } if (next.done) resolve(next.value); else Promise.resolve(next.value).then(v => step('next', v), e => step('throw', e)); }
    step('next');
  });
  const context = vm.createContext({ __awaiter, fetch: fetchImpl, AbortController, setTimeout, clearTimeout, URLSearchParams,
    queryStringBuilder: p => new URLSearchParams(p).toString(), loadJSON: async url => { const r = await fetchImpl(url); return r.json(); },
    request: async (method, p) => { const r = await fetchImpl('/api/youtube/' + method + '?' + new URLSearchParams(p)); return r.json(); },
    debounce: fn => fn, throttle: fn => fn, secondsToMMSS: n => String(n), exception() {}, CompositeVideoService: class {}, OKSocial: class {} });
  const ciliz = source.slice(source.indexOf('const popularMusicCache ='), source.indexOf(';// ./js/music/MusicProvider.ts'));
  const yt = source.slice(source.indexOf('function YTVideoService_item2music'), source.indexOf(';// ./js/presenters/AchievementsViewModel'));
  const presenter = source.slice(source.indexOf('class MusicPresenter {'), source.indexOf("MusicPresenter.defaultTab = 'hot';"));
  vm.runInContext(ciliz + '\n' + yt + '\n' + presenter + '\nthis.Classes = { CilizMusicService, YTVideoService, MusicPresenter };', context);
  return context.Classes;
}

test('empty query uses popular; filled query uses normal search; clearing/reopening reuses provider cache and formats', async () => {
  const calls = [];
  const classes = clientHarness(async url => { calls.push(url); const cz = url.includes('cz') || url.includes('ciliz'); const popular = url.includes('/popular?'); const items = cz ? [audio] : [video()]; return { ok: true, json: async () => popular ? { provider: cz ? 'cz' : 'yt', items } : items }; });
  for (const service of [new classes.YTVideoService({}), new classes.CilizMusicService('/api/ciliz-music', { viewer: {}, detail: {} }, 'web')]) {
    const initial = await service.search('');
    assert.equal(initial[0].provider, service.id); assert.ok(initial[0].song_id); assert.ok(initial[0].url);
    await service.search('Roya');
    const count = calls.length; const cleared = await service.search(''); await service.getPopular();
    assert.equal(calls.length, count); assert.equal(cleared[0].provider, service.id);
  }
  assert.equal(calls.filter(url => url.includes('/api/music/popular?')).length, 2);
  assert.ok(calls.some(url => url.includes('/api/youtube/search?')));
  assert.ok(calls.some(url => url.includes('/api/ciliz-music/search?')));
});

test('client coalesces popular fetches and caches failed responses across reopen', async () => {
  let calls = 0;
  const classes = clientHarness(async () => { calls++; return { ok: false, json: async () => ({ error: 'provider_unavailable', items: [] }) }; });
  const one = new classes.YTVideoService({}), two = new classes.YTVideoService({});
  const results = await Promise.allSettled([one.getPopular(), two.getPopular()]);
  assert.ok(results.every(result => result.status === 'rejected')); assert.equal(calls, 1);
  await assert.rejects(two.getPopular()); assert.equal(calls, 1);
});

test('actual result components preserve purchase callbacks and lazy thumbnails; titles remain text', () => {
  const h = (tag, props, ...children) => ({ tag, props: props || {}, children });
  const ctx = { preact_module_: h, preact_module_k: 'fragment', MusicListDialog_cls: name => 'music-list__' + name };
  const code = source.slice(source.indexOf('const SongAudio ='), source.indexOf('const SongItems ='));
  const components = vm.runInNewContext(code + '; ({ SongAudio, SongVideo });', ctx);
  const title = '<img src=x onerror=alert(1)>', music = { song_id: 'test' };
  const song = { id: 'test', title, music, icon: '/api/thumbnail/abcdefghijk' };
  let purchased;
  const videoNode = components.SongVideo({ song, onPurchase: value => { purchased = value; } });
  const audioNode = components.SongAudio({ song, onPurchase: value => { purchased = value; } });
  videoNode.props.onClick(); assert.equal(purchased, music);
  purchased = null; audioNode.props.onClick({ stopPropagation() {} }); assert.equal(purchased, music);
  const nodes = [];
  function walk(node) { if (!node || typeof node !== 'object') return; nodes.push(node); node.children.forEach(walk); }
  walk(videoNode); walk(audioNode);
  assert.equal(nodes.find(node => node.tag === 'img').props.loading, 'lazy');
  assert.ok(nodes.some(node => node.children.includes(title)));
  assert.ok(nodes.every(node => !node.props.dangerouslySetInnerHTML));
});

test('actual dialog shows popular heading only for empty query and renders loading/empty/error states', () => {
  let query = '', hook = 0, dlg;
  const timers = [], searches = [];
  class Dialog {}
  Dialog.Header = 'header'; Dialog.Content = 'content'; Dialog.Footer = 'footer';
  const ctx = {
    Dialog, bem: () => name => 'music-list__' + name,
    hooks_module_d: initial => [hook++ === 1 ? query : initial, () => {}], hooks_module_A: () => ({ current: null }), hooks_module_y() {},
    useDialog: () => dlg, document: { createElement: () => ({ classList: { add() {} } }) }, setTimeout: fn => timers.push(fn),
    preact_module_: (tag, props, ...children) => ({ tag, props: props || {}, children }), preact_module_k: 'fragment',
    InfiniteScroll: 'infinite-scroll', SongItems: 'song-items'
  };
  const code = source.slice(source.indexOf('const MusicListDialog_cls ='), source.indexOf('const SongAudio ='));
  const Klass = vm.runInNewContext(code + '; MusicListDialog;', ctx);
  const props = { type: 'video', title: { default: 'Klip' }, songs: [], loader: { show: true }, cb: { onsearch: q => searches.push(q) }, emptyTitle: 'Empty' };
  dlg = new Klass({}, props); timers[0](); assert.deepEqual(searches, ['']);
  const render = () => { hook = 0; return JSON.stringify(dlg.JSX(props)); };
  assert.match(render(), /Populyar Azərbaycan klipləri/); assert.match(render(), /music-list__loading/);
  query = 'Roya'; assert.doesNotMatch(render(), /Populyar Azərbaycan mahnıları/);
  query = ''; props.loader.show = false; assert.match(render(), /Populyar Azərbaycan klipləri/); assert.match(render(), /Empty/);
  props.error = true; assert.match(render(), /yükləmək mümkün olmadı/);
  searches.length = 0; dlg.popularClosed = true; timers[0](); assert.equal(searches.length, 0);

  props.type = 'audio'; query = ''; props.error = false;
  assert.match(render(), /Populyar Azərbaycan mahnıları/);
});

function presenterHarness() {
  const { MusicPresenter } = clientHarness(async () => { throw Error('unexpected fetch'); });
  const frames = new Set(), folder = { songs: [], has: () => false, mark() {} };
  const presenter = new MusicPresenter({
    trans: { translate: text => text }, session: { getMusicFolderService: async () => folder }, social: {},
    root: { onEnterFrame: { add: fn => frames.add(fn), remove: fn => frames.delete(fn) } },
    factory: { createMusicListDialog: props => ({ props, updates: 0, setParams(p) { this.props = p; this.updates++; }, open() {}, close() { this.onclose(); } }) }
  }, {});
  presenter.buildVideoFolder = async () => folder;
  return { presenter, frames };
}

for (const type of ['audio', 'video']) {
  test(`${type}: stale success/error, close/reopen and provider failure cannot corrupt UI`, async () => {
    const { presenter, frames } = presenterHarness();
    const requests = [];
    const service = { search: () => { const task = deferred(); requests.push(task); return task.promise; } };
    const open = () => type === 'audio' ? presenter.showAudios(service, () => {}) : presenter.showVideos(service, () => {});
    const dlg = await open();
    dlg.props.cb.onsearch('old'); dlg.props.cb.onsearch('new');
    requests[1].resolve([{ song_id: 'new', title: 'new', provider: type === 'audio' ? 'cz' : 'yt', duration: 2 }]); await tick();
    requests[0].reject(Error('old failure')); await tick();
    assert.equal(dlg.props.songs[0].id, 'new'); assert.equal(dlg.props.error, false);
    dlg.props.cb.onsearch('pending'); dlg.close();
    assert.equal(frames.size, 0); assert.equal(dlg.props.loader.show, false);
    const reopened = await open(); reopened.props.cb.onsearch('fresh');
    requests[3].resolve([{ song_id: 'fresh', title: 'fresh', duration: 2 }]); await tick();
    const updates = dlg.updates;
    requests[2].resolve([{ song_id: 'stale', title: 'stale', duration: 2 }]); await tick();
    assert.equal(dlg.updates, updates); assert.equal(reopened.props.songs[0].id, 'fresh');
    reopened.props.cb.onsearch('error'); requests[4].reject(Error('provider')); await tick();
    assert.equal(reopened.props.songs.length, 0); assert.equal(reopened.props.error, true); assert.equal(reopened.props.loader.show, false);
  });
}
