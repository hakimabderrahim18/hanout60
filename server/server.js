require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
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
const CLIENT_URL = process.env.CLIENT_URL || 'https://hanout60.vercel.app';
socketUtils.init(server, {
  cors: {
    origin: '*',
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

// Health Check API
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

// Root route or static client SPA serving
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
} else {
  // If client is deployed on Vercel separately, provide helpful API root info
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      message: 'خادم حانوت 60 يعمل بنجاح (Hanout 60 API Server is Running)',
      frontend: 'https://hanout60.vercel.app',
      location: 'Centre Commercial Souk el Fellah, Tiaret, Algérie',
    });
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 خادم حانوت 60 (Hanout 60 Server) يعمل على المنفذ: ${PORT}`);
  console.log(`📍 العنوان: سوق الفلاح، تيارت، الجزائر`);
  console.log(`🌐 واجهة المتجر: https://hanout60.vercel.app`);
  console.log(`=========================================`);
});
