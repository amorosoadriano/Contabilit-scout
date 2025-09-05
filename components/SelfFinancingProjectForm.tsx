
import React, { useState } from 'react';
import { Group, SelfFinancingProject } from '../types';

interface SelfFinancingProjectFormProps {
    groups: Group[];
    onSave: (projectData: Omit<SelfFinancingProject, 'id'> | SelfFinancingProject) => void;
    initialData?: SelfFinancingProject;
    onClose: () => void;
}

const SelfFinancingProjectForm: React.FC<SelfFinancingProjectFormProps> = ({ groups, onSave, initialData, onClose }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [groupId, setGroupId] = useState(initialData?.groupId || (groups[0]?.id || ''));
    const formId = React.useId();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !groupId) {
            alert('Nome del progetto e gruppo sono obbligatori.');
            return;
        }

        const projectData = {
            name: name.trim(),
            groupId,
        };

        if (initialData) {
            onSave({ ...projectData, id: initialData.id });
        } else {
            onSave(projectData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor={`${formId}-name`} className="block text-sm font-medium text-slate-700">
                    Nome del Progetto
                </label>
                <input
                    id={`${formId}-name`}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    placeholder="Es. Vendita Torte, Lotteria di Natale"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor={`${formId}-group`} className="block text-sm font-medium text-slate-700">
                    Gruppo Responsabile
                </label>
                <select
                    id={`${formId}-group`}
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors duration-200 font-semibold">
                    Annulla
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm">
                    {initialData ? 'Salva Modifiche' : 'Crea Progetto'}
                </button>
            </div>
        </form>
    );
};

export default SelfFinancingProjectForm;
