'use client';
import { useAuth } from '@/lib/auth-context';
import { Search, Bell, Settings, LogOut, ChevronDown, UserCircle2 } from 'lucide-react';
import Link from 'next/link';

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="h-12 bg-slate-800 text-white flex items-center justify-between px-4 sticky top-0 z-40 text-sm">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:text-slate-300">
          <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-xs font-extrabold mr-1">AWS</span>
          Route 53
        </Link>
        <div className="hidden md:flex items-center bg-slate-700/50 rounded overflow-hidden border border-slate-600 focus-within:border-orange-500 focus-within:bg-slate-700 transition-colors w-96">
          <div className="px-2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search for services, features, blogs, docs, and more" 
            className="bg-transparent border-none outline-none py-1.5 w-full text-slate-200 placeholder-slate-400 text-xs"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button className="text-slate-300 hover:text-white flex flex-col items-center justify-center p-1">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 p-1.5 rounded transition-colors group">
              <UserCircle2 className="w-5 h-5 text-slate-300 group-hover:text-white" />
              <span className="text-slate-200 text-xs font-medium">{user.username} @ Demo Account</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white" />
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </>
        ) : (
          <div className="text-slate-300 text-xs font-medium">AWS Route 53 Clone</div>
        )}
      </div>
    </header>
  );
}
