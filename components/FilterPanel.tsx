import React, { useState } from 'react';
import { TransactionType, Category, LedgerEntryType, Filters, Group } from '../types';
import { FilterIcon, ChevronDownIcon } from './icons/Icons';

interface FilterPanelProps {
  categories: Category[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  mode: 'transactions' | 'ledger';
  groups: Group[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ categories, filters, onFilterChange, mode, groups }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onFilterChange({
      text: '',
      type: 'ALL',
      category: 'ALL',
      startDate: '',
      endDate: '',
      ledgerType: 'ALL',
      groupId: 'ALL',
    });
  };

  const formId = React.useId();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left font-semibold text-lg text-slate-700"
        aria-expanded={isOpen}
        aria-controls="filter-content"
      >
        <div className="flex items-center">
            <FilterIcon className="h-6 w-6 mr-2" />
            <span>Filtri di Ricerca</span>
        </div>
        <ChevronDownIcon className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div id="filter-content" className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Text Search */}
            <div className="lg:col-span-1">
              <label htmlFor={`${formId}-text`} className="block text-sm font-medium text-slate-700">Descrizione</label>
              <input
                id={`${formId}-text`}
                type="text"
                name="text"
                value={filters.text}
                onChange={handleInputChange}
                placeholder="Cerca..."
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            {mode === 'ledger' && (
                <div>
                    <label htmlFor={`${formId}-groupId`} className="block text-sm font-medium text-slate-700">Gruppo</label>
                    <select id={`${formId}-groupId`} name="groupId" value={filters.groupId} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option value="ALL">Tutti i Gruppi</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
            )}

            {mode === 'ledger' ? (
                <div>
                    <label htmlFor={`${formId}-ledgerType`} className="block text-sm font-medium text-slate-700">Tipo Operazione</label>
                    <select id={`${formId}-ledgerType`} name="ledgerType" value={filters.ledgerType} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option value="ALL">Tutte le Operazioni</option>
                        <option value="TRANSACTION_INCOME">Entrate (Transazioni + Quote)</option>
                        <option value="TRANSACTION_EXPENSE">Uscite</option>
                        <option value={LedgerEntryType.FUND_TRANSFER}>Giroconti</option>
                        <option value={LedgerEntryType.INTERNAL_TRANSFER}>Trasferimenti Interni</option>
                    </select>
                </div>
            ) : (
                <div>
                    <label htmlFor={`${formId}-type`} className="block text-sm font-medium text-slate-700">Tipo Transazione</label>
                    <select id={`${formId}-type`} name="type" value={filters.type} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option value="ALL">Tutti</option>
                        <option value={TransactionType.INCOME}>Entrata</option>
                        <option value={TransactionType.EXPENSE}>Uscita</option>
                    </select>
                </div>
            )}

            <div>
              <label htmlFor={`${formId}-category`} className="block text-sm font-medium text-slate-700">Categoria</label>
              <select
                id={`${formId}-category`}
                name="category"
                value={filters.category}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={mode === 'ledger' && !['TRANSACTION_INCOME', 'TRANSACTION_EXPENSE', 'ALL'].includes(filters.ledgerType)}
              >
                <option value="ALL">Tutte le categorie</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:col-span-2">
                <div>
                  <label htmlFor={`${formId}-startDate`} className="block text-sm font-medium text-slate-700">Da</label>
                  <input
                    id={`${formId}-startDate`}
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                 <div>
                  <label htmlFor={`${formId}-endDate`} className="block text-sm font-medium text-slate-700">A</label>
                  <input
                    id={`${formId}-endDate`}
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleReset}
              className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600 transition-colors duration-200 font-semibold shadow-sm"
            >
              Resetta Filtri
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;