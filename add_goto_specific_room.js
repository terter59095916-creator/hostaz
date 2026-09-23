const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "} else if (msg.type === \x27goto_user\x27) {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const newHandler = `} else if (msg.type === 'goto_specific_room') {
        console.log('WS: goto_specific_room alindi - target=' + msg.room_id);
        const targetRoomId = Number(msg.room_id);
        const targetRoom = rooms.get(targetRoomId);
        if (targetRoom && targetRoom.players.size < MAX_SEATS) {
          if (ws.gameRoom) {
            removePlayerFromRoom(ws.gameRoom, ws);
          }
          const destSeatX = getNextSeatInRoom(targetRoom);
          let rejoinedPlayerX = ws.gamePlayer ? Object.assign({}, ws.gamePlayer, { seat: destSeatX }) : null;
          if (rejoinedPlayerX) {
            delete rejoinedPlayerX.ava_gift;
            delete rejoinedPlayerX.ava_gift_random;
            delete rejoinedPlayerX.hat;
            delete rejoinedPlayerX.drink;
            if (rejoinedPlayerX.id && targetRoom.stickedGifts.has(rejoinedPlayerX.id)) {
              const freshGiftsX = targetRoom.stickedGifts.get(rejoinedPlayerX.id);
              if (freshGiftsX.ava_gift) { rejoinedPlayerX.ava_gift = freshGiftsX.ava_gift; rejoinedPlayerX.ava_gift_random = freshGiftsX.ava_gift_random; }
              if (freshGiftsX.hat) rejoinedPlayerX.hat = freshGiftsX.hat;
              if (freshGiftsX.drink) rejoinedPlayerX.drink = freshGiftsX.drink;
            }
            const othersX = [];
            targetRoom.players.forEach(p => othersX.push(p));
            targetRoom.players.set(ws, rejoinedPlayerX);
            ws.gamePlayer = rejoinedPlayerX;
            ws.gameRoom = targetRoom;
            const reGameEnterX = {
              type: 'game_enter',
              packet: ws.packetCounter++,
              game_id: targetRoom.gameId,
              bottle_type: targetRoom.bottleType || 'vipbottle',
              participants: [rejoinedPlayerX, ...othersX]
            };
            ws.send(encodeMessage(reGameEnterX));
            if (targetRoom.chatHistory && targetRoom.chatHistory.length > 0) {
              const cleanHistoryX = targetRoom.chatHistory.map(function(histMsg) {
                const freshMsg = Object.assign({}, histMsg);
                delete freshMsg.packet;
                return freshMsg;
              });
              ws.send(encodeMessage({ type: 'game_chat_history', messages: cleanHistoryX, packet: ws.packetCounter = (ws.packetCounter || 1000) + 1 }));
            }
            console.log('WS: konkret masaya qowuldu - masa=' + targetRoom.gameId);
            broadcastToRoom(targetRoom, ws, { type: 'game_join', user: rejoinedPlayerX });
            startBottleTurn(targetRoom);
          }
        } else {
          ws.send(encodeMessage({ type: 'room_join_error', reason: targetRoom ? 'room_full' : 'room_not_found', packet: ws.packetCounter = (ws.packetCounter || 1000) + 1 }));
        }
      } else if (msg.type === 'goto_user') {`;
c = c.replace(marker, newHandler);
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
