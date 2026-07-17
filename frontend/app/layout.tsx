import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/notifications/ToastProvider';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AWS Route53 Clone',
  description: 'A clone of AWS Route53',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <AuthProvider>
          <ToastProvider>
            <div className="flex flex-col h-screen overflow-hidden">
              <TopNav />
              <div className="flex flex-1 overflow-hidden">
                <SideNav />
                <main className="flex-1 overflow-y-auto bg-slate-50">
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
