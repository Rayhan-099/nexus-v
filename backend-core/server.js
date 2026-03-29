const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/trust', require('./routes/trust'));

// Socket.io logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_queue', async (data) => {
    console.log('join_queue event received', data);
    // In a real app, update DB here.
    // data.partnerId, data.newLength
    io.emit('queue_updated', { partnerId: data.partnerId, newLength: data.newLength });
  });

  socket.on('ev_slot_reserved', (data) => {
    console.log('ev_slot_reserved event received', data);
    // data.stationId, data.slotId
    io.emit('station_status_change', { stationId: data.stationId, slotId: data.slotId, status: 'BOOKED' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
