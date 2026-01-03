'use client';

import React, { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/Sidebar';
import AppHeader from '@/components/layout/Header';
import { CashRegisterProvider } from '@/context/CashRegisterContext';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      redirect('/login');
    }
  }, [user, isUserLoading]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader className="animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CashRegisterProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </CashRegisterProvider>
  );
}
