'use client';

import { FirebaseContext } from '@/firebase/provider';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';

export interface AdminUser {
    email: string;
    addedAt?: any;
}

export const useAdminsList = () => {
    // Access context directly to avoid throwing if services aren't ready (e.g. during SSR)
    const context = useContext(FirebaseContext);

    // Default state
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Safe check for services
        if (!context?.areServicesAvailable || !context?.firestore) {
            return;
        }

        const db = context.firestore;
        const q = query(collection(db, 'admins'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const adminsData = snapshot.docs.map(doc => ({
                email: doc.id,
                ...doc.data()
            })) as AdminUser[];
            setAdmins(adminsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching admins:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [context]);

    return { admins, isLoading };
};
