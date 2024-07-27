'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

export default function Room() {
  const params = useParams();
  const id = params.id;
  const [videoUrl, setVideoUrl] = useState('');
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (id) {
      socketInitializer();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id]);

  const socketInitializer = async () => {
    await fetch('/api/socket');
    const newSocket = io();

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join-room', id);
    });

    newSocket.on('video-state-update', (data) => {
      if (videoRef.current) {
        videoRef.current.currentTime = data.currentTime;
        if (data.isPlaying) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
        setIsPlaying(data.isPlaying);
      }
    });

    setSocket(newSocket);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const updateVideoState = () => {
    if (videoRef.current && socket) {
      socket.emit('video-state-update', {
        roomId: id,
        currentTime: videoRef.current.currentTime,
        isPlaying: !videoRef.current.paused,
      });
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      updateVideoState();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Room: {id}</h1>
      <input type="file" accept="video/*" onChange={handleFileUpload} className="mb-4" />
      {videoUrl && (
        <div className="relative">
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-w-2xl"
            onTimeUpdate={updateVideoState}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <button
              onClick={handlePlayPause}
              className="bg-white text-black px-4 py-2 rounded"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}