'use client';

import { useUser } from '@/firebase';
import { useAdminsList } from './use-admins-list';

export const useAdmin = () => {
    const { user } = useUser();
    const { admins } = useAdminsList();

    // Check if user is the master admin OR is in the admins list
    const isMasterAdmin = user?.email === 'schoolcash@gmail.com';
    const isDocAdmin = admins.some(a => a.email === user?.email);

    const isAdmin = isMasterAdmin || isDocAdmin;

    return { isAdmin, user };
};
