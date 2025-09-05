import { Category, PaymentMethod } from './types';

export const INITIAL_GROUPS = [
  { id: 'group1', name: 'Amministrazione', color: 'bg-blue-500' },
  { id: 'group2', name: 'Logistica', color: 'bg-green-500' },
  { id: 'group3', name: 'Marketing', color: 'bg-purple-500' },
  { id: 'group4', name: 'Vendite', color: 'bg-yellow-500' },
  { id: 'group5', name: 'Ricerca & Sviluppo', color: 'bg-red-500' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Cibo & Bevande' },
  { id: 'cat2', name: 'Trasporti' },
  { id: 'cat3', name: 'Utenze' },
  { id: 'cat4', name: 'Materiale d\'ufficio' },
  { id: 'cat5', name: 'Manutenzione' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.TRANSFER,
  PaymentMethod.CARD,
];