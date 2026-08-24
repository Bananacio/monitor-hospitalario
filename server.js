const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares para procesar JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Servir la vista principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Endpoint POST que recibe la alerta enviada por la Raspberry Pi / ESP32
app.post('/api/alerta', (req, res) => {
  const { ritmo, estado, mensaje } = req.body;

  if (ritmo === undefined || !estado) {
    return res.status(400).json({ error: 'Faltan parámetros (ritmo, estado)' });
  }

  const datosAlerta = {
    ritmo,
    estado,
    mensaje: mensaje || 'Alerta de ritmo cardíaco',
    timestamp: new Date().toLocaleTimeString()
  };

  // Reemitir en tiempo real mediante WebSockets a la web
  io.emit('nueva-alerta', datosAlerta);

  return res.status(200).json({ status: 'ok', mensaje: 'Alerta procesada' });
});

// Eventos de conexión de Socket.io
io.on('connection', (socket) => {
  console.log('Cliente web conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente web desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de monitoreo activo en el puerto ${PORT}`);
});