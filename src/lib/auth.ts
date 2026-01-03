'use client';
// In a real app, you would integrate with Firebase Auth or another provider.
// For this project, we'll mock the user.

import { useAuth } from '@/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const getMockUser = async (): Promise<User> => {
  return {
    id: 'user_01HXM4J6Y6Z6X8J6Y6Z6X8J6Y6',
    name: 'Admin Office',
    email: 'admin@schoolcash.app',
  };
};

export const useRealUser = (): FirebaseUser | null => {
  const auth = useAuth();
  return auth.currentUser;
};
