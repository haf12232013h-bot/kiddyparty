"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { findRoomByInviteToken, readState, saveState, type Message, type Room } from '@/lib/app-data';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token ?? '';
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!token) return;
    const state = readState();
    const found = findRoomByInviteToken(state, token);
    setRoom(found);
  }, [token]);

  const handleJoin = () => {
    const state = readState();
    const currentName = state.userName?.trim();
    if (!room || !currentName) {
      router.push('/');
      return;
    }

    const exists = room.members.some((member) => member.name === currentName);
    if (!exists) {
      room.members.push({ id: crypto.randomUUID(), name: currentName, isAdmin: false });
      const updatedRooms = state.rooms.map((entry) => (entry.id === room.id ? room : entry));
      state.rooms = updatedRooms;
      saveState(state);
    }

    router.push(`/room/${room.id}`);
  };

  const currentUserName = useMemo(() => readState().userName || 'Guest', []);

  if (!room) {
    return (
      <main className="center-box">
        <div className="auth-card">
          <h1>Invite not found</h1>
          <p>The private link is invalid or expired. Ask the group admin for a new invite.</p>
          <Link href="/" className="primary" style={{ display: 'inline-block' }}>Go home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="center-box">
      <div className="auth-card">
        <h1>Join {room.name}</h1>
        <p>
          You are joining a private room for {room.members.length} member(s). Only invited people can see this chat.
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="status-chip" style={{ justifyContent: 'center' }}>Signed in as {currentUserName}</div>
          <button className="primary" onClick={handleJoin}>Join private room</button>
          <Link href="/" className="secondary" style={{ display: 'inline-block', textAlign: 'center' }}>
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
