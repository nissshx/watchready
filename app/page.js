'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId) {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Video Sync App</h1>
        <button
          onClick={createRoom}
          className="w-full bg-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-600"
        >
          Create Room
        </button>
        <div className="flex">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="flex-grow border rounded-l px-4 py-2"
          />
          <button
            onClick={joinRoom}
            className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}