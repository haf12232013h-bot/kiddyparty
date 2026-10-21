import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kiddyparty',
  description: 'Private invite-only group chat for close friends and family',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
