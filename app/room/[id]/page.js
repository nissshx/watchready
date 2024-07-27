'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [socket, setSocket] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (id) {
      socketInitializer();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [id]);

  const socketInitializer = async () => {
    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join-room', id);
    });

    newSocket.on('video-state-update', (data) => {
      if (playerRef.current) {
        playerRef.current.currentTime(data.currentTime);
        try {
          if (data.isPlaying) {
            playerRef.current.play();
          } else {
            playerRef.current.pause();
          }
          setIsPlaying(data.isPlaying);
        } catch (error) {
          console.error('Video control error:', error);
        }
      }
    });

    newSocket.on('video-uploaded', (url) => {
      console.log('Received video URL:', url);
      setVideoUrl(url);
    });

    newSocket.on('request-video-url', () => {
      if (videoUrl) {
        newSocket.emit('share-video-url', { roomId: id, url: videoUrl });
      }
    });

    setSocket(newSocket);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', id);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          console.log('Upload response:', data);
          const fullUrl = `http://localhost:5000${data.url}`;
          console.log('Full video URL:', fullUrl);
          setVideoUrl(fullUrl);
          if (socket) {
            socket.emit('video-uploaded', { roomId: id, url: fullUrl });
          }
        } else {
          console.error('Error uploading file:', xhr.statusText);
        }
        setUploadProgress(0); // Reset progress after upload
      };

      xhr.onerror = () => {
        console.error('Error uploading file.');
        setUploadProgress(0); // Reset progress on error
      };

      xhr.open('POST', 'http://localhost:5000/api/upload', true);
      xhr.send(formData);
    }
  };

  const updateVideoState = () => {
    if (playerRef.current && socket) {
      socket.emit('video-state-update', {
        roomId: id,
        currentTime: playerRef.current.currentTime(),
        isPlaying: !playerRef.current.paused(),
      });
    }
  };

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        // Additional configurations if needed
      });

      playerRef.current.on('play', () => setIsPlaying(true));
      playerRef.current.on('pause', () => setIsPlaying(false));
      playerRef.current.on('timeupdate', updateVideoState);

      // Update loading progress
      playerRef.current.on('progress', () => {
        const buffered = playerRef.current.buffered();
        const totalDuration = playerRef.current.duration();
        if (totalDuration > 0) {
          const loadedPercent = (buffered.end(0) / totalDuration) * 100;
          setLoadingProgress(loadedPercent);
        }
      });
    }
  }, [videoUrl]);

  const handleLeaveRoom = async () => {
    if (socket) {
      // Emit event to notify server to delete the video
      socket.emit('delete-video', { roomId: id });

      // Make API call to delete the video from the server
      try {
        await fetch('http://localhost:5000/api/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl }),
        });
        console.log('Video deleted successfully');
        setVideoUrl('');
        router.push('/'); // Redirect to home page
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Room: {id}</h1>
      <input type="file" accept="video/*" onChange={handleFileUpload} className="mb-4" />
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full max-w-2xl bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {videoUrl && (
        <div className="relative w-full max-w-2xl">
          <video
            ref={videoRef}
            className="video-js"
            controls
            preload="auto"
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
          {loadingProgress > 0 && loadingProgress < 100 && (
            <div className="w-full max-w-2xl bg-gray-200 rounded-full h-2.5 absolute bottom-0">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          )}
          <p>Debug: Video URL is {videoUrl}</p>
        </div>
      )}
      
      <button
        onClick={handleLeaveRoom}
        className="bg-red-600 text-white px-4 py-2 rounded mt-4"
      >
        Leave Room and Delete Video
      </button>
    </div>
  );
}
