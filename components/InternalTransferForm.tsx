
import React, { useState, useMemo } from 'react';
import { Group, PaymentMethod, InternalTransfer } from '../types';
import { PAYMENT_METHODS } from '../constants';

interface InternalTransferFormProps {
    groups: Group[];
    onSave: (transferData: Omit<InternalTransfer, 'id'>) => void;
    managerGroupId: string;
    internalTransfers: InternalTransfer[];
}

type TransferDirection = 'loan' | 'repayment';

const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
const formatDate = (date: string) => new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

const InternalTransferForm: React.FC<InternalTransferFormProps> = ({ groups, onSave, managerGroupId, internalTransfers }) => {
    const [direction, setDirection] = useState<TransferDirection>('loan');
    const [otherGroupId, setOtherGroupId] = useState<string>(groups.find(g => g.id !== managerGroupId)?.id || '');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

    const loanData = useMemo(() => {
        if (!otherGroupId) return { loans: [], totalDebt: 0 };

        const loansToGroup = internalTransfers.filter(
            t => t.fromGroupId === managerGroupId && t.toGroupId === otherGroupId && !t.isRepayment
        );
        const repaymentsFromGroup = internalTransfers.filter(
            t => t.fromGroupId === otherGroupId && t.toGroupId === managerGroupId && t.isRepayment
        );

        const totalLoaned = loansToGroup.reduce((sum, t) => sum + t.amount, 0);
        const totalRepaid = repaymentsFromGroup.reduce((sum, t) => sum + t.amount, 0);
        
        const totalDebt = totalLoaned - totalRepaid;

        return { 
            loans: loansToGroup.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), 
            totalDebt 
        };

    }, [internalTransfers, otherGroupId, managerGroupId]);


    const handleLoanSelection = (loan: InternalTransfer) => {
        setSelectedLoanId(loan.id);
        setAmount(String(loan.amount));
        setDescription(`Restituzione per: "${loan.description}"`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0 || !otherGroupId || !description) {
            alert('Compila tutti i campi correttamente.');
            return;
        }

        if (direction === 'repayment' && parsedAmount > loanData.totalDebt) {
            alert(`L'importo da restituire (${formatCurrency(parsedAmount)}) non può superare il debito totale di ${formatCurrency(loanData.totalDebt)}.`);
            return;
        }

        const fromGroupId = direction === 'loan' ? managerGroupId : otherGroupId;
        const toGroupId = direction === 'loan' ? otherGroupId : managerGroupId;
        
        onSave({
            date,
            fromGroupId,
            toGroupId,
            amount: parsedAmount,
            paymentMethod,
            description,
            isRepayment: direction === 'repayment'
        });
    };

    const formId = React.useId();
    const managerGroupName = groups.find(g => g.id === managerGroupId)?.name || 'Cassa di Gruppo';
    const availableGroups = useMemo(() => groups.filter(g => g.id !== managerGroupId), [groups, managerGroupId]);
    
    // Reset fields when direction changes
    React.useEffect(() => {
        setAmount('');
        setDescription('');
        setSelectedLoanId(null);
    }, [direction]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transfer Direction */}
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-200 p-1">
                <button type="button" onClick={() => setDirection('loan')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${direction === 'loan' ? 'bg-white text-slate-800 shadow' : 'text-slate-600'}`}>
                    Cessione / Prestito
                </button>
                <button type="button" onClick={() => setDirection('repayment')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${direction === 'repayment' ? 'bg-white text-slate-800 shadow' : 'text-slate-600'}`}>
                    Restituzione
                </button>
            </div>
            
            <p className="text-sm text-slate-600 bg-slate-100 p-2 rounded-md text-center">
                {direction === 'loan' 
                    ? `Stai trasferendo fondi da "${managerGroupName}" a un altro gruppo.`
                    : `Un gruppo sta restituendo fondi a "${managerGroupName}".`}
            </p>

            {direction === 'loan' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={`${formId}-amount-loan`} className="block text-sm font-medium text-slate-700">Importo (€)</label>
                            <input
                                id={`${formId}-amount-loan`}
                                type="number" value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00" step="0.01" min="0.01" required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor={`${formId}-date-loan`} className="block text-sm font-medium text-slate-700">Data</label>
                            <input
                                id={`${formId}-date-loan`}
                                type="date" value={date}
                                onChange={(e) => setDate(e.target.value)} required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={`${formId}-otherGroupId-loan`} className="block text-sm font-medium text-slate-700">Gruppo Beneficiario</label>
                            <select id={`${formId}-otherGroupId-loan`} value={otherGroupId} onChange={(e) => setOtherGroupId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                {availableGroups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor={`${formId}-payment-loan`} className="block text-sm font-medium text-slate-700">Metodo Trasferimento</label>
                            <select id={`${formId}-payment-loan`} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                {PAYMENT_METHODS.filter(pm => pm !== PaymentMethod.CARD).map(pm => (
                                    <option key={pm} value={pm}>{pm === PaymentMethod.TRANSFER ? 'Banca (Bonifico)' : pm}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor={`${formId}-description-loan`} className="block text-sm font-medium text-slate-700">Descrizione</label>
                        <input
                            id={`${formId}-description-loan`}
                            type="text" value={description}
                            onChange={(e) => setDescription(e.target.value)} required
                            placeholder="Es. Prestito per acquisto materiale"
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </>
            )}

            {direction === 'repayment' && (
                <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                        <label htmlFor={`${formId}-otherGroupId-repayment`} className="block text-sm font-medium text-slate-700">Gruppo che restituisce</label>
                        <select id={`${formId}-otherGroupId-repayment`} value={otherGroupId} onChange={(e) => setOtherGroupId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            {availableGroups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                         <p className="mt-2 text-md font-semibold text-center">
                            Debito Totale: <span className="text-red-600">{formatCurrency(loanData.totalDebt)}</span>
                        </p>
                    </div>

                    {loanData.totalDebt > 0 ? (
                        <>
                             {loanData.loans.length > 0 && (
                                <div>
                                    <h3 className="text-md font-medium text-slate-800">Seleziona un prestito per compilare i campi (opzionale)</h3>
                                    <div className="space-y-1 mt-2 max-h-40 overflow-y-auto border border-slate-200 rounded-md p-2 bg-white">
                                        {loanData.loans.map(loan => (
                                            <label key={loan.id} className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedLoanId === loan.id ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-300' : 'hover:bg-slate-100'}`}>
                                                <input type="radio" name="loanSelection" value={loan.id} checked={selectedLoanId === loan.id} onChange={() => handleLoanSelection(loan)} className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"/>
                                                <div className="ml-3 text-sm flex-grow">
                                                    <p className="font-medium text-slate-800">{loan.description}</p>
                                                    <p className="text-slate-500">{formatDate(loan.date)} - {formatCurrency(loan.amount)}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label htmlFor={`${formId}-amount-repayment`} className="block text-sm font-medium text-slate-700">Importo da restituire (€)</label>
                                    <input id={`${formId}-amount-repayment`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0.01" max={loanData.totalDebt} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                                </div>
                                <div>
                                    <label htmlFor={`${formId}-date-repayment`} className="block text-sm font-medium text-slate-700">Data Restituzione</label>
                                    <input id={`${formId}-date-repayment`} type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                                </div>
                            </div>
                             <div>
                                <label htmlFor={`${formId}-payment-repayment`} className="block text-sm font-medium text-slate-700">Metodo Restituzione</label>
                                <select id={`${formId}-payment-repayment`} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    {PAYMENT_METHODS.filter(pm => pm !== PaymentMethod.CARD).map(pm => (
                                        <option key={pm} value={pm}>{pm === PaymentMethod.TRANSFER ? 'Banca (Bonifico)' : pm}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`${formId}-description-repayment`} className="block text-sm font-medium text-slate-700">Descrizione</label>
                                <input id={`${formId}-description-repayment`} type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Es. Restituzione prestito acquisto materiale" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                            </div>
                        </>
                    ) : (
                         <p className="text-center text-slate-500 py-4">Questo gruppo non ha prestiti da restituire.</p>
                    )}
                </div>
            )}

            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={(direction === 'repayment' && loanData.totalDebt <= 0) || !amount} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed">
                    Salva Trasferimento
                </button>
            </div>
        </form>
    );
};

export default InternalTransferForm;
