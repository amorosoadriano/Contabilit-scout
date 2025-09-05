import React, { useState } from 'react';
import { Unit } from '../types';
import { TrashIcon } from './icons/Icons';

interface UnitManagerProps {
  units: Unit[];
  onAddUnit: (name: string) => void;
  onDeleteUnit: (id: string) => void;
}

const UnitManager: React.FC<UnitManagerProps> = ({ units, onAddUnit, onDeleteUnit }) => {
  const [newUnit, setNewUnit] = useState('');

  const handleAdd = () => {
    if (newUnit.trim()) {
      onAddUnit(newUnit.trim());
      setNewUnit('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Aggiungi Unità</h3>
        <p className="text-sm text-slate-500 mb-2">Aggiungi Sestiglie o Squadriglie che saranno selezionabili nelle schede dei ragazzi.</p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nome nuova unità"
            className="flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm"
          >
            Aggiungi
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Unità Esistenti</h3>
        {units.length > 0 ? (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {units.map(unit => (
              <li key={unit.id} className="flex justify-between items-center bg-slate-100 p-2 rounded-md">
                <span className="text-sm text-slate-700">{unit.name}</span>
                <button
                  onClick={() => onDeleteUnit(unit.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label={`Elimina unità ${unit.name}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded-md">Nessuna unità definita.</p>
        )}
      </div>
    </div>
  );
};

export default UnitManager;
