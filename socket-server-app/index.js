const { WebSocketServer } = require('ws');

// Le port 3001 est utilisé car Caddy est configuré pour rediriger le trafic vers ce port.
const wss = new WebSocketServer({ port: 3001 });

console.log('🚀 Le serveur WebSocket est en écoute sur le port 3001...');

// Un Set pour stocker toutes les connexions client actives.
const clients = new Set();

wss.on('connection', function connection(ws) {
  clients.add(ws);
  console.log('✅ Un client vient de se connecter. Total des clients :', clients.size);

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('📥 Message reçu: %s', data);

    // Rediffuse le message à tous les clients connectés.
    for (const client of clients) {
      if (client.readyState === ws.OPEN) {
        client.send(data.toString());
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('🔌 Un client s\'est déconnecté. Total des clients :', clients.size);
  });
});
