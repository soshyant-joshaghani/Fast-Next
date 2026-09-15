'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Home, Users } from 'lucide-react';
import { useAuth } from '@/lib/modules/base/auth-context';
import { APP_NAME } from '@/lib/modules/base';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/lib/modules/base/ui/sidebar';

const baseItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Sample Notes', url: '/sample/notes', icon: Briefcase },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = user?.is_superuser
    ? [...baseItems, { title: 'Admin', url: '/admin', icon: Users }]
    : baseItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Dashboard
        </p>
        <p className="text-lg font-bold">{APP_NAME}</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 text-xs text-muted-foreground">
        Fast-Next From FoxG
      </SidebarFooter>
    </Sidebar>
  );
}
