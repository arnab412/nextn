import type { Timestamp } from 'firebase/firestore';

export interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  section: 'Primary' | 'High';
  parentPhone: string;
}

export type FeeType = 'Tuition' | 'Exam' | 'Fine' | 'Admission';

export interface FeeDetails {
    Tuition?: number;
    Exam?: number;
    Fine?: number;
    Admission?: number;
}
export interface Income {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  section: 'Primary' | 'High';
  fees: FeeDetails;
  totalAmount: number;
  date: string; // ISO String
  timestamp: Timestamp;
  collectedBy: string;
}

export type ExpenseCategory = 'Salary' | 'Maintenance' | 'Electricity' | 'Entertainment' | 'Stationery' | 'Other';
export type PaymentMode = 'Cash' | 'Bank';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  payTo: string;
  voucherNo: string;
  amount: number;
  date: string; // ISO String
  description: string;
  timestamp: Timestamp;
  paymentMode: PaymentMode;
}

export interface DailyRegister {
  id: string; // YYYY-MM-DD
  date: string; // ISO String
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  systemBalance: number;
}

export interface Transaction extends Partial<Income>, Partial<Expense> {
  type: 'income' | 'expense';
  transactionTime: Date;
  // amount is from Expense, totalAmount is from Income
  amount?: number;
  totalAmount?: number;
}
