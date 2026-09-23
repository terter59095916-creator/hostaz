const fs = require("fs");
const path = "C:\\bottle-server\\live_agora.html";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "<script>\r\n";
console.log("Found (first occurrence check via indexOf):", c.indexOf(old1));

const agoraCode = "<script>\r\n" +
"  // ===== AGORA VIDEO/PK INTEQRASIYASI =====\r\n" +
"  const AGORA_APP_ID = 'ce4f42608570444c8008a141a77e14ce';\r\n" +
"  let agoraClient = null;\r\n" +
"  let agoraLocalTracks = { audio: null, video: null };\r\n" +
"  let agoraRemoteUsers = {};\r\n" +
"  async function agoraInit() {\r\n" +
"    if (agoraClient) return agoraClient;\r\n" +
"    agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });\r\n" +
"    agoraClient.on('user-published', async (user, mediaType) => {\r\n" +
"      await agoraClient.subscribe(user, mediaType);\r\n" +
"      agoraRemoteUsers[user.uid] = user;\r\n" +
"      if (mediaType === 'video') {\r\n" +
"        let container = document.getElementById('agora-remote-' + user.uid);\r\n" +
"        if (!container) {\r\n" +
"          container = document.createElement('div');\r\n" +
"          container.id = 'agora-remote-' + user.uid;\r\n" +
"          container.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;';\r\n" +
"          const stage = document.getElementById('agora-stage') || document.body;\r\n" +
"          stage.appendChild(container);\r\n" +
"        }\r\n" +
"        user.videoTrack.play(container);\r\n" +
"      }\r\n" +
"      if (mediaType === 'audio') { user.audioTrack.play(); }\r\n" +
"    });\r\n" +
"    agoraClient.on('user-unpublished', (user) => { delete agoraRemoteUsers[user.uid]; const el = document.getElementById('agora-remote-' + user.uid); if (el) el.remove(); });\r\n" +
"    return agoraClient;\r\n" +
"  }\r\n" +
"  async function agoraStartBroadcast(channelName) {\r\n" +
"    await agoraInit();\r\n" +
"    await agoraClient.setClientRole('host');\r\n" +
"    await agoraClient.join(AGORA_APP_ID, channelName, null, null);\r\n" +
"    agoraLocalTracks.audio = await AgoraRTC.createMicrophoneAudioTrack();\r\n" +
"    agoraLocalTracks.video = await AgoraRTC.createCameraVideoTrack();\r\n" +
"    const stage = document.getElementById('agora-stage');\r\n" +
"    if (stage) agoraLocalTracks.video.play(stage);\r\n" +
"    await agoraClient.publish([agoraLocalTracks.audio, agoraLocalTracks.video]);\r\n" +
"    console.log('AGORA: yayim baslandi - kanal=' + channelName);\r\n" +
"  }\r\n" +
"  async function agoraJoinAsViewer(channelName) {\r\n" +
"    await agoraInit();\r\n" +
"    await agoraClient.setClientRole('audience');\r\n" +
"    await agoraClient.join(AGORA_APP_ID, channelName, null, null);\r\n" +
"    console.log('AGORA: izleyici olaraq qosuldu - kanal=' + channelName);\r\n" +
"  }\r\n" +
"  async function agoraLeave() {\r\n" +
"    if (agoraLocalTracks.audio) { agoraLocalTracks.audio.close(); agoraLocalTracks.audio = null; }\r\n" +
"    if (agoraLocalTracks.video) { agoraLocalTracks.video.close(); agoraLocalTracks.video = null; }\r\n" +
"    if (agoraClient) { await agoraClient.leave(); }\r\n" +
"    console.log('AGORA: kanaldan cixildi');\r\n" +
"  }\r\n" +
"  // ===== AGORA SONU =====\r\n";

c = c.replace(old1, agoraCode);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
