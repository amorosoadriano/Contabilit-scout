import { Transaction, Group } from '../types';

export const exportToCsv = (transactions: Transaction[], filename: string, groups: Group[]): void => {
  if (transactions.length === 0) {
    alert('Nessuna transazione da esportare.');
    return;
  }

  const groupMap = new Map(groups.map(g => [g.id, g.name]));

  const headers = [
    'ID',
    'Data',
    'Gruppo',
    'Descrizione',
    'Tipo',
    'Categoria',
    'Importo',
    'Metodo di Pagamento'
  ];

  const rows = transactions.map(t => [
    t.id,
    t.date,
    groupMap.get(t.groupId) || 'N/A',
    `"${t.description.replace(/"/g, '""')}"`, // Handle quotes in description
    t.type === 'INCOME' ? 'Entrata' : 'Uscita',
    t.category,
    t.type === 'INCOME' ? t.amount : -t.amount,
    t.paymentMethod
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};