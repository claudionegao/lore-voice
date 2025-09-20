"use client";
import React, { useState } from 'react';

type Props = {
  onCreate: (data: { name: string; password?: string; maxPlayers?: number; maxListeners?: number }) => void;
};

export const CreateRoomForm: React.FC<Props> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<number | undefined>();
  const [maxListeners, setMaxListeners] = useState<number | undefined>();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onCreate({ name, password: password || undefined, maxPlayers, maxListeners });
      }}
    >
      <input placeholder="Nome da sala" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Senha (opcional)" value={password} onChange={e => setPassword(e.target.value)} />
      <input type="number" placeholder="Máx. jogadores" value={maxPlayers ?? ''} onChange={e => setMaxPlayers(Number(e.target.value) || undefined)} />
      <input type="number" placeholder="Máx. ouvintes" value={maxListeners ?? ''} onChange={e => setMaxListeners(Number(e.target.value) || undefined)} />
      <button type="submit">Criar Sala</button>
    </form>
  );
};
