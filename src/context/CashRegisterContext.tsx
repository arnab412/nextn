'use client';

import { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { DailyRegister, Income, Expense } from '@/types';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface CashRegisterContextType {
  dailyRegister: DailyRegister | null;
  incomes: Income[];
  expenses: Expense[];
  totalIncome: number;
  totalExpense: number;
  systemBalance: number;
  isLoading: boolean;
}

export const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

export const CashRegisterProvider = ({ children }: { children: ReactNode }) => {
  const db = useFirestore();
  const [dailyRegister, setDailyRegister] = useState<DailyRegister | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!db) return;
    const initializeRegister = async () => {
      setIsLoading(true);
      const todayDocRef = doc(db, 'daily_registers', todayStr);
      
      try {
        const todayDocSnap = await getDoc(todayDocRef);

        if (todayDocSnap.exists()) {
          setDailyRegister(todayDocSnap.data() as DailyRegister);
        } else {
          const yesterdayStr = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd');
          const yesterdayDocRef = doc(db, 'daily_registers', yesterdayStr);
          const yesterdayDocSnap = await getDoc(yesterdayDocRef);

          let openingBalance = 0;
          if (yesterdayDocSnap.exists()) {
            const yesterdayData = yesterdayDocSnap.data() as DailyRegister;
            // Use systemBalance from previous day as opening balance
            const systemBalance = yesterdayData.systemBalance;
            if (typeof systemBalance === 'number' && !isNaN(systemBalance)) {
              openingBalance = systemBalance;
            }
          }

          const newRegister: DailyRegister = {
            id: todayStr,
            date: new Date().toISOString(),
            openingBalance,
            totalIncome: 0,
            totalExpense: 0,
            systemBalance: openingBalance,
          };
          
          setDoc(todayDocRef, newRegister).catch(error => {
             const permissionError = new FirestorePermissionError({
                path: todayDocRef.path,
                operation: 'create',
                requestResourceData: newRegister,
              });
              errorEmitter.emit('permission-error', permissionError);
              console.error("Permission error creating daily register", error);
          });

          setDailyRegister(newRegister);
        }
      } catch (error) {
         const permissionError = new FirestorePermissionError({
            path: todayDocRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
          console.error("Permission error reading daily register", error);
      } finally {
         setIsLoading(false);
      }
    };

    initializeRegister();
  }, [db, todayStr]);

  useEffect(() => {
    if (!dailyRegister || !db) return;

    const incomeQuery = query(collection(db, 'incomes'), where('date', '==', todayStr));
    const expenseQuery = query(collection(db, 'expenses'), where('date', '==', todayStr));

    const unsubscribeIncomes = onSnapshot(incomeQuery, (snapshot) => {
      const incomesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Income));
      setIncomes(incomesData);
    }, (error) => {
        const permissionError = new FirestorePermissionError({ path: 'incomes', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Permission error fetching incomes:", error);
    });

    const unsubscribeExpenses = onSnapshot(expenseQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(expensesData);
    }, (error) => {
        const permissionError = new FirestorePermissionError({ path: 'expenses', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Permission error fetching expenses:", error);
    });

    return () => {
      unsubscribeIncomes();
      unsubscribeExpenses();
    };
  }, [dailyRegister, db, todayStr]);

  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, item) => {
      const amount = typeof item.totalAmount === 'number' && !isNaN(item.totalAmount) ? item.totalAmount : 0;
      return sum + amount;
    }, 0);
  }, [incomes]);

  const totalExpense = useMemo(() => {
    return expenses.filter(e => e.paymentMode === 'Cash').reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const systemBalance = useMemo(() => {
    if (!dailyRegister) return 0;
    return dailyRegister.openingBalance + totalIncome - totalExpense;
  }, [dailyRegister, totalIncome, totalExpense]);

  // Effect to update systemBalance in Firestore when it changes
  useEffect(() => {
    if (dailyRegister && systemBalance !== dailyRegister.systemBalance && db) {
        const todayDocRef = doc(db, 'daily_registers', todayStr);
        const updateData = { 
            systemBalance,
            totalIncome,
            totalExpense,
        };
        updateDoc(todayDocRef, updateData).catch(error => {
            const permissionError = new FirestorePermissionError({
                path: todayDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error("Error updating system balance:", error);
        });
    }
  }, [systemBalance, totalIncome, totalExpense, dailyRegister, db, todayStr]);


  const value = {
    dailyRegister,
    incomes,
    expenses,
    totalIncome,
    totalExpense,
    systemBalance,
    isLoading,
  };

  return (
    <CashRegisterContext.Provider value={value}>
      {children}
    </CashRegisterContext.Provider>
  );
};
