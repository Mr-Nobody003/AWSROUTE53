import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useToast } from '@/components/notifications/ToastProvider';
import { Search, Bell, ChevronDown, UserCircle2, LogOut, Zap, CheckCircle2, XCircle, Info, X } from 'lucide-react';
import Link from 'next/link';

export function TopNav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors relative"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>}
        </button>
        {user ? (
          <>
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF9900] rounded-full" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117]">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-[#E6EDF3]">Notifications</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={markAllAsRead} 
                        className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        Mark all read
                      </button>
                      <button 
                        onClick={clearAll} 
                        className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500 dark:text-[#8B949E]">
                        No notifications yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-[#21262D]">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-[#0D1117] transition-colors cursor-pointer group ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            onClick={() => {
                              markAsRead(notif.id);
                              if (notif.link) window.location.href = notif.link;
                            }}
                          >
                            <div className="mt-0.5">
                              {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              {notif.type === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                              {notif.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.read ? 'font-medium text-slate-900 dark:text-[#E6EDF3]' : 'text-slate-600 dark:text-[#8B949E]'}`}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-[#484F58] mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
