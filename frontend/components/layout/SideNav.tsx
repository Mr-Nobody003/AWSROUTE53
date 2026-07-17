'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../notifications/ToastProvider';
import { LayoutDashboard, Globe, Activity, Route, Settings2 } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Hosted zones', href: '/hosted-zones', icon: Globe },
  { name: 'Traffic policies', href: '/traffic-policies', icon: Route },
  { name: 'Health checks', href: '/health-checks', icon: Activity },
  { name: 'Resolver', href: '/resolver', icon: Settings2 },
  { name: 'Profiles', href: '/profiles', icon: Settings2 },
];

export function SideNav() {
  const pathname = usePathname();

  // If login, don't show sidenav content but keep width perhaps? Or layout will hide it.
  if (pathname === '/login') return null;

  return (
    <aside className="w-[240px] bg-white border-r border-slate-200 min-h-[calc(100vh-48px)] flex flex-col">
      <div className="p-4 py-3 font-semibold text-slate-800 text-lg border-b border-slate-100 flex items-center gap-2">
        Route 53
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        <ul className="flex flex-col">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors border-l-4",
                    isActive 
                      ? "border-orange-500 bg-orange-50 text-orange-900" 
                      : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-orange-600" : "text-slate-500")} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
