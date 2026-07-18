import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/notifications/ToastProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { KeyboardShortcuts } from '@/components/layout/KeyboardShortcuts';

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] min-h-screen transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <KeyboardShortcuts />
              <div className="flex flex-col h-screen overflow-hidden">
                <TopNav />
                <div
                  className="flex flex-1 overflow-hidden"
                  style={{ height: 'calc(100vh - var(--topnav-height))' }}
                >
                  <SideNav />
                  <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0D1117] transition-colors duration-200">
                    {children}
                  </main>
                </div>
              </div>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
