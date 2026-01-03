'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowDown, ArrowUp, Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatCardsProps {
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  systemBalance: number;
}

const statItems = [
  {
    title: "Today's Income",
    icon: ArrowDown,
    key: 'totalIncome',
    color: 'text-emerald-400',
  },
  {
    title: "Today's Expense",
    icon: ArrowUp,
    key: 'totalExpense',
    color: 'text-rose-400',
  },
  {
    title: 'Cash in Hand',
    icon: Banknote,
    key: 'systemBalance',
    color: 'text-violet-400',
  },
];

export default function StatCards({ openingBalance, totalIncome, totalExpense, systemBalance }: StatCardsProps) {
  const data = { openingBalance, totalIncome, totalExpense, systemBalance };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(data[item.key as keyof typeof data])}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
