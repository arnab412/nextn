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
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';

const QuickCollectionSchema = z.object({
  studentName: z.string().min(1, 'Student Name is required.'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
});

type QuickCollectionValues = z.infer<typeof QuickCollectionSchema>;

export default function QuickCollectionForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<QuickCollectionValues>({
    resolver: zodResolver(QuickCollectionSchema),
    defaultValues: {
      studentName: '',
      amount: 0,
    },
  });

  const onSubmit = (values: QuickCollectionValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in.' });
      return;
    }

    startTransition(() => {
      const incomeData = {
        studentId: 'quick_entry',
        studentName: values.studentName,
        class: 'N/A',
        section: 'Primary' as const,
        fees: {
          Tuition: values.amount,
        },
        totalAmount: values.amount,
        collectedBy: user.uid,
        date: format(new Date(), 'yyyy-MM-dd'),
        timestamp: serverTimestamp(),
      };

      const incomesCol = collection(firestore, 'incomes');
      addDoc(incomesCol, incomeData)
        .then(() => {
          toast({ title: 'Success', description: 'Quick collection added.' });
          form.reset();
        })
        .catch(error => {
          console.error('Error adding quick collection:', error);
          const permissionError = new FirestorePermissionError({
            path: 'incomes',
            operation: 'create',
            requestResourceData: incomeData,
          });
          errorEmitter.emit('permission-error', permissionError);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to add collection.' });
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quick Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
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
            <Button type="submit" className="w-full" disabled={isPending}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isPending ? 'Adding...' : 'Add Collection'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
