
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod, Category, Group } from '../types';
import { PAYMENT_METHODS } from '../constants';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id'>, id?: string) => void;
  categories: Category[];
  groups: Group[];
  initialData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, categories, groups, initialData }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [groupId, setGroupId] = useState<string>(groups[0]?.id || '');
  const [category, setCategory] = useState<string>(categories[0]?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);

  useEffect(() => {
    if (initialData) {
        setType(initialData.type);
        setAmount(String(initialData.amount));
        setDescription(initialData.description);
        setDate(initialData.date);
        setGroupId(initialData.groupId);
        setCategory(initialData.category);
        setPaymentMethod(initialData.paymentMethod);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !groupId) {
      alert('Per favore, compila tutti i campi obbligatori.');
      return;
    }

    onSave({
      amount: parseFloat(amount),
      description,
      date,
      groupId,
      type,
      category: type === TransactionType.EXPENSE ? category : '',
      paymentMethod,
    }, initialData?.id);
  };
  
  const formId = React.useId();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-200 p-1">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-white text-slate-800 shadow' : 'text-slate-600'}`}>
                Uscita
            </button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-white text-slate-800 shadow' : 'text-slate-600'}`}>
                Entrata
            </button>
        </div>

        {/* Amount */}
        <div>
            <label htmlFor={`${formId}-amount`} className="block text-sm font-medium text-slate-700">Importo (€)</label>
            <input
                id={`${formId}-amount`}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>

        {/* Description */}
        <div>
            <label htmlFor={`${formId}-description`} className="block text-sm font-medium text-slate-700">Descrizione</label>
            <input
                id={`${formId}-description`}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        
        {/* Date, Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor={`${formId}-date`} className="block text-sm font-medium text-slate-700">Data</label>
                <input
                    id={`${formId}-date`}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor={`${formId}-group`} className="block text-sm font-medium text-slate-700">Gruppo</label>
                <select id={`${formId}-group`} value={groupId} onChange={(e) => setGroupId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
            </div>
        </div>

        {/* Category, Payment Method (Conditional for Expense) */}
        {type === TransactionType.EXPENSE && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`${formId}-category`} className="block text-sm font-medium text-slate-700">Categoria</label>
                    <select id={`${formId}-category`} value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor={`${formId}-payment`} className="block text-sm font-medium text-slate-700">Pagamento</label>
                    <select id={`${formId}-payment`} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        {PAYMENT_METHODS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                    </select>
                </div>
            </div>
        )}

        <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm">
                {initialData ? 'Salva Modifiche' : 'Salva Transazione'}
            </button>
        </div>
    </form>
  );
};

export default TransactionForm;
