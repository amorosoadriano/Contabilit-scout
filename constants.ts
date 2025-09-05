import { Category, PaymentMethod, Unit, Siblings, QuoteSettings, UserPermissions } from './types';

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

const BRANCO_QUOTE_SETTINGS: QuoteSettings = {
  ...INITIAL_QUOTE_SETTINGS,
  groupFee: 6,
  bpParkFee: 1,
  censimento: 40,
  preCamp: 15,
};

const REPARTO_QUOTE_SETTINGS: QuoteSettings = {
  ...INITIAL_QUOTE_SETTINGS,
  groupFee: 6,
  bpParkFee: 1,
  censimento: 40,
  preCamp: 15,
};

const NOVIZIATO_QUOTE_SETTINGS: QuoteSettings = {
  ...INITIAL_QUOTE_SETTINGS,
  groupFee: 6,
  bpParkFee: 1,
  censimento: 40,
  preCamp: 15,
};

const CLAN_QUOTE_SETTINGS: QuoteSettings = {
  ...INITIAL_QUOTE_SETTINGS,
  groupFee: 6,
  bpParkFee: 1,
  censimento: 40,
  preCamp: 0,
};

const COCA_QUOTE_SETTINGS: QuoteSettings = {
  ...INITIAL_QUOTE_SETTINGS,
  groupFee: 0,
  bpParkFee: 1,
  censimento: 40,
  preCamp: 0,
};

export const INITIAL_USER_PERMISSIONS: UserPermissions = {
  canAddTransaction: true,
  canEditTransaction: false,
  canDeleteTransaction: false,
  canExport: false,
  canViewQuote: false,
  canEditMembers: false,
  canEditInstallments: false,
  canViewConti: false,
  canViewAnticipi: false,
  canManageFundTransfers: false,
  canManageInternalTransfers: false,
  canViewAutofinanziamenti: false,
  canManageAutofinanziamenti: false,
};

export const INITIAL_GROUPS = [
  { id: 'group1', name: 'Branco', color: 'bg-yellow-500', quoteSettings: JSON.parse(JSON.stringify(BRANCO_QUOTE_SETTINGS)) },
  { id: 'group2', name: 'Reparto', color: 'bg-green-500', quoteSettings: JSON.parse(JSON.stringify(REPARTO_QUOTE_SETTINGS)) },
  { id: 'group3', name: 'Noviziato', color: 'bg-orange-500', quoteSettings: JSON.parse(JSON.stringify(NOVIZIATO_QUOTE_SETTINGS)) },
  { id: 'group4', name: 'Clan', color: 'bg-red-500', quoteSettings: JSON.parse(JSON.stringify(CLAN_QUOTE_SETTINGS)) },
  { id: 'group5', name: 'Co.Ca.', color: 'bg-purple-500', quoteSettings: JSON.parse(JSON.stringify(COCA_QUOTE_SETTINGS)) },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Cancelleria' },
  { id: 'cat2', name: 'La Tenda' },
  { id: 'cat3', name: 'Ferramenta' },
  { id: 'cat4', name: 'Materiale' },
  { id: 'cat5', name: 'Infermeria' },
  { id: 'cat6', name: 'Trasporti' },
  { id: 'cat7', name: 'Vitto' },
  { id: 'cat8', name: 'Materiale per uscita' },
  { id: 'cat9', name: 'Posto uscita' },
  { id: 'cat10', name: 'Trasporti uscita' },
  { id: 'cat11', name: 'Quote sq.' },
  { id: 'cat12', name: 'campetto AGESCI' },
  { id: 'cat13', name: 'Quota BP Park' },
  { id: 'cat14', name: 'Eventi' },
  { id: 'cat15', name: 'Campo estivo' },
  { id: 'cat16', name: 'Alta Sq' },
  { id: 'cat17', name: 'Autof Sq' },
  { id: 'cat18', name: 'Censimento' },
  { id: 'cat19', name: 'Quote mensili' },
  { id: 'cat20', name: 'Sede' },
  { id: 'cat21', name: 'Formazione Capi' },
  { id: 'cat22', name: 'Eventi Gruppo' },
  { id: 'cat23', name: 'Sito' },
  { id: 'cat24', name: 'Supporto Branche' },
  { id: 'cat25', name: 'Donazioni' },
  { id: 'cat26', name: 'Inizio anno' },
  { id: 'cat27', name: 'Debito Coca' },
  { id: 'cat28', name: 'Spese banca' },
  { id: 'cat29', name: 'Prelievo' },
  { id: 'cat30', name: 'Deposito' },
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