const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "} else if (msg.type === 'goto_user') {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const liveHandlers = `} else if (msg.type === 'start_live') {
        if (!wsUser) { ws.send(encodeMessage({ type: 'live_error', reason: 'not_logged_in', packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }
        const streamId = nextStreamId++;
        const stream = {
          id: streamId,
          broadcasterWs: ws,
          broadcasterId: wsUser.id,
          broadcasterName: wsUser.display_name || wsUser.username,
          broadcasterPhoto: wsUser.avatar_data ? ('/api/avatar/' + wsUser.id) : '',
          hasCamera: Boolean(msg.has_camera),
          photoData: msg.photo_data || null,
          viewers: new Map(),
          likes: 0,
          chatHistory: [],
          startedAt: Date.now()
        };
        liveStreamsMap.set(streamId, stream);
        ws.liveStreamId = streamId;
        ws.send(encodeMessage({ type: 'live_started', stream_id: streamId, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
        console.log('WS: canli yayim baslandi - ' + stream.broadcasterName + ' id=' + streamId);
      } else if (msg.type === 'stop_live') {
        const streamId = ws.liveStreamId;
        const stream = streamId ? liveStreamsMap.get(streamId) : null;
        if (stream) {
          stream.viewers.forEach((uid, vws) => {
            try { vws.send(encodeMessage({ type: 'live_ended', stream_id: streamId, packet: vws.packetCounter=(vws.packetCounter||1000)+1 })); } catch(e) {}
          });
          liveStreamsMap.delete(streamId);
          console.log('WS: canli yayim bitdi - id=' + streamId);
        }
        ws.liveStreamId = null;
      } else if (msg.type === 'get_live_list') {
        const list = [];
        liveStreamsMap.forEach((s) => {
          list.push({ id: s.id, name: s.broadcasterName, photo: s.broadcasterPhoto, has_camera: s.hasCamera, viewer_count: s.viewers.size, likes: s.likes });
        });
        ws.send(encodeMessage({ type: 'live_list', streams: list, packet: ws.packetCounter=(ws.packetCounter||1000)+1 }));
      } else if (msg.type === 'join_live') {
        const stream = liveStreamsMap.get(Number(msg.stream_id));
        if (!stream) { ws.send(encodeMessage({ type: 'live_error', reason: 'not_found', packet: ws.packetCounter=(ws.packetCounter||1000)+1 })); return; }
        stream.viewers.set(ws, wsUser ? wsUser.id : null);
        ws.watchingStreamId = stream.id;
        ws.send(encodeMessage({
          type: 'live_joined', stream_id: stream.id, broadcaster_name: stream.broadcasterName, broadcaster_photo: stream.broadcasterPhoto,
          has_camera: stream.hasCamera, photo_data: stream.photoData, likes: stream.likes, viewer_count: stream.viewers.size,
          chat_history: stream.chatHistory.slice(-30), packet: ws.packetCounter=(ws.packetCounter||1000)+1
        }));
        try {
          stream.broadcasterWs.send(encodeMessage({ type: 'live_viewer_joined', viewer_id: wsUser ? String(wsUser.id) : 'guest', viewer_name: wsUser ? (wsUser.display_name || wsUser.username) : 'Qonaq', viewer_count: stream.viewers.size, packet: stream.broadcasterWs.packetCounter=(stream.broadcasterWs.packetCounter||1000)+1 }));
        } catch(e) {}
        console.log('WS: canli yayima qosuldu - stream=' + stream.id + ' baxan sayi=' + stream.viewers.size);
      } else if (msg.type === 'leave_live') {
        const stream = liveStreamsMap.get(Number(msg.stream_id));
        if (stream && stream.viewers.has(ws)) {
          stream.viewers.delete(ws);
          try {
            stream.broadcasterWs.send(encodeMessage({ type: 'live_viewer_left', viewer_count: stream.viewers.size, packet: stream.broadcasterWs.packetCounter=(stream.broadcasterWs.packetCounter||1000)+1 }));
          } catch(e) {}
        }
        ws.watchingStreamId = null;
      } else if (msg.type === 'webrtc_offer' || msg.type === 'webrtc_answer' || msg.type === 'webrtc_ice') {
        const stream = liveStreamsMap.get(Number(msg.stream_id));
        if (!stream) return;
        if (msg.type === 'webrtc_offer') {
          let targetWs = null;
          stream.viewers.forEach((uid, vws) => { if (String(uid) === String(msg.target_id) || (!uid && msg.target_id === 'guest')) targetWs = vws; });
          if (targetWs) targetWs.send(encodeMessage({ type: 'webrtc_offer', sdp: msg.sdp, from_broadcaster: true, packet: targetWs.packetCounter=(targetWs.packetCounter||1000)+1 }));
        } else if (msg.type === 'webrtc_answer') {
          stream.broadcasterWs.send(encodeMessage({ type: 'webrtc_answer', sdp: msg.sdp, viewer_id: wsUser ? String(wsUser.id) : 'guest', packet: stream.broadcasterWs.packetCounter=(stream.broadcasterWs.packetCounter||1000)+1 }));
        } else if (msg.type === 'webrtc_ice') {
          if (ws === stream.broadcasterWs) {
            let targetWs = null;
            stream.viewers.forEach((uid, vws) => { if (String(uid) === String(msg.target_id) || (!uid && msg.target_id === 'guest')) targetWs = vws; });
            if (targetWs) targetWs.send(encodeMessage({ type: 'webrtc_ice', candidate: msg.candidate, from_broadcaster: true, packet: targetWs.packetCounter=(targetWs.packetCounter||1000)+1 }));
          } else {
            stream.broadcasterWs.send(encodeMessage({ type: 'webrtc_ice', candidate: msg.candidate, viewer_id: wsUser ? String(wsUser.id) : 'guest', packet: stream.broadcasterWs.packetCounter=(stream.broadcasterWs.packetCounter||1000)+1 }));
          }
        }
      } else if (msg.type === 'live_chat') {
        const stream = liveStreamsMap.get(Number(msg.stream_id));
        if (!stream || !msg.text || !msg.text.trim()) return;
        const chatMsg = { name: wsUser ? (wsUser.display_name || wsUser.username) : 'Qonaq', text: msg.text.trim().slice(0, 200), ts: Date.now() };
        stream.chatHistory.push(chatMsg);
        if (stream.chatHistory.length > 50) stream.chatHistory.shift();
        const payload = { type: 'live_chat', name: chatMsg.name, text: chatMsg.text };
        try { stream.broadcasterWs.send(encodeMessage(Object.assign({}, payload, { packet: stream.broadcasterWs.packetCounter=(stream.broadcasterWs.packetCounter||1000)+1 }))); } catch(e) {}
        stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage(Object.assign({}, payload, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {} });
      } else if (msg.type === 'live_like') {
        const stream = liveStreamsMap.get(Number(msg.stream_id));
        if (!stream) return;
        stream.likes++;
        const payload = { type: 'live_likes', likes: stream.likes };
        try { stream.broadcasterWs.send(encodeMessage(Object.assign({}, payload, { packet: stream.broadcasterWs.packetCounter=(stream.broadcasterWs.packetCounter||1000)+1 }))); } catch(e) {}
        stream.viewers.forEach((uid, vws) => { try { vws.send(encodeMessage(Object.assign({}, payload, { packet: vws.packetCounter=(vws.packetCounter||1000)+1 }))); } catch(e) {} });
      } else if (msg.type === 'goto_user') {`;
c = c.replace(marker, liveHandlers);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
