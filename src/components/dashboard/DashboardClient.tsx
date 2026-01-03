'use client';

import { useCashRegister } from '@/hooks/use-cash-register';
import StatCards from '@/components/dashboard/StatCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import DenominationCalculator from '@/components/dashboard/DenominationCalculator';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import type { Transaction } from '@/types';
import type { Timestamp } from 'firebase/firestore';
import QuickCollectionForm from './QuickCollectionForm';
import QuickExpenseForm from './QuickExpenseForm';

export default function DashboardClient() {
  const {
    dailyRegister,
    incomes,
    expenses,
    totalIncome,
    totalExpense,
    systemBalance,
    isLoading,
  } = useCashRegister();

  const transactions = useMemo(() => {
     const combined: Transaction[] = [
        ...incomes.map(i => ({...i, type: 'income', transactionTime: (i.timestamp as Timestamp)?.toDate() }) as Transaction),
        ...expenses.map(e => ({...e, type: 'expense', transactionTime: (e.timestamp as Timestamp)?.toDate() }) as Transaction)
    ];
    return combined
      .filter(tx => tx.transactionTime)
      .sort((a, b) => b.transactionTime.getTime() - a.transactionTime.getTime());
  }, [incomes, expenses]);

  if (isLoading || !dailyRegister) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <StatCards
        openingBalance={dailyRegister.openingBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        systemBalance={systemBalance}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <QuickCollectionForm />
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions transactions={transactions} />
        </div>
        <div className="lg:col-span-1">
          <QuickExpenseForm />
        </div>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2" />
        <div className="lg:col-span-1">
            <DenominationCalculator />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <div />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1">
           <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
