import React from 'react';
import { Transaction, TransactionType, Group } from '../types';
import { TrashIcon, PencilIcon } from './icons/Icons';

interface TransactionListProps {
  transactions: Transaction[];
  groups: Group[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  hasActiveFilters: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, groups, onDelete, onEdit, hasActiveFilters }) => {
  const groupMap = new Map(groups.map(g => [g.id, g]));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (transactions.length === 0) {
    const message = hasActiveFilters
      ? { title: "Nessuna Corrispondenza", body: "Nessuna transazione corrisponde ai filtri di ricerca selezionati." }
      : { title: "Nessuna Transazione", body: "Inizia aggiungendo una nuova entrata o uscita." };

    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">{message.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{message.body}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gruppo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrizione</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Importo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Azioni</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {transactions.map(t => {
              const groupInfo = groupMap.get(t.groupId);
              const isIncome = t.type === TransactionType.INCOME;
              return (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${groupInfo?.color} text-white`}>
                      {groupInfo?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{t.description}</div>
                    <div className="text-sm text-slate-500">
                      <div className="flex items-center">
                          <span>{t.type === TransactionType.EXPENSE ? `${t.category} - ${t.paymentMethod}` : t.paymentMethod}</span>
                          {t.isCampExpense && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              Campo
                            </span>
                          )}
                      </div>
                      {t.advancedBy && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                              Anticipato da: {t.advancedBy}
                          </div>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? `+ ${formatCurrency(t.amount)}` : `- ${formatCurrency(t.amount)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(t.date).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                       <button onClick={() => onEdit(t)} className="text-blue-600 hover:text-blue-900 transition-colors" aria-label={`Modifica transazione ${t.description}`}>
                        <PencilIcon className="w-5 h-5"/>
                       </button>
                       <button onClick={() => onDelete(t.id)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`Elimina transazione ${t.description}`}>
                         <TrashIcon className="w-5 h-5"/>
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;