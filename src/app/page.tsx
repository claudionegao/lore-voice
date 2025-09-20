"use client";

import React, { useState } from 'react';
import { Room, UserRole } from '../types';
import { RoomList } from './components/RoomList';
import { CreateRoomForm } from './components/CreateRoomForm';
import { UserRoleSelector } from './components/UserRoleSelector';

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
  color: '#fff',
  fontFamily: 'Inter, Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem 0',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(30,30,40,0.95)',
  borderRadius: '1rem',
  boxShadow: '0 4px 24px #0004',
  padding: '2rem',
  margin: '1rem 0',
  width: '100%',
  maxWidth: 420,
};

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>("");

  const handleCreateRoom = (data: { name: string; password?: string; maxPlayers?: number; maxListeners?: number }) => {
    const newRoom: Room = {
      id: Math.random().toString(36).slice(2),
      name: data.name,
      password: data.password,
      ownerId: 'narrator',
      maxPlayers: data.maxPlayers,
      maxListeners: data.maxListeners,
      users: [],
      narrators: [],
      mutedPlayers: [],
      bannedPlayers: [],
      allowedToHearNarrator: {},
      votes: {},
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId));
    if (currentRoom && currentRoom.id === roomId) {
      setCurrentRoom(null);
      setUserRole(null);
      setUserName("");
    }
  };

  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setCurrentRoom(room);
      setUserRole(null); // Forçar seleção de tipo ao entrar na sala
      setUserName("");
    }
  };

  // Geração de nome aleatório simples
  function generateRandomName() {
    return 'User_' + Math.random().toString(36).substring(2, 8);
  }

  if (currentRoom && !userRole) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={{marginBottom: 16}}>Entrar na sala: {currentRoom.name}</h2>
          <UserRoleSelector onSelect={role => {
            setUserRole(role);
            setUserName(generateRandomName());
          }} />
        </div>
      </div>
    );
  }

  if (currentRoom && userRole) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2>Sala: {currentRoom.name}</h2>
          <p>Você entrou como <b>{userRole}</b> com nome <b>{userName}</b>.</p>
          {/* Aqui vai a interface da sala futuramente */}
          <button style={{marginTop: 24}} onClick={() => { setCurrentRoom(null); setUserRole(null); setUserName(""); }}>Sair da sala</button>
        </div>
      </div>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{fontWeight: 700, fontSize: 32, marginBottom: 24, textAlign: 'center'}}>LoreVoice</h1>
        <CreateRoomForm onCreate={handleCreateRoom} />
      </div>
      <div style={{...cardStyle, maxWidth: 600}}>
        <RoomList rooms={rooms} onJoin={handleJoinRoom} onDelete={handleDeleteRoom} />
      </div>
    </main>
  );
}
