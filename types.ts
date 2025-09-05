export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentMethod {
  CASH = 'Contanti',
  TRANSFER = 'Bonifico',
  CARD = 'Bancomat',
}

export interface Transaction {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string; // Category ID
  paymentMethod: PaymentMethod;
}

export interface Group {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
}

export type ModalType = 'transaction' | 'category' | 'password' | 'settings';