'use client';
import { useAuth } from '@/lib/auth-context';
import { Search, Bell, ChevronDown, UserCircle2, LogOut, Zap } from 'lucide-react';
import Link from 'next/link';

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{ height: 'var(--topnav-height)' }}
      className="bg-[#161B22] border-b border-[#21262D] flex items-center justify-between px-4 sticky top-0 z-40 flex-shrink-0"
    >
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="AWS Route 53 Home"
        >
          {/* AWS badge */}
          <div className="flex items-center justify-center w-7 h-7 rounded bg-[#FF9900] shadow-[0_0_12px_rgba(255,153,0,0.4)] group-hover:shadow-[0_0_18px_rgba(255,153,0,0.55)] transition-shadow">
            <Zap className="w-4 h-4 text-[#0D1117] fill-current" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold tracking-widest uppercase text-[#FF9900]">AWS</span>
            <span className="text-sm font-bold text-[#E6EDF3] tracking-tight">Route 53</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-[#30363D]" />

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-1.5 w-80 focus-within:border-[#FF9900]/60 focus-within:ring-1 focus-within:ring-[#FF9900]/20 transition-all">
          <Search className="w-3.5 h-3.5 text-[#484F58] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search services, docs, and more"
            className="bg-transparent border-none outline-none flex-1 text-xs text-[#C9D1D9] placeholder-[#484F58]"
          />
          <kbd className="hidden lg:flex items-center gap-0.5 text-[9px] text-[#484F58] bg-[#21262D] px-1.5 py-0.5 rounded border border-[#30363D] font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: User actions */}
      <div className="flex items-center gap-1">
        {user ? (
          <>
            <button
              className="p-2 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF9900] rounded-full" />
            </button>

            <div className="flex items-center gap-1.5 ml-1 cursor-pointer group px-2.5 py-1.5 rounded-md hover:bg-[#21262D] transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF9900] to-[#E68900] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#0D1117]">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:flex flex-col leading-none">
                <span className="text-xs font-semibold text-[#E6EDF3]">{user.username}</span>
                <span className="text-[10px] text-[#8B949E]">Demo Account</span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#484F58] group-hover:text-[#8B949E] transition-colors ml-0.5" />
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-md text-[#8B949E] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              aria-label="Logout"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="text-xs text-[#8B949E] font-medium px-2">AWS Route 53</div>
        )}
      </div>
    </header>
  );
}
