// Servidor WebSocket para chat de voz (sinalização WebRTC)
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 3001 });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('message', (msg) => {
    // Repasse para todos os outros clientes
    for (const client of clients) {
      if (client !== ws && client.readyState === 1) {
        client.send(msg);
      }
    }
  });
  ws.on('close', () => {
    clients.delete(ws);
  });
});

console.log('Servidor WebSocket de voz rodando na porta 3001');
