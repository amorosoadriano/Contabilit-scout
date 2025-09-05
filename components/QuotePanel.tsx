import React, { useState, useMemo } from 'react';
import { Group, Member, Unit, MemberInstallments, Siblings } from '../types';
import { PlusIcon, TrashIcon, PencilIcon } from './icons/Icons';
import { SIBLINGS_OPTIONS } from '../constants';

interface QuotePanelProps {
    groups: Group[];
    members: Member[];
    units: Unit[];
    onOpenMemberModal: (data: { member?: Member; groupId: string }) => void;
    onOpenInstallmentModal: (data: { member: Member; installmentKey: keyof MemberInstallments }) => void;
    onDeleteMember: (id: string) => void;
    onUpdateMember: (member: Member) => void;
}

const installmentKeys: (keyof MemberInstallments)[] = ['first', 'second', 'third', 'summerCamp'];
const installmentLabels: Record<keyof MemberInstallments, string> = {
    first: '1° Rata',
    second: '2° Rata',
    third: '3° Rata',
    summerCamp: 'Campo Estivo'
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

const QuotePanel: React.FC<QuotePanelProps> = ({ groups, members, units, onOpenMemberModal, onOpenInstallmentModal, onDeleteMember, onUpdateMember }) => {
    const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id || '');
    const filteredMembers = members.filter(m => m.groupId === activeGroupId);
    
    const installmentTotals = useMemo(() => {
        const totals: Record<keyof MemberInstallments, number> = {
            first: 0,
            second: 0,
            third: 0,
            summerCamp: 0,
        };
        for (const member of filteredMembers) {
            totals.first += member.installments.first.amount;
            totals.second += member.installments.second.amount;
            totals.third += member.installments.third.amount;
            totals.summerCamp += member.installments.summerCamp.amount;
        }
        return totals;
    }, [filteredMembers]);

    const handleFieldChange = (member: Member, field: 'unit' | 'siblings', value: string) => {
        onUpdateMember({ ...member, [field]: value });
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-6">
            {/* Group Tabs */}
            <div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                        {groups.map((group) => (
                            <button
                                key={group.id}
                                onClick={() => setActiveGroupId(group.id)}
                                className={`${
                                group.id === activeGroupId
                                    ? `border-blue-500 text-blue-600`
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {group.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Summary Section */}
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Riepilogo Quote Pagate del Gruppo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {installmentKeys.map(key => (
                        <div key={key} className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-slate-500">{installmentLabels[key]}</h4>
                            <p className="text-2xl font-bold text-slate-800">
                                {formatCurrency(installmentTotals[key])}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end -mt-2">
                <button
                    onClick={() => onOpenMemberModal({ groupId: activeGroupId })}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Aggiungi Ragazzo
                </button>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sestiglia/Squadriglia</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fratelli</th>
                            {installmentKeys.map(key => <th key={key} scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{installmentLabels[key]}</th>)}
                            <th scope="col" className="relative px-4 py-3"><span className="sr-only">Azioni</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredMembers.length > 0 ? filteredMembers.map(member => (
                            <tr key={member.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{member.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <select value={member.unit} onChange={(e) => handleFieldChange(member, 'unit', e.target.value)} className="mt-1 block w-full pl-3 pr-8 py-1 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                        <option value="">Nessuna</option>
                                        {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                    </select>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <select value={member.siblings} onChange={(e) => handleFieldChange(member, 'siblings', e.target.value)} className="mt-1 block w-full pl-3 pr-8 py-1 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                        {SIBLINGS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                {installmentKeys.map(key => {
                                    const installment = member.installments[key];
                                    return (
                                        <td key={key} className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-right align-top">
                                            <button onClick={() => onOpenInstallmentModal({ member, installmentKey: key })} className="w-full text-right hover:bg-slate-200 p-1 rounded transition-colors text-sm">
                                                {installment.amount > 0 ? (
                                                    <div>
                                                        <span className="font-semibold text-slate-800">{formatCurrency(installment.amount)}</span>
                                                        {installment.date && (
                                                            <span className="block text-xs text-slate-500">
                                                                {new Date(installment.date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                        {installment.paymentMethod && (
                                                            <span className={`block text-xs font-semibold ${installment.paymentMethod === 'Contanti' ? 'text-green-600' : 'text-blue-600'}`}>
                                                                {installment.paymentMethod}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">{formatCurrency(0)}</span>
                                                )}
                                            </button>
                                        </td>
                                    )
                                })}
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium align-top">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button onClick={() => onOpenMemberModal({ member, groupId: activeGroupId })} className="text-blue-600 hover:text-blue-900 transition-colors" aria-label={`Modifica membro ${member.name}`}>
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => onDeleteMember(member.id)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`Elimina membro ${member.name}`}>
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="text-center py-10 px-4 text-sm text-slate-500">
                                    Nessun membro in questo gruppo. Inizia aggiungendone uno.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotePanel;