let io;

module.exports = {
  init: (httpServer, corsOptions) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: corsOptions || {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      },
    });

    io.on('connection', (socket) => {
      console.log(`[Socket.IO] مستخدم متصل: ${socket.id}`);

      // Admin room join
      socket.on('join_admin', () => {
        socket.join('admin_room');
        console.log(`[Socket.IO] الأدمن انضم إلى غرفة الإشعارات: ${socket.id}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] مستخدم غادر: ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      console.warn('[Socket.IO] لم يتم تهيئة Socket.IO بعد');
    }
    return io;
  },
};
