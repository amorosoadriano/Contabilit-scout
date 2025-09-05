import React, { useState } from 'react';
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

const InstallmentModal: React.FC<InstallmentModalProps> = ({ member, installmentKey, onSave, onClose, quoteSettings }) => {
  
  const calculateSuggestedAmount = () => {
    const currentInstallment = member.installments[installmentKey];
    if (currentInstallment && currentInstallment.amount > 0) {
      return String(currentInstallment.amount);
    }

    const baseAmount = quoteSettings.installments[installmentKey] || 0;
    if (baseAmount === 0) {
      return '';
    }

    const discountPercent = quoteSettings.siblingDiscounts[member.siblings] || 0;
    const finalAmount = baseAmount * (1 - discountPercent / 100);
    
    // Round to 2 decimal places and format as a string
    return (Math.round(finalAmount * 100) / 100).toFixed(2);
  };
  
  const [amount, setAmount] = useState(calculateSuggestedAmount());
  const [date, setDate] = useState(member.installments[installmentKey]?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(member.installments[installmentKey]?.paymentMethod || PaymentMethod.TRANSFER);
  const formId = React.useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = parseFloat(amount.replace(',', '.')) || 0;
    const newDate = newAmount > 0 ? date : null;
    const newPaymentMethod = newAmount > 0 ? paymentMethod : null;
    onSave(member.id, installmentKey, { amount: newAmount, date: newDate, paymentMethod: newPaymentMethod });
    onClose();
  };

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