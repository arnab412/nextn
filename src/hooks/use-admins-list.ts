'use client';

import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface AdminUser {
    email: string;
    addedAt?: any;
}

export const useAdminsList = () => {
    const db = useFirestore();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) return;

        const q = query(collection(db, 'admins'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const adminsData = snapshot.docs.map(doc => ({
                email: doc.id, // We use email as doc ID
                ...doc.data()
            })) as AdminUser[];
            setAdmins(adminsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching admins:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db]);

    return { admins, isLoading };
};
