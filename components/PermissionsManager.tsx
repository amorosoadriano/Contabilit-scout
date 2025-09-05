
import React from 'react';
import { UserPermissions } from '../types';

interface PermissionsManagerProps {
  permissions: UserPermissions;
  onSetPermissions: (permissions: UserPermissions) => void;
}

const permissionLabels: Record<keyof UserPermissions, { label: string; description: string }> = {
  canAddTransaction: { label: "Aggiungere transazioni", description: "Consente di usare il pulsante 'Aggiungi' per creare nuove entrate/uscite." },
  canEditTransaction: { label: "Modificare transazioni", description: "Permette di modificare i dettagli delle transazioni esistenti." },
  canDeleteTransaction: { label: "Eliminare transazioni", description: "Permette di rimuovere permanentemente le transazioni." },
  canManageFundTransfers: { label: "Gestire Giroconti", description: "Consente di effettuare prelievi/versamenti e distribuire fondi tra i gruppi." },
  canManageInternalTransfers: { label: "Gestire Trasferimenti Interni", description: "Consente di cedere/prestare fondi e registrare restituzioni tra la Cassa di Gruppo e le branche." },
  canExport: { label: "Esportare dati", description: "Abilita il pulsante 'Esporta' per scaricare i report in CSV." },
  canViewQuote: { label: "Vedere pagina Quote", description: "Rende visibile la scheda 'Quote' per la gestione di membri e rate." },
  canEditMembers: { label: "Modificare Membri", description: "Consente di aggiungere, modificare ed eliminare ragazzi dalla pagina Quote." },
  canEditInstallments: { label: "Modificare Rate", description: "Permette di inserire/modificare i pagamenti delle singole rate." },
  canViewConti: { label: "Vedere pagina Conti", description: "Rende visibile la scheda 'Conti' con i riepiloghi finanziari." },
  canViewAnticipi: { label: "Vedere pagina Anticipi", description: "Rende visibile la scheda 'Anticipi' per la gestione dei rimborsi." },
  canViewAutofinanziamenti: { label: "Vedere pagina Autofinanziamenti", description: "Rende visibile la scheda 'Autofinanziamenti' per monitorare i progetti." },
  canManageAutofinanziamenti: { label: "Gestire Autofinanziamenti", description: "Consente di creare, modificare ed eliminare progetti di autofinanziamento." },
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; id: string }> = ({ checked, onChange, id }) => (
    <button
        id={id}
        onClick={() => onChange(!checked)}
        className={`${
        checked ? 'bg-blue-600' : 'bg-slate-300'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        role="switch"
        aria-checked={checked}
    >
        <span className={`${
        checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
    </button>
);


const PermissionsManager: React.FC<PermissionsManagerProps> = ({ permissions, onSetPermissions }) => {

  const handlePermissionChange = (key: keyof UserPermissions, value: boolean) => {
    onSetPermissions({ ...permissions, [key]: value });
  };
  
  const permissionOrder: (keyof UserPermissions)[] = [
    'canAddTransaction', 'canEditTransaction', 'canDeleteTransaction', 'canManageFundTransfers', 'canManageInternalTransfers',
    'canViewQuote', 'canEditMembers', 'canEditInstallments', 
    'canViewConti', 'canViewAnticipi', 
    'canViewAutofinanziamenti', 'canManageAutofinanziamenti',
    'canExport'
  ];

  return (
    <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">Permessi per il Ruolo "Utente"</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Configura cosa possono fare gli utenti standard. L'amministratore ha sempre accesso a tutte le funzionalità.
        </p>
        <div className="space-y-3 divide-y divide-slate-200 bg-slate-50 p-4 rounded-lg border border-slate-200">
            {permissionOrder.map(key => (
                <div key={key} className="flex items-center justify-between pt-3 first:pt-0">
                    <div>
                        <label htmlFor={`perm-${key}`} className="font-medium text-slate-800">
                            {permissionLabels[key].label}
                        </label>
                        <p className="text-sm text-slate-500">{permissionLabels[key].description}</p>
                    </div>
                    <ToggleSwitch 
                        id={`perm-${key}`}
                        checked={permissions[key]}
                        onChange={(value) => handlePermissionChange(key, value)}
                    />
                </div>
            ))}
        </div>
    </div>
  );
};

export default PermissionsManager;