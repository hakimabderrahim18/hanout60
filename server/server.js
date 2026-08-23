require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const socketUtils = require('./utils/socket');
const errorHandler = require('./middlewares/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
socketUtils.init(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    store: 'Hanout 60 (حانوت 60)',
    location: 'Souk el Fellah, Tiaret, Algeria',
    time: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 خادم حانوت 60 (Hanout 60 Server) يعمل على المنفذ: ${PORT}`);
  console.log(`📍 العنوان: سوق الفلاح، تيارت، الجزائر`);
  console.log(`🌐 رابط الخادم: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
