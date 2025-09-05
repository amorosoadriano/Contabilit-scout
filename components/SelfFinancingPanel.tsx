
import React, { useMemo } from 'react';
import { SelfFinancingProject, Transaction, Group, UserPermissions, TransactionType } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './icons/Icons';

interface SelfFinancingPanelProps {
    projects: SelfFinancingProject[];
    transactions: Transaction[];
    groups: Group[];
    onOpenProjectModal: (data?: SelfFinancingProject) => void;
    onDeleteProject: (id: string) => void;
    onOpenTransactionModal: (context: { selfFinancingId: string; groupId: string; }) => void;
    permissions: UserPermissions;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

const SelfFinancingPanel: React.FC<SelfFinancingPanelProps> = ({ projects, transactions, groups, onOpenProjectModal, onDeleteProject, onOpenTransactionModal, permissions }) => {

    const groupMap = useMemo(() => new Map(groups.map(g => [g.id, g])), [groups]);

    const projectsWithSummary = useMemo(() => {
        return projects.map(project => {
            const projectTransactions = transactions.filter(t => t.selfFinancingId === project.id);
            const income = projectTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
            const expenses = projectTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
            const profit = income - expenses;
            return { ...project, income, expenses, profit, transactions: projectTransactions };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [projects, transactions]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Autofinanziamenti</h1>
                {permissions.canManageAutofinanziamenti && (
                    <button
                        onClick={() => onOpenProjectModal()}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nuovo Autofinanziamento
                    </button>
                )}
            </div>

            {projectsWithSummary.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.5l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.035-.259a3.375 3.375 0 002.456-2.456L18 13.5z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nessun Progetto</h3>
                    <p className="mt-1 text-sm text-gray-500">Inizia creando il tuo primo progetto di autofinanziamento.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {projectsWithSummary.map(project => {
                        const group = groupMap.get(project.groupId);
                        return (
                            <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{project.name}</h2>
                                            {group && (
                                                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${group.color} text-white`}>
                                                    {group.name}
                                                </span>
                                            )}
                                        </div>
                                        {permissions.canManageAutofinanziamenti && (
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => onOpenProjectModal(project)} className="text-blue-600 hover:text-blue-800 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                                <button onClick={() => onDeleteProject(project.id)} className="text-red-600 hover:text-red-800 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                        <div className="bg-green-100 p-3 rounded-md">
                                            <p className="text-sm font-medium text-green-800">Entrate Totali</p>
                                            <p className="text-2xl font-bold text-green-700">{formatCurrency(project.income)}</p>
                                        </div>
                                        <div className="bg-red-100 p-3 rounded-md">
                                            <p className="text-sm font-medium text-red-800">Spese Totali</p>
                                            <p className="text-2xl font-bold text-red-700">{formatCurrency(project.expenses)}</p>
                                        </div>
                                        <div className="bg-blue-100 p-3 rounded-md">
                                            <p className="text-sm font-medium text-blue-800">Guadagno Netto</p>
                                            <p className={`text-2xl font-bold ${project.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCurrency(project.profit)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                     <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-semibold text-slate-700">Transazioni del Progetto</h3>
                                        {permissions.canAddTransaction && (
                                            <button 
                                                onClick={() => onOpenTransactionModal({ selfFinancingId: project.id, groupId: project.groupId })}
                                                className="flex items-center bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                                            >
                                                <PlusIcon className="w-4 h-4 mr-1.5" />
                                                Aggiungi
                                            </button>
                                        )}
                                     </div>
                                     {project.transactions.length > 0 ? (
                                        <div className="overflow-x-auto max-h-80 pr-2">
                                            <table className="min-w-full divide-y divide-slate-200">
                                                <tbody className="bg-white divide-y divide-slate-200">
                                                    {project.transactions.map(t => (
                                                        <tr key={t.id}>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500 w-24">{new Date(t.date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-800">{t.description}</td>
                                                            <td className={`px-3 py-2 whitespace-nowrap text-sm font-semibold text-right w-32 ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                     ) : (
                                        <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-md">Nessuna transazione per questo progetto.</p>
                                     )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default SelfFinancingPanel;
