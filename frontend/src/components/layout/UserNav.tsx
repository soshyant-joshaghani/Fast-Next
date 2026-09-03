'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/modules/global/auth-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function UserNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.email.slice(0, 2).toUpperCase();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 sm:flex">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="text-right text-sm leading-tight">
          <p className="font-medium">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            {user.is_superuser ? 'SuperAdmin' : 'User'}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </div>
  );
}
