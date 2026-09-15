'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/modules/base/auth-context';
import { PwaRegister } from '@/lib/modules/base/PwaRegister';
import { TooltipProvider } from '@/lib/modules/base/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <TooltipProvider>
          {children}
          <PwaRegister />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
