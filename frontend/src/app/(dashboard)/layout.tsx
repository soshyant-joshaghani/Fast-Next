'use client';

import { AuthRedirect } from '@/lib/modules/base/auth/LoginForm';
import { AppSidebar } from '@/lib/modules/base/AppSidebar';
import { Header } from '@/lib/modules/base/Header';
import { SidebarInset, SidebarProvider } from '@/lib/modules/base/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthRedirect>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthRedirect>
  );
}
