import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { ChatWidget } from '@/components/ai/ChatWidget';
import { Toaster } from 'react-hot-toast';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'MentorHub — AI-Powered Mentorship Platform', template: '%s | MentorHub' },
  description: 'Connect with world-class mentors. AI-powered matching, flexible scheduling, and structured learning paths.',
  keywords: ['mentorship', 'career', 'AI', 'learning', 'coaching'],
  openGraph: {
    title: 'MentorHub — AI-Powered Mentorship Platform',
    description: 'Connect with world-class mentors powered by AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.variable}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <ChatWidget />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: { fontWeight: 500, fontSize: '0.875rem' },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
