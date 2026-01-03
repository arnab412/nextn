'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { Loader } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        redirect('/dashboard');
      } else {
        redirect('/login');
      }
    }
  }, [user, isUserLoading]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
       <Loader className="animate-spin" />
        <p className="ml-2">Loading...</p>
    </div>
  );
}
