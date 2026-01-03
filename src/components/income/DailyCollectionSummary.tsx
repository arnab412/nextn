'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCashRegister } from '@/hooks/use-cash-register';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { FeeDetails } from '@/types';
import { Badge } from '@/components/ui/badge';

type SectionSummary = {
  Tuition: number;
  Exam: number;
  Fine: number;
  Admission: number;
  total: number;
  count: number;
};

export default function DailyCollectionSummary() {
  const { incomes, isLoading } = useCashRegister();

  const summary = useMemo(() => {
    const primary: SectionSummary = { Tuition: 0, Exam: 0, Fine: 0, Admission: 0, total: 0, count: 0 };
    const high: SectionSummary = { Tuition: 0, Exam: 0, Fine: 0, Admission: 0, total: 0, count: 0 };

    incomes.forEach(income => {
      const targetSection = income.section === 'Primary' ? primary : high;
      targetSection.count += 1;
      
      for (const feeType in income.fees) {
          if (Object.prototype.hasOwnProperty.call(income.fees, feeType)) {
              const amount = income.fees[feeType as keyof FeeDetails];
              // Ensure amount is a valid number, default to 0 if not.
              const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
              if (feeType in targetSection) {
                  targetSection[feeType as keyof SectionSummary] += validAmount;
              }
          }
      }
      // Ensure totalAmount is valid before adding.
      const validTotalAmount = typeof income.totalAmount === 'number' && !isNaN(income.totalAmount) ? income.totalAmount : 0;
      targetSection.total += validTotalAmount;
    });
    
    const grandTotal = primary.total + high.total;

    return { primary, high, grandTotal };
  }, [incomes]);

  if (isLoading) {
    return <SummarySkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Collections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Primary Section</h3>
            <Badge variant="secondary">{summary.primary.count}</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <SummaryRow label="Tuition Fees" value={summary.primary.Tuition} />
            <SummaryRow label="Exam Fees" value={summary.primary.Exam} />
            <SummaryRow label="Fines" value={summary.primary.Fine} />
          </div>
          <Separator className="my-2" />
          <SummaryRow label="Primary Total" value={summary.primary.total} isTotal />
        </div>

        {/* High School Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">High School Section</h3>
            <Badge variant="secondary">{summary.high.count}</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <SummaryRow label="Tuition Fees" value={summary.high.Tuition} />
            <SummaryRow label="Exam Fees" value={summary.high.Exam} />
            <SummaryRow label="Fines" value={summary.high.Fine} />
          </div>
          <Separator className="my-2" />
          <SummaryRow label="High School Total" value={summary.high.total} isTotal />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center font-bold text-lg">
        <span>Grand Total</span>
        <span>{formatCurrency(summary.grandTotal)}</span>
      </CardFooter>
    </Card>
  );
}

function SummaryRow({ label, value, isTotal = false }: { label: string; value: number; isTotal?: boolean }) {
  if (value === 0 && !isTotal) return null;
  
  return (
    <div className={`flex justify-between ${isTotal ? 'font-semibold' : ''}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
        </div>
         <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-1/2" />
      </CardFooter>
    </Card>
  );
}
