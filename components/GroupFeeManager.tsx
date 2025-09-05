import React, { useState, useEffect } from 'react';
import { QuoteSettings } from '../types';

interface GroupFeeManagerProps {
  settings: QuoteSettings;
  onSave: (settings: QuoteSettings) => void;
}

const GroupFeeManager: React.FC<GroupFeeManagerProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<QuoteSettings>(settings);
  const formId = React.useId();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleFeeChange = (key: 'groupFee' | 'bpParkFee' | 'censimento' | 'preCamp', value: string) => {
    const newSettings = {
        ...localSettings,
        [key]: parseFloat(value) || 0
    };
    setLocalSettings(newSettings);
  };
  
  const handleBlur = () => {
      onSave(localSettings);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-lg font-medium text-slate-800">Imposta Quote Fisse</h3>
        <p className="text-sm text-slate-500">
          Definisci gli importi per le quote fisse del gruppo, come la quota associativa annuale.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
              <label htmlFor={`${formId}-groupFee`} className="block text-sm font-medium text-slate-700">Quota Gruppo (€)</label>
              <input
                id={`${formId}-groupFee`}
                type="number"
                value={localSettings.groupFee}
                onChange={(e) => handleFeeChange('groupFee', e.target.value)}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
          </div>
          <div>
              <label htmlFor={`${formId}-bpParkFee`} className="block text-sm font-medium text-slate-700">Quota BP Park (€)</label>
              <input
                id={`${formId}-bpParkFee`}
                type="number"
                value={localSettings.bpParkFee}
                onChange={(e) => handleFeeChange('bpParkFee', e.target.value)}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
          </div>
          <div>
              <label htmlFor={`${formId}-censimento`} className="block text-sm font-medium text-slate-700">Censimento (€)</label>
              <input
                id={`${formId}-censimento`}
                type="number"
                value={localSettings.censimento}
                onChange={(e) => handleFeeChange('censimento', e.target.value)}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
          </div>
          <div>
              <label htmlFor={`${formId}-preCamp`} className="block text-sm font-medium text-slate-700">Pre-Campo (€)</label>
              <input
                id={`${formId}-preCamp`}
                type="number"
                value={localSettings.preCamp}
                onChange={(e) => handleFeeChange('preCamp', e.target.value)}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupFeeManager;