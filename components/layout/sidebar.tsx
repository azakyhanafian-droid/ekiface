'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Eye,
  Users,
  Activity,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Live Monitoring',
    href: '/live-monitoring',
    icon: Eye,
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: Users,
  },
  {
    label: 'Event Log',
    href: '/event-log',
    icon: Activity,
  },
  // {
  //   label: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  // },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-border h-screen flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary">NeoGuard</h1>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-blue-50 text-primary font-semibold border-l-4 border-primary'
                  : 'text-foreground hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        <p>NeoGuard v1.0</p>
        <p>Industrial IoT Platform</p>
      </div>
    </aside>
  );
}
