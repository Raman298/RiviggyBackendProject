
const GroupOrder = require('../models/GroupOrder');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a group order room
    socket.on('joinGroupRoom', async ({ groupCode, userId, userName }) => {
      socket.join(`group_${groupCode}`);
      console.log(`${userName} joined group room: ${groupCode}`);
      // Notify others
      socket.to(`group_${groupCode}`).emit('userOnline', { userId, userName });
    });

    // Leave group room
    socket.on('leaveGroupRoom', ({ groupCode, userId, userName }) => {
      socket.leave(`group_${groupCode}`);
      socket.to(`group_${groupCode}`).emit('userOffline', { userId, userName });
    });

    // Track order status
    socket.on('trackOrder', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Typing/activity indicator in group
    socket.on('userTyping', ({ groupCode, userName }) => {
      socket.to(`group_${groupCode}`).emit('userTyping', { userName });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
