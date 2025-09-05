
import React, { useState, useMemo } from 'react';
import { Group, FundTransferType, FundTransfer } from '../types';

interface FundTransferFormProps {
    groups: Group[];
    onSave: (transferData: Omit<FundTransfer, 'id'>) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

const FundTransferForm: React.FC<FundTransferFormProps> = ({ groups, onSave }) => {
    const [type, setType] = useState<FundTransferType>(FundTransferType.WITHDRAWAL);
    const [totalAmount, setTotalAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [distribution, setDistribution] = useState<Record<string, string>>(
        groups.reduce((acc, group) => ({ ...acc, [group.id]: '' }), {})
    );

    const distributedTotal = useMemo(() => {
        return Object.values(distribution).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    }, [distribution]);

    const handleDistributionChange = (groupId: string, value: string) => {
        setDistribution(prev => ({ ...prev, [groupId]: value }));
    };

    const isDistributionValid = useMemo(() => {
        const total = parseFloat(totalAmount);
        return total > 0 && total === distributedTotal;
    }, [totalAmount, distributedTotal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isDistributionValid || !description) {
            alert('Assicurati che l\'importo totale sia distribuito correttamente e che la descrizione sia compilata.');
            return;
        }

        const finalDistribution = Object.entries(distribution).reduce((acc, [groupId, amountStr]) => {
            const amount = parseFloat(amountStr) || 0;
            if (amount > 0) {
                acc[groupId] = amount;
            }
            return acc;
        }, {} as Record<string, number>);

        onSave({
            date,
            type,
            totalAmount: parseFloat(totalAmount),
            description,
            distribution: finalDistribution,
        });
    };

    const formId = React.useId();
    const remainingToDistribute = (parseFloat(totalAmount) || 0) - distributedTotal;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transfer Type */}
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-200 p-1">
                <button type="button" onClick={() => setType(FundTransferType.WITHDRAWAL)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === FundTransferType.WITHDRAWAL ? 'bg-white text-slate-800 shadow' : 'text-slate-600'}`}>
                    Prelievo (da Banca a Contanti)
                </button>
                <button type="button" onClick={() => setType(FundTransferType.DEPOSIT)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === FundTransferType.DEPOSIT ? 'bg-white text-slate-800 shadow' : 'text-slate-600'}`}>
                    Versamento (da Contanti a Banca)
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor={`${formId}-totalAmount`} className="block text-sm font-medium text-slate-700">Importo Totale (€)</label>
                    <input
                        id={`${formId}-totalAmount`}
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01" min="0.01" required
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
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
            </div>

            <div>
                <label htmlFor={`${formId}-description`} className="block text-sm font-medium text-slate-700">Descrizione</label>
                <input
                    id={`${formId}-description`}
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder={type === FundTransferType.WITHDRAWAL ? 'Es. Prelievo per cassa branca' : 'Es. Versamento quote'}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            
            <div className="pt-2">
                <h3 className="text-md font-medium text-slate-800">
                    Distribuzione Contanti per Gruppo
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    {type === FundTransferType.WITHDRAWAL 
                        ? 'Assegna i contanti prelevati ai vari gruppi.' 
                        : 'Specifica da quale cassa di gruppo provengono i contanti versati.'}
                </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {groups.map(group => (
                    <div key={group.id} className="grid grid-cols-3 gap-3 items-center">
                        <label htmlFor={`${formId}-${group.id}`} className="col-span-1 text-sm font-medium text-slate-700">{group.name}</label>
                        <div className="col-span-2">
                             <input
                                id={`${formId}-${group.id}`}
                                type="number"
                                value={distribution[group.id]}
                                onChange={(e) => handleDistributionChange(group.id, e.target.value)}
                                placeholder="0.00"
                                step="0.01" min="0"
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className={`p-3 rounded-md text-center text-sm font-semibold transition-colors ${
                isDistributionValid ? 'bg-green-100 text-green-800' : (totalAmount ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')
            }`}>
                {isDistributionValid 
                    ? `Totale distribuito: ${formatCurrency(distributedTotal)}`
                    : `Da distribuire: ${formatCurrency(remainingToDistribute)}`
                }
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={!isDistributionValid || !description} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed">
                    Salva Giroconto
                </button>
            </div>
        </form>
    )
};

export default FundTransferForm;