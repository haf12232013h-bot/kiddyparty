"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { readState, saveState, type Message, type Room } from '@/lib/app-data';

export default function RoomPage() {
  const params = useParams();
  const roomId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';
  const [room, setRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const state = readState();
    const found = state.rooms.find((entry) => entry.id === roomId) || null;
    setRoom(found);
  }, [roomId]);

  const currentUser = useMemo(() => readState().userName || 'Guest', []);

  const canAccess = !!room && room.members.some((member) => member.name === currentUser);

  const sendMessage = () => {
    if (!room || !message.trim()) return;

    const state = readState();
    const nextMessage: Message = {
      id: crypto.randomUUID(),
      sender: currentUser,
      text: message.trim(),
      sentAt: new Date().toISOString(),
    };

    const updatedRooms = state.rooms.map((entry) => {
      if (entry.id !== room.id) return entry;
      return { ...entry, messages: [...entry.messages, nextMessage] };
    });

    state.rooms = updatedRooms;
    saveState(state);
    setRoom({ ...room, messages: [...room.messages, nextMessage] });
    setMessage('');
  };

  if (!room) {
    return (
      <main className="center-box">
        <div className="auth-card">
          <h1>Room not found</h1>
          <p>This private room does not exist or the invite is expired.</p>
          <Link href="/" className="primary" style={{ display: 'inline-block' }}>Return home</Link>
        </div>
      </main>
    );
  }

  if (!canAccess) {
    return (
      <main className="center-box">
        <div className="auth-card">
          <h1>Access denied</h1>
          <p>You need to be invited to this private room to see the conversation.</p>
          <Link href="/" className="primary" style={{ display: 'inline-block' }}>Back home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-shell">
      <div className="chat-top">
        <Link href="/" style={{ color: '#4c1d95', fontWeight: 700 }}>← Back</Link>
        <div className="status-chip">Private room</div>
      </div>

      <div className="story-strip">
        {room.members.map((member) => (
          <div className="story-pill" key={member.id}>{member.name}</div>
        ))}
      </div>

      <div className="chat-layout">
        <aside className="sidebar">
          <h2 style={{ marginTop: 0 }}>{room.name}</h2>
          <div className="status-chip">{room.members.length} members</div>
          <div className="member-list">
            {room.members.map((member) => (
              <div key={member.id} className="member-item">
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.isAdmin ? 'Admin' : 'Member'}</span>
                </div>
                <span>●</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="chatbox">
          <div className="chat-header">
            <h2>{room.name}</h2>
          </div>

          <div className="chat-messages">
            {room.messages.length === 0 ? (
              <div className="empty-state">No messages yet. Say hi to everyone.</div>
            ) : (
              room.messages.map((entry) => (
                <div key={entry.id} className={`message ${entry.sender === currentUser ? 'self' : ''}`}>
                  <strong>{entry.sender}</strong>
                  <span>{entry.text}</span>
                  <time>{new Date(entry.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                </div>
              ))
            )}
          </div>

          <div className="chat-compose">
            <input
              className="input"
              placeholder="Write a message..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendMessage();
              }}
            />
            <button className="primary" onClick={sendMessage}>Send</button>
          </div>
        </section>
      </div>
    </main>
  );
}
