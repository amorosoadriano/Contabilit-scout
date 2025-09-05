import { Category, PaymentMethod, Unit, Siblings, QuoteSettings } from './types';

export const INITIAL_QUOTE_SETTINGS: QuoteSettings = {
  installments: {
    first: 0,
    second: 0,
    third: 0,
    summerCamp: 0,
  },
  siblingDiscounts: {
    '0': 0,
    '1': 0,
    '2': 0,
    '>2': 0,
  },
  groupFee: 0,
  bpParkFee: 0,
  censimento: 0,
  preCamp: 0,
};

export const INITIAL_GROUPS = [
  { id: 'group1', name: 'Branco', color: 'bg-yellow-500', quoteSettings: JSON.parse(JSON.stringify(INITIAL_QUOTE_SETTINGS)) },
  { id: 'group2', name: 'Reparto', color: 'bg-green-500', quoteSettings: JSON.parse(JSON.stringify(INITIAL_QUOTE_SETTINGS)) },
  { id: 'group3', name: 'Noviziato', color: 'bg-orange-500', quoteSettings: JSON.parse(JSON.stringify(INITIAL_QUOTE_SETTINGS)) },
  { id: 'group4', name: 'Clan', color: 'bg-red-500', quoteSettings: JSON.parse(JSON.stringify(INITIAL_QUOTE_SETTINGS)) },
  { id: 'group5', name: 'Co.Ca.', color: 'bg-purple-500', quoteSettings: JSON.parse(JSON.stringify(INITIAL_QUOTE_SETTINGS)) },
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

export const GROUP_COLORS = [
  'bg-slate-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

export const SIBLINGS_OPTIONS: Siblings[] = ['0', '1', '2', '>2'];

export const INITIAL_UNITS: Unit[] = [
    { id: 'unit1', name: 'Lupi' },
    { id: 'unit2', name: 'Aquile' },
    { id: 'unit3', name: 'Volpi' },
    { id: 'unit4', name: 'Cervi' },
];