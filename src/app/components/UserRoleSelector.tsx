"use client";
import React, { useState } from 'react';
import { UserRole } from '../../types';

type Props = {
  onSelect: (role: UserRole) => void;
};

export const UserRoleSelector: React.FC<Props> = ({ onSelect }) => {
  const [role, setRole] = useState<UserRole>('player');
  return (
    <div>
      <label>Escolha seu tipo de usuário:</label>
      <select value={role} onChange={e => setRole(e.target.value as UserRole)}>
        <option value="player">Jogador</option>
        <option value="listener">Ouvinte</option>
        <option value="narrator">Narrador</option>
      </select>
      <button onClick={() => onSelect(role)}>Entrar</button>
    </div>
  );
};
