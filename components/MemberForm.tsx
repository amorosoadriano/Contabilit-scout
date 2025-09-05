import React, { useState } from 'react';
import { Member, Unit, Siblings } from '../types';
import { SIBLINGS_OPTIONS } from '../constants';

interface MemberFormProps {
  onSave: (memberData: Omit<Member, 'id'> | Member) => void;
  initialData?: Member;
  groupId: string;
  units: Unit[];
  onClose: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ onSave, initialData, groupId, units, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [unit, setUnit] = useState(initialData?.unit || (units[0]?.name || ''));
  const [siblings, setSiblings] = useState<Siblings>(initialData?.siblings || '0');
  const formId = React.useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Il nome è obbligatorio.');
      return;
    }

    const memberData = {
      name: name.trim(),
      unit,
      siblings,
      groupId,
      installments: initialData?.installments || { 
        first: { amount: 0, date: null, paymentMethod: null }, 
        second: { amount: 0, date: null, paymentMethod: null }, 
        third: { amount: 0, date: null, paymentMethod: null }, 
        summerCamp: { amount: 0, date: null, paymentMethod: null } 
      },
    };
    
    if (initialData) {
      onSave({ ...memberData, id: initialData.id });
    } else {
      onSave(memberData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor={`${formId}-name`} className="block text-sm font-medium text-slate-700">Nome e Cognome</label>
        <input
          id={`${formId}-name`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${formId}-unit`} className="block text-sm font-medium text-slate-700">Sestiglia/Squadriglia</label>
          <select id={`${formId}-unit`} value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="">Nessuna</option>
            {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${formId}-siblings`} className="block text-sm font-medium text-slate-700">Fratelli</label>
          <select id={`${formId}-siblings`} value={siblings} onChange={(e) => setSiblings(e.target.value as Siblings)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            {SIBLINGS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="pt-4 flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors duration-200 font-semibold">
          Annulla
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm">
          {initialData ? 'Salva Modifiche' : 'Aggiungi Membro'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;