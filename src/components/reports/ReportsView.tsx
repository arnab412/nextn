'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction, Income, Expense } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function ReportsView() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from, to: today };
  });

  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const incomesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'incomes'), orderBy('timestamp', 'desc'));
  }, [firestore]);
  
  const expensesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'expenses'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  useEffect(() => {
    if (!incomesQuery) return;
    setLoading(true);
    const unsub = onSnapshot(incomesQuery, (snapshot) => {
      const incomesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Income);
      setIncomes(incomesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching incomes:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [incomesQuery]);

  useEffect(() => {
    if (!expensesQuery) return;
    setLoading(true);
    const unsub = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Expense);
      setExpenses(expensesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching expenses:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [expensesQuery]);


  const filteredTransactions = useMemo(() => {
    const combined: Transaction[] = [
        ...incomes.map(i => ({...i, type: 'income', transactionTime: (i.timestamp as Timestamp)?.toDate() }) as Transaction),
        ...expenses.map(e => ({...e, type: 'expense', transactionTime: (e.timestamp as Timestamp)?.toDate() }) as Transaction)
    ];

    return combined
      .filter(tx => tx.transactionTime)
      .filter((tx) => {
        if (!dateRange?.from) return true;
        const txDate = tx.transactionTime;
        const fromDate = new Date(dateRange.from.setHours(0, 0, 0, 0));
        const toDate = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : fromDate;
        return txDate >= fromDate && txDate <= toDate;
      })
      .filter((tx) => {
        if (typeFilter === 'all') return true;
        return tx.type === typeFilter;
      })
      .sort((a, b) => b.transactionTime.getTime() - a.transactionTime.getTime());
  }, [incomes, expenses, dateRange, typeFilter]);

  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filteredTransactions.forEach(tx => {
      const dateStr = format(tx.transactionTime, 'yyyy-MM-dd');
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(tx);
    });
    return Object.entries(groups)
                 .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
    const expense = filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);
  
  const getIncomeDetails = (tx: Transaction) => {
    if (tx.type !== 'income' || !tx.fees) return null;
    return Object.entries(tx.fees)
      .map(([key, value]) => `${key}: ${formatCurrency(value as number)}`)
      .join(', ');
  };


  const handleDelete = () => {
    if (!transactionToDelete || !transactionToDelete.id) return;

    const collectionName = transactionToDelete.type === 'income' ? 'incomes' : 'expenses';
    const docRef = doc(firestore, collectionName, transactionToDelete.id);

    deleteDoc(docRef)
        .then(() => {
          toast({
            title: 'Success',
            description: 'Transaction deleted successfully.',
          });
        })
        .catch(error => {
          console.error("Error deleting transaction:", error);
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete transaction. Check permissions.',
          });
        });

      setTransactionToDelete(null);
  };

  const calculateDailyTotals = (transactions: Transaction[]) => {
    const dailyIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
    const dailyExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + (tx.amount || 0), 0);
    return { dailyIncome, dailyExpense, dailyBalance: dailyIncome - dailyExpense };
  }

  return (
    <>
      <div className="space-y-8">
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateRange && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 w-full">
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Income</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totals.income)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Expense</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totals.expense)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net Balance</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(totals.balance)}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No transactions found for the selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupedTransactions.map(([date, transactions]) => {
                      const { dailyIncome, dailyExpense, dailyBalance } = calculateDailyTotals(transactions);
                      return (
                        <React.Fragment key={date}>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={4} className="py-2 px-4">
                              <h3 className="font-bold text-lg">{format(new Date(date), 'EEEE, dd MMMM, yyyy')}</h3>
                            </TableCell>
                          </TableRow>
                          {transactions.map((tx) => (
                            <TableRow key={`${tx.type}-${tx.id}`}>
                              <TableCell>
                                <Badge variant={tx.type === 'income' ? 'secondary' : 'destructive'} className="capitalize">{tx.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{tx.type === 'income' ? tx.studentName : tx.payTo}</div>
                                <div className="text-sm text-muted-foreground">
                                  {tx.type === 'income' ? getIncomeDetails(tx) : `Category: ${tx.category}`}
                                </div>
                              </TableCell>
                              <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(tx.type === 'income' ? tx.totalAmount || 0 : tx.amount || 0)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => setTransactionToDelete(tx)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-secondary/50 hover:bg-secondary/50 font-bold">
                              <TableCell colSpan={2} className="text-right">Daily Summary</TableCell>
                              <TableCell className="text-right text-green-600">{formatCurrency(dailyIncome)}</TableCell>
                              <TableCell className="text-right text-red-600">{formatCurrency(dailyExpense)}</TableCell>
                          </TableRow>
                           <TableRow className="bg-secondary/80 hover:bg-secondary/80 font-extrabold">
                              <TableCell colSpan={3} className="text-right">Daily Net Balance</TableCell>
                              <TableCell className="text-right">{formatCurrency(dailyBalance)}</TableCell>
                          </TableRow>
                        </React.Fragment>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
