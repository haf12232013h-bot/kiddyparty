import { supabase } from '@/lib/supabase';

export type Room = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
};

export type MessageRow = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string | null;
  } | null;
};

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function createRoom(name: string, ownerId: string): Promise<Room> {
  const inviteCode = crypto.randomUUID().slice(0, 10);

  const { data, error } = await supabase
    .from('rooms')
    .insert({ name, owner_id: ownerId, invite_code: inviteCode })
    .select()
    .single();

  if (error) throw error;

  const { error: memberError } = await supabase
    .from('room_members')
    .insert({ room_id: data.id, user_id: ownerId });

  if (memberError) throw memberError;

  return data as Room;
}

export async function getMyRooms(userId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('room_members')
    .select('room_id, rooms(id, name, invite_code, owner_id, created_at)')
    .eq('user_id', userId);

  if (error) throw error;

  return (data ?? []).map((entry: any) => entry.rooms).filter(Boolean) as Room[];
}

export async function getRoomById(id: string) {
  const { data: room, error: roomError } = await supabase.from('rooms').select('*').eq('id', id).single();
  if (roomError) throw roomError;

  const { data: members, error: membersError } = await supabase
    .from('room_members')
    .select('user_id, profiles(username)')
    .eq('room_id', id);

  if (membersError) throw membersError;

  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, room_id, sender_id, content, created_at, profiles(username)')
    .eq('room_id', id)
    .order('created_at', { ascending: true });

  if (messagesError) throw messagesError;

  return { room, members: members ?? [], messages: messages ?? [] };
}

export async function joinRoomWithInvite(inviteCode: string, userId: string) {
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (roomError) throw roomError;

  const { error: memberError } = await supabase
    .from('room_members')
    .insert({ room_id: room.id, user_id: userId });

  if (memberError) throw memberError;

  return room as Room;
}

export async function sendMessage(roomId: string, senderId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({ room_id: roomId, sender_id: senderId, content: trimmed })
    .select('id, room_id, sender_id, content, created_at, profiles(username)')
    .single();

  if (error) throw error;
  return data;
}
