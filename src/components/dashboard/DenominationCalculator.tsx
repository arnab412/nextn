'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Eraser } from 'lucide-react';

const denominations = [
  { value: 2000, label: '₹2000' },
  { value: 500, label: '₹500' },
  { value: 200, label: '₹200' },
  { value: 100, label: '₹100' },
  { value: 50, label: '₹50' },
  { value: 20, label: '₹20' },
  { value: 10, label: '₹10' },
  { value: 5, label: '₹5' },
  { value: 2, label: '₹2' },
  { value: 1, label: '₹1' },
];

export default function DenominationCalculator() {
  const [counts, setCounts] = useState<Record<number, number | ''>>(
    denominations.reduce((acc, d) => ({ ...acc, [d.value]: '' }), {})
  );

  const handleCountChange = (denomination: number, value: string) => {
    const numericValue = value === '' ? '' : parseInt(value, 10);
    if (numericValue === '' || (!isNaN(numericValue) && numericValue >= 0)) {
      setCounts(prev => ({ ...prev, [denomination]: numericValue }));
    }
  };
  
  const total = useMemo(() => {
    return denominations.reduce((acc, d) => {
      const count = counts[d.value];
      return acc + d.value * (typeof count === 'number' ? count : 0);
    }, 0);
  }, [counts]);

  const handleReset = () => {
     setCounts(denominations.reduce((acc, d) => ({ ...acc, [d.value]: '' }), {}));
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle className="text-xl">Cash Calculator</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleReset}>
          <Eraser className="h-5 w-5" />
          <span className="sr-only">Reset</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {denominations.map(d => (
            <div key={d.value} className="flex items-center gap-2">
              <span className="w-16 text-sm font-medium text-muted-foreground">{d.label}</span>
              <Input
                type="number"
                placeholder="0"
                value={counts[d.value] ?? ''}
                onChange={e => handleCountChange(d.value, e.target.value)}
                className="h-9 text-right"
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center text-lg font-bold text-primary">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
