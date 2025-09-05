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
  category: string; // Category Name
  paymentMethod: PaymentMethod;
  isCampExpense: boolean;
  advancedBy: string | null;
  repaid: boolean;
  repaidDate: string | null;
  repaymentMethod: PaymentMethod | null;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  quoteSettings: QuoteSettings;
}

export interface Category {
  id: string;
  name: string;
}

export type ModalType = 'transaction' | 'category' | 'password' | 'settings';

export type ViewType = 'contabilita' | 'quote' | 'conti' | 'anticipi';

export type Siblings = '0' | '1' | '2' | '>2';

export interface Unit {
  id: string;
  name: string;
}

export interface Installment {
  amount: number;
  date: string | null; // YYYY-MM-DD, null if not paid
  paymentMethod: PaymentMethod | null;
}

export interface MemberInstallments {
  first: Installment;
  second: Installment;
  third: Installment;
  summerCamp: Installment;
}

export interface Member {
  id:string;
  groupId: string;
  name: string;
  unit: string; // Unit name
  siblings: Siblings;
  installments: MemberInstallments;
}

export interface QuoteSettings {
  installments: {
    first: number;
    second: number;
    third: number;
    summerCamp: number;
  };
  siblingDiscounts: {
    [key in Siblings]: number; // Discount percentage (e.g., 10 for 10%)
  };
  groupFee: number;
  bpParkFee: number;
  censimento: number;
  preCamp: number;
}