'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const router = useRouter();

  const createRoom = () => {
    if (newRoomId.trim()) {
      router.push(`/room/${newRoomId.trim()}`);
    } else {
      alert('Please enter a room ID');
    }
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    } else {
      alert('Please enter a room ID');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Video Sync App</h1>
        
        <div className="mb-4">
          <input
            type="text"
            value={newRoomId}
            onChange={(e) => setNewRoomId(e.target.value)}
            placeholder="Enter new Room ID"
            className="w-full border rounded px-4 py-2 mb-2"
          />
          <button
            onClick={createRoom}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Create Room
          </button>
        </div>

        <div className="flex flex-col">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter existing Room ID"
            className="w-full border rounded px-4 py-2 mb-2"
          />
          <button
            onClick={joinRoom}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}