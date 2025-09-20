import React from 'react';
import { Room } from '../../types';

type RoomListProps = {
  rooms: Room[];
  onJoin: (roomId: string) => void;
  onDelete?: (roomId: string) => void;
};

export const RoomList: React.FC<RoomListProps> = ({ rooms, onJoin, onDelete }) => (
  <div>
    <h2 style={{marginBottom: 16}}>Salas Disponíveis</h2>
    <ul style={{listStyle: 'none', padding: 0}}>
      {rooms.map(room => (
        <li key={room.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333'}}>
          <span style={{fontWeight: 500}}>{room.name}</span>
          <div>
            <button style={{marginRight: 8}} onClick={() => onJoin(room.id)}>Entrar</button>
            {onDelete && (
              <button style={{background: '#c00', color: '#fff'}} onClick={() => onDelete(room.id)}>Apagar</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);
