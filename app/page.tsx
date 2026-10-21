"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createRoom, getRoomInviteLink, readState, saveState, type Room } from '@/lib/app-data';

export default function HomePage() {
  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [copyText, setCopyText] = useState('');

  useEffect(() => {
    const state = readState();
    setRooms(state.rooms);
    setName(state.userName || '');
  }, []);

  const saveProfile = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const state = readState();
    state.userName = trimmed;
    saveState(state);
    setCopyText('Profile saved');
  };

  const handleCreateRoom = () => {
    const trimmed = roomName.trim();
    if (!trimmed) return;
    const state = readState();
    const room = createRoom(state, trimmed);
    state.rooms = [room, ...state.rooms];
    saveState(state);
    setRooms(state.rooms);
    setRoomName('');
    setCopyText(`Room “${room.name}” created`);
  };

  const handleCopy = async (room: Room) => {
    const url = getRoomInviteLink(room.inviteToken);
    try {
      await navigator.clipboard.writeText(url);
      setCopyText(`Invite copied for ${room.name}`);
    } catch {
      setCopyText(`Copy this link: ${url}`);
    }
  };

  const currentUserName = useMemo(() => name || 'Guest', [name]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">Kiddyparty</div>
        <div className="status-chip">Private • Invite-only</div>
      </header>

      <section className="hero">
        <div className="card hero-main">
          <h1>Private group chats for your inner circle.</h1>
          <p>
            Create a private room, invite the people you trust, and keep everything behind a secret link.
            No public page, no random visitors, and no strangers can find your chats.
          </p>
          <div className="inline-actions">
            <button className="primary" onClick={() => window.location.hash = '#create-room'}>Create room</button>
            <Link href="#rooms" className="secondary" style={{ display: 'inline-block' }}>See rooms</Link>
          </div>
        </div>

        <aside className="card side-panel">
          <strong style={{ fontSize: '1rem', color: '#374151' }}>Your profile</strong>
          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            <input
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button className="primary" onClick={saveProfile}>Save profile</button>
            <div style={{ color: '#4c1d95', fontWeight: 700 }}>{copyText || `Signed in as ${currentUserName}`}</div>
          </div>

          <div className="metrics">
            <div className="metric">
              <strong>8-9</strong>
              <span>People</span>
            </div>
            <div className="metric">
              <strong>1</strong>
              <span>Share link</span>
            </div>
            <div className="metric">
              <strong>100%</strong>
              <span>Private</span>
            </div>
            <div className="metric">
              <strong>0</strong>
              <span>Public</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid">
        <div className="card panel" id="create-room">
          <h2>Create a private room</h2>
          <div className="form-block">
            <input
              className="input"
              value={roomName}
              placeholder="Room name (for example: Weekend Crew)"
              onChange={(event) => setRoomName(event.target.value)}
            />
            <button className="primary" onClick={handleCreateRoom}>Create room</button>
          </div>
        </div>

        <div className="card panel" id="rooms">
          <h2>Your rooms</h2>
          <div className="room-list">
            {rooms.length === 0 ? (
              <div className="empty-state">No rooms yet. Create one to start inviting your people.</div>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="room-item">
                  <div>
                    <h3>{room.name}</h3>
                    <p>{room.members.length} member(s)</p>
                  </div>
                  <div className="room-actions">
                    <Link href={`/room/${room.id}`} className="small-btn">Open</Link>
                    <button className="small-btn" onClick={() => handleCopy(room)}>Copy link</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
