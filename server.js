const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3328 });

server.on('connection', socket => {
  console.log('Client connected');
  socket.send('Welcome client!');

  socket.on('message', msg => {
    console.log('Received:', msg);
    socket.send(`You said: ${msg}`);
  });
});
