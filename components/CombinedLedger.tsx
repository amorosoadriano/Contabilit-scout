import React from 'react';
import { LedgerEntry, Group, LedgerEntryType } from '../types';
import { PencilSquareIcon, CurrencyDollarIcon, ArrowPathRoundedSquareIcon, ArrowUturnLeftIcon } from './icons/Icons';

interface CombinedLedgerProps {
  entries: LedgerEntry[];
  groups: Group[];
  hasActiveFilters: boolean;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
const formatDate = (date: string) => new Date(date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

const LedgerIcon: React.FC<{ type: LedgerEntryType }> = ({ type }) => {
    const iconClasses = "w-6 h-6 text-white";
    switch (type) {
        case LedgerEntryType.TRANSACTION_INCOME:
            return <div className="bg-green-500 rounded-full p-2"><PencilSquareIcon className={iconClasses} /></div>;
        case LedgerEntryType.TRANSACTION_EXPENSE:
            return <div className="bg-red-500 rounded-full p-2"><PencilSquareIcon className={iconClasses} /></div>;
        case LedgerEntryType.INSTALLMENT_PAYMENT:
            return <div className="bg-sky-500 rounded-full p-2"><CurrencyDollarIcon className={iconClasses} /></div>;
        case LedgerEntryType.FUND_TRANSFER:
            return <div className="bg-purple-500 rounded-full p-2"><ArrowPathRoundedSquareIcon className={iconClasses} /></div>;
        case LedgerEntryType.INTERNAL_TRANSFER:
            return <div className="bg-orange-500 rounded-full p-2"><ArrowUturnLeftIcon className={`${iconClasses} -scale-x-100`} /></div>;
        default:
            return null;
    }
};

const CombinedLedger: React.FC<CombinedLedgerProps> = ({ entries, groups, hasActiveFilters }) => {
    const groupMap = new Map(groups.map(g => [g.id, g]));

    if (entries.length === 0) {
        const message = hasActiveFilters
            ? { title: "Nessuna Corrispondenza", body: "Nessuna operazione corrisponde ai filtri di ricerca selezionati." }
            : { title: "Nessuna Operazione", body: "Il registro è vuoto. Inizia aggiungendo una transazione o registrando una quota." };

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
            <ul className="divide-y divide-slate-200">
                {entries.map(entry => {
                    const isIncome = [LedgerEntryType.TRANSACTION_INCOME, LedgerEntryType.INSTALLMENT_PAYMENT].includes(entry.type) || (entry.type === LedgerEntryType.INTERNAL_TRANSFER && entry.amount > 0) || (entry.type === LedgerEntryType.FUND_TRANSFER && entry.amount > 0);
                    const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

                    return (
                        <li key={entry.id} className="p-4 hover:bg-slate-50 flex items-start space-x-4">
                            <div className="flex-shrink-0 pt-1">
                                <LedgerIcon type={entry.type} />
                            </div>
                            <div className="flex-grow grid grid-cols-12 gap-2">
                                <div className="col-span-12 md:col-span-6">
                                    <p className="font-semibold text-slate-800">{entry.description}</p>
                                    <p className="text-sm text-slate-500">{entry.details}</p>
                                </div>
                                <div className="col-span-6 md:col-span-3">
                                    <p className="text-sm text-slate-500">{formatDate(entry.date)}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {entry.groupsInvolved.map(gid => {
                                            const group = groupMap.get(gid);
                                            return group ? (
                                                <span key={gid} className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${group.color} text-white`}>
                                                    {group.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                                <div className="col-span-6 md:col-span-3 text-right">
                                    <p className={`text-lg font-bold ${amountColor}`}>
                                        {[LedgerEntryType.TRANSACTION_INCOME, LedgerEntryType.INSTALLMENT_PAYMENT].includes(entry.type) ? `+ ${formatCurrency(entry.amount)}` : (entry.type === LedgerEntryType.TRANSACTION_EXPENSE ? `- ${formatCurrency(entry.amount)}` : formatCurrency(entry.amount))}
                                    </p>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default CombinedLedger;
