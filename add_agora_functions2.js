const fs = require("fs");
const path = "C:\\bottle-server\\live_agora.html";
let c = fs.readFileSync(path, "utf8");
console.log("LEN BEFORE:", c.length);

const old1 = "<script>\n  const requestedRoomId";
console.log("Found:", c.includes(old1));

const agoraCode = "<script>\n" +
"  // ===== AGORA VIDEO/PK INTEQRASIYASI =====\n" +
"  const AGORA_APP_ID = 'ce4f42608570444c8008a141a77e14ce';\n" +
"  let agoraClient = null;\n" +
"  let agoraLocalTracks = { audio: null, video: null };\n" +
"  let agoraRemoteUsers = {};\n" +
"  async function agoraInit() {\n" +
"    if (agoraClient) return agoraClient;\n" +
"    agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });\n" +
"    agoraClient.on('user-published', async (user, mediaType) => {\n" +
"      await agoraClient.subscribe(user, mediaType);\n" +
"      agoraRemoteUsers[user.uid] = user;\n" +
"      if (mediaType === 'video') {\n" +
"        let container = document.getElementById('agora-remote-' + user.uid);\n" +
"        if (!container) {\n" +
"          container = document.createElement('div');\n" +
"          container.id = 'agora-remote-' + user.uid;\n" +
"          container.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;';\n" +
"          const stage = document.getElementById('agora-stage') || document.body;\n" +
"          stage.appendChild(container);\n" +
"        }\n" +
"        user.videoTrack.play(container);\n" +
"      }\n" +
"      if (mediaType === 'audio') { user.audioTrack.play(); }\n" +
"    });\n" +
"    agoraClient.on('user-unpublished', (user) => { delete agoraRemoteUsers[user.uid]; const el = document.getElementById('agora-remote-' + user.uid); if (el) el.remove(); });\n" +
"    return agoraClient;\n" +
"  }\n" +
"  async function agoraStartBroadcast(channelName) {\n" +
"    await agoraInit();\n" +
"    await agoraClient.setClientRole('host');\n" +
"    await agoraClient.join(AGORA_APP_ID, channelName, null, null);\n" +
"    agoraLocalTracks.audio = await AgoraRTC.createMicrophoneAudioTrack();\n" +
"    agoraLocalTracks.video = await AgoraRTC.createCameraVideoTrack();\n" +
"    const stage = document.getElementById('agora-stage');\n" +
"    if (stage) agoraLocalTracks.video.play(stage);\n" +
"    await agoraClient.publish([agoraLocalTracks.audio, agoraLocalTracks.video]);\n" +
"    console.log('AGORA: yayim baslandi - kanal=' + channelName);\n" +
"  }\n" +
"  async function agoraJoinAsViewer(channelName) {\n" +
"    await agoraInit();\n" +
"    await agoraClient.setClientRole('audience');\n" +
"    await agoraClient.join(AGORA_APP_ID, channelName, null, null);\n" +
"    console.log('AGORA: izleyici olaraq qosuldu - kanal=' + channelName);\n" +
"  }\n" +
"  async function agoraLeave() {\n" +
"    if (agoraLocalTracks.audio) { agoraLocalTracks.audio.close(); agoraLocalTracks.audio = null; }\n" +
"    if (agoraLocalTracks.video) { agoraLocalTracks.video.close(); agoraLocalTracks.video = null; }\n" +
"    if (agoraClient) { await agoraClient.leave(); }\n" +
"    console.log('AGORA: kanaldan cixildi');\n" +
"  }\n" +
"  // ===== AGORA SONU =====\n" +
"  const requestedRoomId";

c = c.replace(old1, agoraCode);

fs.writeFileSync(path, c, "utf8");
console.log("LEN AFTER:", c.length);
console.log("DONE");
