const socketIo = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: "*", // Adjust this in production to specific origins
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('A user connected: ', socket.id);

      socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      });

      socket.on('send_message', async (data) => {
        try {
          const Message = require('./models/Message');
          const newMessage = new Message({
            senderId: data.senderId,
            receiverId: data.receiverId,
            text: data.text
          });
          await newMessage.save();
          
          io.to(data.receiverId.toString()).emit('receive_message', newMessage);
          io.to(data.senderId.toString()).emit('receive_message', newMessage);
        } catch (error) {
          console.error("Chat error:", error);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
