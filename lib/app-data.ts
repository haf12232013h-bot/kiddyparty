export type Member = {
  id: string;
  name: string;
  isAdmin: boolean;
};

export type Message = {
  id: string;
  sender: string;
  text: string;
  sentAt: string;
};

export type Room = {
  id: string;
  name: string;
  inviteToken: string;
  members: Member[];
  messages: Message[];
};

export type AppState = {
  userName: string;
  rooms: Room[];
};

const STORAGE_KEY = 'kiddyparty-demo';

const defaultState: AppState = {
  userName: '',
  rooms: [
    {
      id: 'demo-room-1',
      name: 'Weekend Crew',
      inviteToken: 'weekend-crew-123',
      members: [
        { id: 'm1', name: 'You', isAdmin: true },
        { id: 'm2', name: 'Ava', isAdmin: false },
        { id: 'm3', name: 'Milo', isAdmin: false },
      ],
      messages: [
        { id: 'msg1', sender: 'You', text: 'Let’s meet at the park later!', sentAt: new Date().toISOString() },
        { id: 'msg2', sender: 'Ava', text: 'Perfect, I can come by 5', sentAt: new Date().toISOString() },
      ],
    },
  ],
};

export function readState(): AppState {
  if (typeof window === 'undefined') return defaultState;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }

  try {
    return JSON.parse(raw) as AppState;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }
}

export function saveState(state: AppState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createRoom(state: AppState, name: string): Room {
  const room: Room = {
    id: crypto.randomUUID(),
    name,
    inviteToken: crypto.randomUUID(),
    members: [{ id: crypto.randomUUID(), name: state.userName || 'You', isAdmin: true }],
    messages: [],
  };

  return room;
}

export function getRoomInviteLink(token: string) {
  return `${window.location.origin}/invite/${token}`;
}

export function findRoomByInviteToken(state: AppState, token: string) {
  return state.rooms.find((room) => room.inviteToken === token) || null;
}
