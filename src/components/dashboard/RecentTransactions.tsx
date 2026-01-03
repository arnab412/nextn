'use client';

import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions: rawTransactions }: RecentTransactionsProps) {
  const { isAdmin } = useAdmin();
  const db = useFirestore();
  const { toast } = useToast();

  const handleDelete = async (tx: Transaction) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const collectionName = tx.type === 'income' ? 'incomes' : 'expenses';
      await deleteDoc(doc(db, collectionName, tx.id));
      toast({
        title: 'Transaction deleted',
        description: 'The transaction has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction.',
        variant: 'destructive',
      });
    }
  };

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
              {isAdmin && <TableHead className="w-[50px]"></TableHead>}
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
                {isAdmin && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                      onClick={() => handleDelete(tx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
