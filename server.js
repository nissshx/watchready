const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.roomId + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Handle file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).send('No file uploaded.');
  }
  console.log('File uploaded:', req.file);
  const fileUrl = `/uploads/${req.file.filename}`;
  console.log('File URL:', fileUrl);
  res.json({ url: fileUrl });
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('New client connected');

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

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));