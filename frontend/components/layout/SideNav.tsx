'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../notifications/ToastProvider';
import { LayoutDashboard, Globe, Activity, Route, Settings2, Shield } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Hosted Zones', href: '/hosted-zones', icon: Globe },
  { name: 'Traffic Policies', href: '/traffic-policies', icon: Route },
  { name: 'Health Checks', href: '/health-checks', icon: Activity },
  { name: 'Resolver', href: '/resolver', icon: Shield },
  { name: 'Profiles', href: '/profiles', icon: Settings2 },
];

export function SideNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <aside
      style={{ width: 'var(--sidebar-width)' }}
      className="bg-slate-50 dark:bg-[#161B22] border-r border-slate-200 dark:border-[#21262D] flex flex-col h-full"
    >
      {/* Section label */}
      <div className="px-4 pt-5 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#484F58]">
          Route 53
        </span>
      </div>

      <nav className="flex-1 py-1 overflow-y-auto">
        <ul className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 relative',
                    isActive
                      ? 'bg-orange-100 dark:bg-[#FF9900]/10 text-orange-600 dark:text-[#FF9900]'
                      : 'text-slate-500 dark:text-[#8B949E] hover:bg-slate-200 dark:hover:bg-[#21262D] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 dark:bg-[#FF9900] rounded-r-full" />
                  )}
                  <item.icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-orange-500 dark:text-[#FF9900]' : 'text-slate-400 dark:text-[#484F58] group-hover:text-slate-500 dark:group-hover:text-[#8B949E]'
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-[#21262D]">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-[#484F58]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Connected to API
        </div>
      </div>
    </aside>
  );
}
