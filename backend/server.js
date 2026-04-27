require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeWhatsApp, getWhatsAppStatus } = require('./services/whatsappService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize WhatsApp
if (process.env.WHATSAPP_ENABLED === 'true') {
  console.log('🚀 Initializing WhatsApp...');
  initializeWhatsApp();
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Student Attendance Tracking System API' });
});

// WhatsApp status endpoint
app.get('/api/whatsapp-status', (req, res) => {
  const status = getWhatsAppStatus();
  res.json(status);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
