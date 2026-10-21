# Kiddyparty

A private invite-only chat app concept for a small group of friends.

## Features
- Private rooms
- Invite links
- One-on-one and group room support
- Supabase-powered auth and data
- No public rooms or public discovery

## Quick start

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in your keys.
3. Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.
4. Install dependencies:
   npm install
5. Start the app:
   npm run dev

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Notes
This is a private, invite-only starter app using Supabase and Next.js. It is designed for a small trusted circle and does not expose rooms publicly.

For video/audio calls, add WebRTC or a provider such as Daily, Agora, or Twilio later.
