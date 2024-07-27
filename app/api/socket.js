import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
        socket.to(roomId).emit('request-video-url');
      });

      socket.on('video-state-update', (data) => {
        socket.to(data.roomId).emit('video-state-update', {
          currentTime: data.currentTime,
          isPlaying: data.isPlaying,
        });
      });

      socket.on('video-uploaded', (data) => {
        io.to(data.roomId).emit('video-uploaded', data.url);
      });

      socket.on('share-video-url', (data) => {
        socket.to(data.roomId).emit('video-uploaded', data.url);
      });
    });
  }
  res.end();
};

export default SocketHandler;