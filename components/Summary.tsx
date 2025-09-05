
import React, { useMemo } from 'react';
import { Transaction, Group, TransactionType } from '../types';

interface SummaryProps {
  transactions: Transaction[];
  groups: Group[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
}

const Summary: React.FC<SummaryProps> = ({ transactions, groups, activeGroupId, onSelectGroup }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  const groupBalances = useMemo(() => {
    const balances = new Map<string, number>();
    groups.forEach(g => balances.set(g.id, 0));
    transactions.forEach(t => {
      const currentBalance = balances.get(t.groupId) || 0;
      const newBalance = t.type === TransactionType.INCOME ? currentBalance + t.amount : currentBalance - t.amount;
      balances.set(t.groupId, newBalance);
    });
    return balances;
  }, [transactions, groups]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-slate-600">Saldo Cassa Comune</h2>
        <p className={`text-4xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(totalBalance)}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
        <div 
          onClick={() => onSelectGroup(null)}
          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${!activeGroupId ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-slate-200 hover:bg-slate-300'}`}
        >
          <h3 className="font-bold text-md">Tutti i Gruppi</h3>
        </div>
        {groups.map(group => {
            const balance = groupBalances.get(group.id) || 0;
            const isActive = activeGroupId === group.id;
            return (
                <div
                    key={group.id}
                    onClick={() => onSelectGroup(group.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? `${group.color} text-white shadow-xl scale-105` : 'bg-slate-200 hover:bg-slate-300'}`}
                >
                    <h3 className="font-bold text-md">{group.name}</h3>
                    <p className={`font-semibold text-lg ${isActive ? 'text-white' : (balance >= 0 ? 'text-green-700' : 'text-red-700')}`}>
                        {formatCurrency(balance)}
                    </p>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default Summary;
