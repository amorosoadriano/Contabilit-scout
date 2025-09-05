import React, { useState, useEffect } from 'react';
import { QuoteSettings, Siblings } from '../types';
import { SIBLINGS_OPTIONS } from '../constants';

interface QuoteManagerProps {
  settings: QuoteSettings;
  onSave: (settings: QuoteSettings) => void;
}

const installmentLabels: Record<keyof QuoteSettings['installments'], string> = {
  first: '1° Rata',
  second: '2° Rata',
  third: '3° Rata',
  summerCamp: 'Campo Estivo'
};

const siblingLabels: Record<Siblings, string> = {
    '0': 'Nessun fratello (Quota Piena)',
    '1': '1 fratello',
    '2': '2 fratelli',
    '>2': 'Più di 2 fratelli'
};

const QuoteManager: React.FC<QuoteManagerProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<QuoteSettings>(settings);
  const formId = React.useId();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInstallmentChange = (key: keyof QuoteSettings['installments'], value: string) => {
    const newSettings = {
        ...localSettings,
        installments: {
            ...localSettings.installments,
            [key]: parseFloat(value) || 0
        }
    };
    setLocalSettings(newSettings);
  };
  
  const handleDiscountChange = (key: Siblings, value: string) => {
    const newSettings = {
        ...localSettings,
        siblingDiscounts: {
            ...localSettings.siblingDiscounts,
            [key]: parseFloat(value) || 0
        }
    };
    setLocalSettings(newSettings);
  };

  const handleBlur = () => {
      onSave(localSettings);
  }

  return (
    <div className="space-y-6">
      {/* Installment Amounts */}
      <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-lg font-medium text-slate-800">Importi Standard Rate</h3>
        <p className="text-sm text-slate-500">
          Definisci gli importi base per ogni rata. Questi valori verranno usati per calcolare automaticamente le quote suggerite.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(installmentLabels) as (keyof QuoteSettings['installments'])[]).map(key => (
            <div key={key}>
              <label htmlFor={`${formId}-${key}`} className="block text-sm font-medium text-slate-700">{installmentLabels[key]} (€)</label>
              <input
                id={`${formId}-${key}`}
                type="number"
                value={localSettings.installments[key]}
                onChange={(e) => handleInstallmentChange(key, e.target.value)}
                onBlur={handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sibling Discounts */}
      <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-lg font-medium text-slate-800">Sconti Fratelli</h3>
        <p className="text-sm text-slate-500">
          Imposta una percentuale di sconto per i ragazzi che hanno fratelli iscritti. Lo sconto si applica alla quota base.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SIBLINGS_OPTIONS.map(key => (
                 <div key={key}>
                    <label htmlFor={`${formId}-discount-${key}`} className="block text-sm font-medium text-slate-700">{siblingLabels[key]} (% Sconto)</label>
                    <input
                        id={`${formId}-discount-${key}`}
                        type="number"
                        value={localSettings.siblingDiscounts[key]}
                        onChange={(e) => handleDiscountChange(key, e.target.value)}
                        onBlur={handleBlur}
                        placeholder="0"
                        step="1"
                        min="0"
                        max="100"
                        disabled={key === '0'}
                        className={`mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${key === '0' ? 'bg-slate-200 cursor-not-allowed' : ''}`}
                    />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteManager;