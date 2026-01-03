'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { MinusCircle } from 'lucide-react';

const QuickExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
});

type QuickExpenseValues = z.infer<typeof QuickExpenseSchema>;

export default function QuickExpenseForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<QuickExpenseValues>({
    resolver: zodResolver(QuickExpenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
    },
  });

  const onSubmit = (values: QuickExpenseValues) => {
    startTransition(() => {
      const expenseData = {
        payTo: values.description,
        description: values.description,
        amount: values.amount,
        category: 'Other' as const,
        voucherNo: 'quick_entry',
        paymentMode: 'Cash' as const,
        date: format(new Date(), 'yyyy-MM-dd'),
        timestamp: serverTimestamp(),
      };

      const expensesCol = collection(firestore, 'expenses');
      addDoc(expensesCol, expenseData)
        .then(() => {
          toast({ title: 'Success', description: 'Quick expense added.' });
          form.reset();
        })
        .catch((error) => {
          console.error('Error adding quick expense:', error);
          const permissionError = new FirestorePermissionError({
            path: 'expenses',
            operation: 'create',
            requestResourceData: expenseData,
          });
          errorEmitter.emit('permission-error', permissionError);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to add expense.' });
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quick Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient / Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Office Supplies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="destructive" className="w-full" disabled={isPending}>
              <MinusCircle className="mr-2 h-4 w-4" />
              {isPending ? 'Adding...' : 'Add Expense'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
