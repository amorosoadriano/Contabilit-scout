import React, { useState, useMemo } from 'react';
import { Member, MemberInstallments, Installment, QuoteSettings, PaymentMethod } from '../types';
import Modal from './Modal';
import { PAYMENT_METHODS } from '../constants';

interface InstallmentModalProps {
  member: Member;
  installmentKey: keyof MemberInstallments;
  onSave: (memberId: string, installmentKey: keyof MemberInstallments, data: Installment) => void;
  onClose: () => void;
  quoteSettings: QuoteSettings;
}

const installmentLabels: Record<keyof MemberInstallments, string> = {
  first: '1° Rata',
  second: '2° Rata',
  third: '3° Rata',
  summerCamp: 'Campo Estivo'
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

const InstallmentModal: React.FC<InstallmentModalProps> = ({ member, installmentKey, onSave, onClose, quoteSettings }) => {
  
  const calculateSuggestedAmount = () => {
    const currentInstallment = member.installments[installmentKey];
    if (currentInstallment && currentInstallment.amount > 0) {
      return String(currentInstallment.amount);
    }
    if (installmentKey !== 'first') return '';

    const baseAmount = quoteSettings.installments.first || 0;
    if (baseAmount === 0) return '';
    
    const discountPercent = quoteSettings.siblingDiscounts[member.siblings] || 0;
    const finalAmount = baseAmount * (1 - discountPercent / 100);
    return (Math.round(finalAmount * 100) / 100).toFixed(2);
  };
  
  const [amount, setAmount] = useState(calculateSuggestedAmount());
  const [date, setDate] = useState(member.installments[installmentKey]?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(member.installments[installmentKey]?.paymentMethod || PaymentMethod.TRANSFER);
  const [isAllocationStep, setIsAllocationStep] = useState(false);
  const [allocations, setAllocations] = useState({
      censimento: false,
      bpParkFee: false,
      groupFee: false,
      preCamp: false,
  });
  
  const formId = React.useId();

  const totalFixedFees = useMemo(() => {
    return (quoteSettings.censimento || 0) + (quoteSettings.bpParkFee || 0) + (quoteSettings.groupFee || 0) + (quoteSettings.preCamp || 0);
  }, [quoteSettings]);
  
  const handleAllocationChange = (fee: keyof typeof allocations) => {
    setAllocations(prev => ({ ...prev, [fee]: !prev[fee] }));
  };
  
  const allocatedTotal = useMemo(() => {
    let total = 0;
    if (allocations.censimento) total += quoteSettings.censimento;
    if (allocations.bpParkFee) total += quoteSettings.bpParkFee;
    if (allocations.groupFee) total += quoteSettings.groupFee;
    if (allocations.preCamp) total += quoteSettings.preCamp;
    return total;
  }, [allocations, quoteSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = parseFloat(amount.replace(',', '.')) || 0;
    
    // Check for partial payment on first installment
    if (installmentKey === 'first' && newAmount > 0 && newAmount < totalFixedFees) {
      setIsAllocationStep(true);
      return; // Stop here, wait for user allocation
    }

    const newDate = newAmount > 0 ? date : null;
    const newPaymentMethod = newAmount > 0 ? paymentMethod : null;
    let finalAllocations: Installment['allocations'] | undefined = undefined;

    if (installmentKey === 'first' && newAmount > 0) {
        finalAllocations = {
            censimento: true,
            bpParkFee: true,
            groupFee: true,
            preCamp: true,
        };
    }

    onSave(member.id, installmentKey, { 
      amount: newAmount, 
      date: newDate, 
      paymentMethod: newPaymentMethod,
      allocations: finalAllocations,
    });
    onClose();
  };
  
  const handleAllocationSubmit = () => {
      const newAmount = parseFloat(amount.replace(',', '.')) || 0;
      if (allocatedTotal > newAmount) {
          alert(`L'importo allocato (${formatCurrency(allocatedTotal)}) non può superare l'importo pagato (${formatCurrency(newAmount)}).`);
          return;
      }
      
      onSave(member.id, installmentKey, {
          amount: newAmount,
          date,
          paymentMethod,
          allocations,
      });
      onClose();
  };

  if (isAllocationStep) {
      const feeOptions: {key: keyof typeof allocations, label: string, amount: number}[] = [
          {key: 'censimento', label: 'Quota Censimento', amount: quoteSettings.censimento},
          {key: 'bpParkFee', label: 'Quota BP Park', amount: quoteSettings.bpParkFee},
          {key: 'groupFee', label: 'Cassa di Gruppo', amount: quoteSettings.groupFee},
          {key: 'preCamp', label: 'Pre-Campo', amount: quoteSettings.preCamp},
      ];

      return (
          <Modal title="Allocazione Pagamento Parziale" onClose={onClose}>
              <div className="space-y-4">
                  <p className="text-sm text-slate-700 bg-amber-100 p-3 rounded-md">
                      L'importo di <span className="font-bold">{formatCurrency(parseFloat(amount))}</span> non è sufficiente a coprire tutte le quote fisse ({formatCurrency(totalFixedFees)}).
                      Seleziona a cosa è destinato questo pagamento.
                  </p>
                  
                  <div className="space-y-2">
                      {feeOptions.filter(opt => opt.amount > 0).map(opt => (
                           <label key={opt.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                              <div>
                                  <p className="font-medium text-slate-800">{opt.label}</p>
                                  <p className="text-sm text-slate-500">{formatCurrency(opt.amount)}</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={allocations[opt.key]}
                                onChange={() => handleAllocationChange(opt.key)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                           </label>
                      ))}
                  </div>

                  <div className={`p-3 rounded-md text-center text-sm font-semibold transition-colors ${
                      allocatedTotal > parseFloat(amount) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                      Totale Allocato: {formatCurrency(allocatedTotal)} / {formatCurrency(parseFloat(amount))}
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-2">
                      <button type="button" onClick={() => setIsAllocationStep(false)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors font-semibold">
                          Indietro
                      </button>
                      <button type="button" onClick={handleAllocationSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm">
                          Conferma Allocazione
                      </button>
                  </div>
              </div>
          </Modal>
      )
  }

  return (
    <Modal title={`Modifica ${installmentLabels[installmentKey]}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <p className="text-sm text-slate-600 mb-4">Stai modificando la rata per: <span className="font-semibold">{member.name}</span></p>
            <div className="space-y-4">
                <div>
                    <label htmlFor={`${formId}-amount`} className="block text-sm font-medium text-slate-700">Importo (€)</label>
                    <input
                        id={`${formId}-amount`}
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        autoFocus
                        onFocus={(e) => e.target.select()}
                    />
                </div>
                <div>
                    <label htmlFor={`${formId}-date`} className="block text-sm font-medium text-slate-700">Data Pagamento</label>
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
                  <label htmlFor={`${formId}-payment`} className="block text-sm font-medium text-slate-700">Metodo Pagamento</label>
                  <select id={`${formId}-payment`} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                      {PAYMENT_METHODS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                  </select>
                </div>
            </div>
        </div>

        <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm">
                Salva
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default InstallmentModal;