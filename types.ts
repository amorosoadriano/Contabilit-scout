export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentMethod {
  CASH = 'Contanti',
  TRANSFER = 'Bonifico',
  CARD = 'Carta',
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  groupId: string;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  isCampExpense?: boolean;
  advancedBy?: string | null;
  repaid: boolean;
  repaidDate?: string | null;
  repaymentMethod?: PaymentMethod | null;
  selfFinancingId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface QuoteSettings {
  installments: {
    first: number;
    second: number;
    third: number;
    summerCamp: number;
  };
  siblingDiscounts: {
    '0': number;
    '1': number;
    '2': number;
    '>2': number;
  };
  groupFee: number;
  bpParkFee: number;
  censimento: number;
  preCamp: number;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  quoteSettings: QuoteSettings;
}

export type ViewType = 'contabilita' | 'quote' | 'conti' | 'anticipi' | 'autofinanziamenti';

export type Siblings = '0' | '1' | '2' | '>2';

export interface Installment {
  amount: number;
  date: string | null;
  paymentMethod: PaymentMethod | null;
  allocations?: {
    censimento: boolean;
    bpParkFee: boolean;
    groupFee: boolean;
    preCamp: boolean;
  }
}

export interface MemberInstallments {
  first: Installment;
  second: Installment;
  third: Installment;
  summerCamp: Installment;
}

export interface Member {
  id: string;
  name: string;
  groupId: string;
  unit: string;
  siblings: Siblings;
  installments: MemberInstallments;
}

export interface Unit {
  id: string;
  name: string;
}

export type UserRole = 'NONE' | 'USER' | 'ADMIN';

export interface UserPermissions {
  canAddTransaction: boolean;
  canEditTransaction: boolean;
  canDeleteTransaction: boolean;
  canExport: boolean;
  canViewQuote: boolean;
  canEditMembers: boolean;
  canEditInstallments: boolean;
  canViewConti: boolean;
  canViewAnticipi: boolean;
  canManageFundTransfers: boolean;
  canManageInternalTransfers: boolean;
  canViewAutofinanziamenti: boolean;
  canManageAutofinanziamenti: boolean;
}

export enum FundTransferType {
    WITHDRAWAL = 'WITHDRAWAL',
    DEPOSIT = 'DEPOSIT',
}

export interface FundTransfer {
    id: string;
    date: string;
    type: FundTransferType;
    totalAmount: number;
    description: string;
    distribution: Record<string, number>;
}

export interface InternalTransfer {
    id: string;
    date: string;
    fromGroupId: string;
    toGroupId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    description: string;
    isRepayment: boolean;
}

export interface SelfFinancingProject {
    id: string;
    name: string;
    groupId: string;
}

export enum LedgerEntryType {
  TRANSACTION_INCOME = 'TRANSACTION_INCOME',
  TRANSACTION_EXPENSE = 'TRANSACTION_EXPENSE',
  INSTALLMENT_PAYMENT = 'INSTALLMENT_PAYMENT',
  FUND_TRANSFER = 'FUND_TRANSFER',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: LedgerEntryType;
  description: string;
  amount: number;
  details: string;
  groupsInvolved: string[];
  originalObject: any;
}

export interface Filters {
  text: string;
  type: TransactionType | 'ALL';
  category: string;
  startDate: string;
  endDate: string;
  ledgerType: string;
  groupId: string;
}