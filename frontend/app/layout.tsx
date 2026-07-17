import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/notifications/ToastProvider';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AWS Route 53 — DNS Management Console',
  description: 'Manage your DNS, hosted zones, health checks and traffic policies with this AWS Route 53 clone.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0D1117] text-[#E6EDF3] min-h-screen`}>
        <AuthProvider>
          <ToastProvider>
            <div className="flex flex-col h-screen overflow-hidden">
              <TopNav />
              <div
                className="flex flex-1 overflow-hidden"
                style={{ height: 'calc(100vh - var(--topnav-height))' }}
              >
                <SideNav />
                <main className="flex-1 overflow-y-auto bg-[#0D1117]">
                  {children}
                </main>
              </div>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
