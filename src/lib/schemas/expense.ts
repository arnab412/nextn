import { z } from 'zod';
import { ExpenseCategory, PaymentMode } from '@/types';

const expenseCategories: [ExpenseCategory, ...ExpenseCategory[]] = ['Salary', 'Maintenance', 'Electricity', 'Entertainment', 'Stationery', 'Other'];
const paymentModes: [PaymentMode, ...PaymentMode[]] = ['Cash', 'Bank'];

export const ExpenseFormSchema = z.object({
  payTo: z.string().min(1, 'Recipient name is required.'),
  category: z.enum(expenseCategories),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  voucherNo: z.string().min(1, 'Voucher number is required.'),
  description: z.string().min(1, 'Description is required.'),
  paymentMode: z.enum(paymentModes),
});
