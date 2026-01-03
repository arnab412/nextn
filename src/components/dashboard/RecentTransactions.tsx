'use client';

import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions: rawTransactions }: RecentTransactionsProps) {
  const transactions = useMemo(() => {
    return rawTransactions
      .filter(tx => tx.transactionTime) // Filter out transactions without a transactionTime
      .sort((a, b) => b.transactionTime.getTime() - a.transactionTime.getTime());
  }, [rawTransactions]);

  const getIncomeDetails = (tx: Transaction) => {
    if (tx.type !== 'income' || !tx.fees) return null;
    return Object.entries(tx.fees)
      .map(([key, value]) => `${key}: ${formatCurrency(value as number)}`)
      .join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No transactions today.
                </TableCell>
              </TableRow>
            )}
            {transactions.slice(0, 10).map((tx) => (
              <TableRow key={`${tx.type}-${tx.id}`}>
                <TableCell>
                  <Badge variant={tx.type === 'income' ? 'secondary' : 'destructive'} className="capitalize">
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {tx.type === 'income' ? tx.studentName : tx.payTo}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tx.type === 'income'
                      ? getIncomeDetails(tx)
                      : `Category: ${tx.category}`}
                  </div>
                </TableCell>
                <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.type === 'income' ? tx.totalAmount || 0 : tx.amount || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
