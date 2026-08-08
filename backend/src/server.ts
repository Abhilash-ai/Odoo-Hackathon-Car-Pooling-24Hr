import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import orgRoutes from './routes/organization.js';
import vehicleRoutes from './routes/vehicles.js';
import rideRoutes from './routes/rides.js';
import bookingRoutes from './routes/bookings.js';
import tripRoutes from './routes/trips.js';
import walletRoutes from './routes/wallet.js';
import savedPlacesRoutes from './routes/savedPlaces.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chat.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organization', orgRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/saved-places', savedPlacesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', product: 'ODOO COMMUTE', time: new Date().toISOString() });
});

// Socket.IO Realtime Layer for Hero Live Commute Tracking & Chat
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Join trip room for live vehicle tracking
  socket.on('join_trip', (tripId: string) => {
    socket.join(`trip_${tripId}`);
    console.log(`[Socket ${socket.id}] Joined room: trip_${tripId}`);
  });

  // Driver emits GPS update
  socket.on('update_location', (data: { tripId: string; lat: number; lng: number; etaMins?: number; distanceKm?: number }) => {
    io.to(`trip_${data.tripId}`).emit('location_updated', data);
  });

  // Trip Status Change (Start / Complete)
  socket.on('trip_status_changed', (data: { tripId: string; status: string }) => {
    io.to(`trip_${data.tripId}`).emit('trip_status_updated', data);
  });

  // Chat message emit
  socket.on('send_message', (data: { tripId: string; senderName: string; senderId: string; content: string; createdAt: string }) => {
    io.to(`trip_${data.tripId}`).emit('new_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ODOO COMMUTE Backend Server running on port ${PORT}`);
  console.log(`====================================================`);
});
