'use client';

import { SidebarTrigger } from '@/lib/modules/base/ui/sidebar';
import { Separator } from '@/lib/modules/base/ui/separator';
import { ThemeToggle } from '@/lib/modules/base/ThemeToggle';
import { UserNav } from '@/lib/modules/base/UserNav';

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
