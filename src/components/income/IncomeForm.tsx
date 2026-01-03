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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { FeeCollectionFormSchema } from '@/lib/schemas/income';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import type { FeeDetails } from '@/types';

type FeeCollectionFormValues = z.infer<typeof FeeCollectionFormSchema>;

const feeFields = {
  primary: [
    { name: 'primaryTuition', label: 'Tuition Fee', type: 'Tuition' },
    { name: 'primaryExam', label: 'Exam Fee', type: 'Exam' },
    { name: 'primaryFine', label: 'Fine', type: 'Fine' },
  ],
  high: [
    { name: 'highTuition', label: 'Tuition Fee', type: 'Tuition' },
    { name: 'highExam', label: 'Exam Fee', type: 'Exam' },
    { name: 'highFine', label: 'Fine', type: 'Fine' },
  ],
} as const;


export default function IncomeForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<FeeCollectionFormValues>({
    resolver: zodResolver(FeeCollectionFormSchema),
    defaultValues: {
      studentId: '',
      studentName: '',
      class: '',
      primaryTuition: 0,
      primaryExam: 0,
      primaryFine: 0,
      highTuition: 0,
      highExam: 0,
      highFine: 0,
    },
  });

  const onSubmit = (values: FeeCollectionFormValues) => {
    if (!user) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'You must be logged in to perform this action.',
        });
        return;
    }

    startTransition(async () => {
      const incomesCol = collection(firestore, 'incomes');
      const date = format(new Date(), 'yyyy-MM-dd');
      const timestamp = serverTimestamp();
      
      const processFees = (section: 'Primary' | 'High', feeKeys: readonly { name: string; type: string }[]) => {
        const fees: FeeDetails = {};
        let totalAmount = 0;

        feeKeys.forEach(field => {
          const amount = values[field.name as keyof FeeCollectionFormValues] as number;
          if (amount && amount > 0) {
            fees[field.type as keyof FeeDetails] = amount;
            totalAmount += amount;
          }
        });
        
        if (totalAmount > 0) {
          const incomeData = {
            studentId: values.studentId,
            studentName: values.studentName,
            class: values.class,
            section,
            fees,
            totalAmount,
            collectedBy: user.uid,
            date,
            timestamp,
          };

          addDoc(incomesCol, incomeData).catch(error => {
              console.error('Error adding income:', error);
              const permissionError = new FirestorePermissionError({
                  path: 'incomes',
                  operation: 'create',
                  requestResourceData: incomeData,
              });
              errorEmitter.emit('permission-error', permissionError);
          });
          return true;
        }
        return false;
      };
      
      const primaryAdded = processFees('Primary', feeFields.primary);
      const highAdded = processFees('High', feeFields.high);

      if (!primaryAdded && !highAdded) {
        toast({
          variant: 'destructive',
          title: 'No fees entered',
          description: 'Please enter an amount for at least one fee type.',
        });
        return;
      }
      
      toast({ title: 'Success', description: `Income entr${(primaryAdded && highAdded) ? 'ies' : 'y'} submitted successfully.` });
      form.reset();

    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
               <h3 className="text-lg font-medium">Student Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., S12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10th" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">Primary Section Fees</h3>
                    {feeFields.primary.map(fieldInfo => (
                        <FormField
                            key={fieldInfo.name}
                            control={form.control}
                            name={fieldInfo.name as keyof FeeCollectionFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{fieldInfo.label}</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                 <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">High School Section Fees</h3>
                     {feeFields.high.map(fieldInfo => (
                        <FormField
                            key={fieldInfo.name}
                            control={form.control}
                            name={fieldInfo.name as keyof FeeCollectionFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{fieldInfo.label}</FormLabel>
                                    <FormControl>
                                       <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Collection'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
