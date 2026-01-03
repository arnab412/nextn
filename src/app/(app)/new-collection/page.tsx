'use client';

import IncomeForm from "@/components/income/IncomeForm";
import DailyCollectionSummary from "@/components/income/DailyCollectionSummary";
import { CashRegisterProvider } from '@/context/CashRegisterContext';

export default function NewCollectionPage() {
  return (
    <CashRegisterProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">New Fee Collection</h1>
            <p className="text-muted-foreground">
              Record new income transactions. Enter details for Primary or High sections.
            </p>
          </div>
          <IncomeForm />
        </div>
        <div className="lg:col-span-1">
           <div className="sticky top-24">
             <DailyCollectionSummary />
           </div>
        </div>
      </div>
    </CashRegisterProvider>
  );
}
