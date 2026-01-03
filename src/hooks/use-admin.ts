'use client';

import { useUser } from '@/firebase';

export const useAdmin = () => {
    const { user } = useUser();
    // Hardcoded admin check as requested
    const isAdmin = user?.email === 'schoolcash@gmail.com';
    return { isAdmin, user };
};
