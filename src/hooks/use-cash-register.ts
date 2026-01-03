'use client';
import { useContext } from 'react';
import { CashRegisterContext } from '@/context/CashRegisterContext';

export const useCashRegister = () => {
  const context = useContext(CashRegisterContext);
  if (!context) {
    throw new Error('useCashRegister must be used within a CashRegisterProvider');
  }
  return context;
};
