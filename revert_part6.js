const fs = require("fs");
const path = "C:\\bottle-server-kiraye\\server.js";
const lines = fs.readFileSync(path, "utf8").split("\n");
console.log("LINES BEFORE REVERT:", lines.length);
console.log("Current index 3003:", JSON.stringify(lines[3003]));

const originalBlock = [
"        }} else if (msg.type === 'live_start') {",
"        if (wsUser) {",
"          liveStreams.set(wsUser.id, { hostWs: ws, hostId: wsUser.id, hostName: wsUser.display_name || wsUser.username, viewers: new Set() });",
"          sendGame(ws, { type: 'live_start',  success: true });",
"          DEBUG_GAME_LOGS && debugGame(\x27WS: canli yayin baslandi - \x27 + wsUser.username);",
"        }",
"      } else if (msg.type === 'live_end') {",
"        if (wsUser && liveStreams.has(wsUser.id)) {",
"          const stream = liveStreams.get(wsUser.id);",
"          stream.viewers.forEach(viewerWs => {",
"            sendGame(viewerWs, { type: 'live_ended',  host_id: wsUser.id });",
"          });",
"          liveStreams.delete(wsUser.id);",
"          DEBUG_GAME_LOGS && debugGame(\x27WS: canli yayin bitdi - \x27 + wsUser.username);",
"        }",
"      } else if (msg.type === 'live_frame') {",
"        if (wsUser && liveStreams.has(wsUser.id)) {",
"          const stream = liveStreams.get(wsUser.id);",
"          stream.viewers.forEach(viewerWs => {",
"            if (viewerWs.readyState === WebSocket.OPEN) {",
"              sendGame(viewerWs, { type: 'live_frame',  frame: msg.frame, host_id: wsUser.id });",
"            }",
"          });",
"        }",
"      } else if (msg.type === 'live_audio') {",
"        if (wsUser && liveStreams.has(wsUser.id)) {",
"          const streamA = liveStreams.get(wsUser.id);",
"          streamA.viewers.forEach(viewerWsA => {",
"            if (viewerWsA.readyState === WebSocket.OPEN) {",
"              sendGame(viewerWsA, { type: 'live_audio',  audio: msg.audio, host_id: wsUser.id });",
"            }",
"          });",
"        }"
];

// Replace index 3003 (the botched "}}" line) with the full original block
lines.splice(3003, 1, ...originalBlock);

fs.writeFileSync(path, lines.join("\n"), "utf8");
console.log("LINES AFTER REVERT:", lines.length);
console.log("DONE REVERT");
