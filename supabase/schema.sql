"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getRoomById, sendMessage } from '@/lib/kiddyparty';
import { supabase } from '@/lib/supabase';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';

  const [user, setUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        router.push('/');
        return;
      }

      try {
        const result = await getRoomById(roomId);
        const isMember = (result.members ?? []).some((member: any) => member.user_id === currentUser.id);
        if (!isMember) {
          router.push('/');
          return;
        }
        setRoom(result);
      } catch {
        router.push('/');
      }
    };

    loadSession();
  }, [roomId, router]);

  const currentUserName = useMemo(() => user?.email?.split('@')[0] ?? 'You', [user]);

  const handleSendMessage = async () => {
    if (!message.trim() || !room || !user) return;

    try {
      await sendMessage(roomId, user.id, message);
      const result = await getRoomById(roomId);
      setRoom(result);
      setMessage('');
      setStatus('Message sent.');
    } catch (error: any) {
      setStatus(error.message || 'Could not send message.');
    }
  };

  if (!room || !user) {
    return (
      <main className="center-box">
        <div className="auth-card">
          <h1>Loading room...</h1>
        </div>
      </main>
    );
  }

  const members = room.members ?? [];
  const messages = room.messages ?? [];

  return (
    <main className="chat-shell">
      <div className="chat-top">
        <Link href="/" style={{ color: '#4c1d95', fontWeight: 700 }}>← Back</Link>
        <div className="status-box">Private room</div>
      </div>

      <div className="chat-layout">
        <aside className="sidebar">
          <h2>{room.room.name}</h2>
          <div className="status-box">Invite: {room.room.invite_code}</div>
          <div className="member-list">
            {members.map((member: any) => (
              <div key={member.user_id} className="member-item">
                <div>
                  <strong>{member.profiles?.username ?? 'Member'}</strong>
                </div>
                <span>●</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="chatbox">
          <div className="chat-header">
            <h2>{room.room.name}</h2>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">No messages yet. Start the private chat.</div>
            ) : (
              messages.map((entry: any) => (
                <div key={entry.id} className={`message ${entry.sender_id === user.id ? 'self' : ''}`}>
                  <strong>{entry.profiles?.username ?? currentUserName}</strong>
                  <span>{entry.content}</span>
                  <time>{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                </div>
              ))
            )}
          </div>

          <div className="chat-compose">
            <input
              className="input"
              type="text"
              placeholder="Write your message..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSendMessage();
              }}
            />
            <button className="primary" onClick={handleSendMessage}>Send</button>
          </div>

          {status ? <div style={{ padding: '0 20px 18px' }} className="status-box">{status}</div> : null}
        </section>
      </div>
    </main>
  );
}
