export type UserRole = 'player' | 'listener' | 'narrator';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  isMuted?: boolean;
  isSpeaking?: boolean;
  isOOC?: boolean;
  volume?: number;
}

export interface Room {
  id: string;
  name: string;
  password?: string;
  ownerId: string;
  maxPlayers?: number;
  maxListeners?: number;
  users: User[];
  narrators: string[]; // user ids
  mutedPlayers: string[]; // user ids
  bannedPlayers: string[]; // user ids
  allowedToHearNarrator: Record<string, string[]>; // narratorId -> userIds
  votes: Record<string, string[]>; // playerId -> userIds who voted
}
