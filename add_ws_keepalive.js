const fs = require("fs");
const path = "server.js";
let c = fs.readFileSync(path, "utf8");
const marker = "wss.on('connection', (ws, req) => {";
const idx = c.indexOf(marker);
console.log("Tapildi:", idx !== -1);
const pingSetup = `wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
`;
c = c.replace(marker, pingSetup);
const wssMarker = "const wss = new WebSocket.Server({ server, path: '/ws/' });";
const wssIdx = c.indexOf(wssMarker);
console.log("wss tapildi:", wssIdx !== -1);
if (wssIdx !== -1) {
  const pingInterval = wssMarker + `
const wsPingInterval = setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.isAlive === false) {
      console.log('WS: ping cavabsiz, baglanti bagladi');
      return client.terminate();
    }
    client.isAlive = false;
    client.ping();
  });
}, 25000);
`;
  c = c.replace(wssMarker, pingInterval);
}
fs.writeFileSync(path, c, "utf8");
console.log("YAZILDI");
