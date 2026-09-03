'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/modules/global/auth-context';
import { PwaRegister } from '@/components/pwa/PwaRegister';
import { TooltipProvider } from '@/components/ui/tooltip';

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
