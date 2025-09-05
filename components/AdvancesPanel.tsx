import React, { useMemo } from 'react';
import { Transaction, PaymentMethod } from '../types';
import { ArrowUturnLeftIcon } from './icons/Icons';
import { PAYMENT_METHODS } from '../constants';

interface AdvancesPanelProps {
  transactions: Transaction[];
  onUpdateRepayment: (transactionId: string, repaid: boolean, repaidDate: string | null, repaymentMethod: PaymentMethod | null) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; id: string }> = ({ checked, onChange, id }) => (
    <button
        id={id}
        onClick={() => onChange(!checked)}
        className={`${
        checked ? 'bg-green-600' : 'bg-slate-300'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        role="switch"
        aria-checked={checked}
    >
        <span className={`${
        checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
    </button>
);

const AdvancesPanel: React.FC<AdvancesPanelProps> = ({ transactions, onUpdateRepayment }) => {
  const advancesByPerson = useMemo(() => {
    const advances = transactions.filter(t => t.advancedBy).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const grouped: Record<string, Transaction[]> = {};
    for (const t of advances) {
      const person = t.advancedBy!;
      if (!grouped[person]) {
        grouped[person] = [];
      }
      grouped[person].push(t);
    }
    return grouped;
  }, [transactions]);

  const totalToRepay = useMemo(() => {
    return transactions
      .filter(t => t.advancedBy && !t.repaid)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const handleRepaymentChange = (txId: string, isRepaid: boolean) => {
    const repaidDate = isRepaid ? new Date().toISOString().split('T')[0] : null;
    const repaymentMethod = isRepaid ? PaymentMethod.CASH : null;
    onUpdateRepayment(txId, isRepaid, repaidDate, repaymentMethod);
  };

  const handleDateChange = (tx: Transaction, date: string) => {
    if (date) {
      onUpdateRepayment(tx.id, true, date, tx.repaymentMethod);
    }
  };

  const handleMethodChange = (tx: Transaction, method: PaymentMethod) => {
    onUpdateRepayment(tx.id, true, tx.repaidDate, method);
  }
  
  const peopleWithAdvances = Object.keys(advancesByPerson);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold text-slate-600">Totale Anticipi da Rimborsare</h2>
        <p className="text-4xl font-bold text-blue-600 mt-2">
          {formatCurrency(totalToRepay)}
        </p>
      </div>

      {peopleWithAdvances.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <ArrowUturnLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Nessun Anticipo Registrato</h3>
            <p className="mt-1 text-sm text-gray-500">Quando registri una spesa, puoi indicare se è stata anticipata da un membro del Co.Ca.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {peopleWithAdvances.map(person => {
            const personAdvances = advancesByPerson[person];
            const personTotalToRepay = personAdvances
              .filter(t => !t.repaid)
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={person} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">{person}</h3>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Da rimborsare</p>
                    <p className="text-xl font-semibold text-red-600">{formatCurrency(personTotalToRepay)}</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrizione</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Importo</th>
                                <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Restituita</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data Rest.</th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Metodo Rimborso</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {personAdvances.map(tx => (
                                <tr key={tx.id} className={`${tx.repaid ? 'bg-green-50' : ''}`}>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${tx.repaid ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
                                        {tx.description}
                                        <span className="block text-xs text-slate-400">{formatDate(tx.date)}</span>
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${tx.repaid ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                        {formatCurrency(tx.amount)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <ToggleSwitch
                                            id={`repaid-${tx.id}`}
                                            checked={tx.repaid}
                                            onChange={(isChecked) => handleRepaymentChange(tx.id, isChecked)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {tx.repaid && (
                                            <input
                                                type="date"
                                                value={tx.repaidDate || ''}
                                                onChange={(e) => handleDateChange(tx, e.target.value)}
                                                className="block w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {tx.repaid && (
                                            <select
                                                value={tx.repaymentMethod || ''}
                                                onChange={(e) => handleMethodChange(tx, e.target.value as PaymentMethod)}
                                                className="mt-1 block w-full pl-3 pr-8 py-1 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                            >
                                                {PAYMENT_METHODS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvancesPanel;