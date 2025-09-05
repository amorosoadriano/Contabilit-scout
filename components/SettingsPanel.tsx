import React, { useState, useEffect } from 'react';
import { Category, Group, Unit, QuoteSettings, UserPermissions } from '../types';
import CategoryManager from './CategoryManager';
import { GROUP_COLORS } from '../constants';
import UnitManager from './UnitManager';
import QuoteManager from './QuoteManager';
import { PlusIcon, TrashIcon } from './icons/Icons';
import GroupFeeManager from './GroupFeeManager';
import BackupManager from './BackupManager';
import PermissionsManager from './PermissionsManager';

interface SettingsPanelProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  groups: Group[];
  onAddGroup: () => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateGroupName: (groupId: string, newName: string) => void;
  onUpdateGroupColor: (groupId: string, newColor: string) => void;
  units: Unit[];
  onAddUnit: (name: string) => void;
  onDeleteUnit: (id: string) => void;
  onUpdateGroupQuoteSettings: (groupId: string, settings: QuoteSettings) => void;
  confirmOnDelete: boolean;
  onSetConfirmOnDelete: (value: boolean) => void;
  onBackup: () => void;
  onRestore: (data: any) => void;
  groupFundManagerId: string | null;
  onSetGroupFundManagerId: (groupId: string) => void;
  userPermissions: UserPermissions;
  onSetUserPermissions: (permissions: UserPermissions) => void;
}

type ActiveTab = 'groups' | 'categories' | 'units' | 'quotes' | 'groupFees' | 'prefs' | 'permissions' | 'backup';

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  groups,
  onAddGroup,
  onDeleteGroup,
  onUpdateGroupName,
  onUpdateGroupColor,
  units,
  onAddUnit,
  onDeleteUnit,
  onUpdateGroupQuoteSettings,
  confirmOnDelete,
  onSetConfirmOnDelete,
  onBackup,
  onRestore,
  groupFundManagerId,
  onSetGroupFundManagerId,
  userPermissions,
  onSetUserPermissions,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('groups');
  const [groupNames, setGroupNames] = useState<Record<string, string>>(
    groups.reduce((acc, group) => ({ ...acc, [group.id]: group.name }), {})
  );
  const [selectedGroupIdForQuotes, setSelectedGroupIdForQuotes] = useState<string>(groups[0]?.id || '');

  useEffect(() => {
    // Update local state if groups prop changes from parent
    setGroupNames(groups.reduce((acc, group) => ({ ...acc, [group.id]: group.name }), {}));
  }, [groups]);

  useEffect(() => {
    // If the selected group for quote settings is deleted, select the first available one
    if (!groups.some(g => g.id === selectedGroupIdForQuotes)) {
      setSelectedGroupIdForQuotes(groups[0]?.id || '');
    }
  }, [groups, selectedGroupIdForQuotes]);


  const handleGroupNameChange = (id: string, name: string) => {
    setGroupNames(prev => ({ ...prev, [id]: name }));
  };
  
  const handleSaveGroupName = (id: string) => {
      if (groupNames[id] !== groups.find(g => g.id === id)?.name) {
        onUpdateGroupName(id, groupNames[id]);
      }
  };

  const TabButton: React.FC<{tabId: ActiveTab; children: React.ReactNode}> = ({ tabId, children }) => (
      <button
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabId ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
        role="tab"
        aria-selected={activeTab === tabId}
      >
          {children}
      </button>
  )

  const selectedGroupForQuotes = groups.find(g => g.id === selectedGroupIdForQuotes);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 flex-wrap" aria-label="Tabs" role="tablist">
          <TabButton tabId="groups">Gestisci Gruppi</TabButton>
          <TabButton tabId="categories">Gestisci Categorie</TabButton>
          <TabButton tabId="units">Gestisci Unità</TabButton>
          <TabButton tabId="quotes">Gestione Rate</TabButton>
          <TabButton tabId="groupFees">Gestione Quote Gruppo</TabButton>
          <TabButton tabId="permissions">Permessi Utente</TabButton>
          <TabButton tabId="prefs">Preferenze</TabButton>
          <TabButton tabId="backup">Backup & Ripristino</TabButton>
        </nav>
      </div>

      <div role="tabpanel">
        {activeTab === 'groups' && (
          <div className="space-y-4">
             <h3 className="text-lg font-medium text-slate-800 mb-4">Modifica Gruppi</h3>
             <div className="space-y-4">
              {groups.map(group => (
                  <div key={group.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                      {/* Name Input */}
                      <div className="flex items-center space-x-3">
                          <label htmlFor={`group-name-${group.id}`} className="w-16 text-sm font-medium text-slate-700">Nome:</label>
                          <input
                             id={`group-name-${group.id}`}
                             type="text"
                             value={groupNames[group.id] || ''}
                             onChange={(e) => handleGroupNameChange(group.id, e.target.value)}
                             onBlur={() => handleSaveGroupName(group.id)}
                             className="flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <button
                            onClick={() => onDeleteGroup(group.id)}
                            disabled={groups.length <= 1}
                            className="text-red-500 hover:text-red-700 transition-colors disabled:text-slate-300 disabled:cursor-not-allowed"
                            aria-label={`Elimina gruppo ${group.name}`}
                          >
                              <TrashIcon className="h-5 w-5" />
                          </button>
                      </div>
                      {/* Color Picker */}
                      <div className="flex items-start space-x-3">
                          <label className="w-16 text-sm font-medium text-slate-700 pt-1">Colore:</label>
                          <div className="flex flex-wrap gap-2">
                              {GROUP_COLORS.map(color => (
                                  <button
                                      key={color}
                                      type="button"
                                      onClick={() => onUpdateGroupColor(group.id, color)}
                                      className={`w-7 h-7 rounded-full cursor-pointer transition-transform transform hover:scale-110 flex items-center justify-center ${color} ${group.color === color ? 'ring-2 ring-offset-1 ring-blue-600' : 'ring-1 ring-inset ring-black/10'}`}
                                      aria-label={`Seleziona colore ${color.replace('bg-', '').replace('-500', '')}`}
                                  >
                                      {group.color === color && (
                                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                      )}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
              <div className="pt-2">
                  <button
                    onClick={onAddGroup}
                    className="flex items-center justify-center w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium shadow"
                  >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Aggiungi Gruppo
                  </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoryManager 
            categories={categories}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
          />
        )}

        {activeTab === 'units' && (
            <UnitManager 
                units={units}
                onAddUnit={onAddUnit}
                onDeleteUnit={onDeleteUnit}
            />
        )}

        {activeTab === 'quotes' && (
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-slate-800">Seleziona Gruppo</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-2">
                      Ogni gruppo ha le proprie impostazioni per rate e sconti. Seleziona un gruppo per configurare.
                    </p>
                    <select
                        value={selectedGroupIdForQuotes}
                        onChange={(e) => setSelectedGroupIdForQuotes(e.target.value)}
                        className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        aria-label="Seleziona un gruppo per modificare le impostazioni delle quote"
                        disabled={groups.length === 0}
                    >
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                
                {selectedGroupForQuotes?.quoteSettings ? (
                    <QuoteManager 
                        key={selectedGroupForQuotes.id} 
                        settings={selectedGroupForQuotes.quoteSettings} 
                        onSave={(newSettings) => onUpdateGroupQuoteSettings(selectedGroupForQuotes.id, newSettings)} 
                    />
                ) : (
                    <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded-md">Seleziona un gruppo per visualizzare le impostazioni.</p>
                )}
            </div>
        )}
        
        {activeTab === 'groupFees' && (
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-slate-800">Seleziona Gruppo</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-2">
                      Configura le quote fisse per il gruppo selezionato.
                    </p>
                    <select
                        value={selectedGroupIdForQuotes}
                        onChange={(e) => setSelectedGroupIdForQuotes(e.target.value)}
                        className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        aria-label="Seleziona un gruppo per modificare le quote fisse"
                        disabled={groups.length === 0}
                    >
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                
                {selectedGroupForQuotes?.quoteSettings ? (
                    <GroupFeeManager 
                        key={selectedGroupForQuotes.id} 
                        settings={selectedGroupForQuotes.quoteSettings} 
                        onSave={(newSettings) => onUpdateGroupQuoteSettings(selectedGroupForQuotes.id, newSettings)} 
                    />
                ) : (
                    <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded-md">Seleziona un gruppo per visualizzare le impostazioni.</p>
                )}
            </div>
        )}

        {activeTab === 'permissions' && (
            <PermissionsManager permissions={userPermissions} onSetPermissions={onSetUserPermissions} />
        )}
        
        {activeTab === 'prefs' && (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800">Preferenze Applicazione</h3>
                <div className="bg-slate-100 p-3 rounded-md space-y-4">
                  <div className="flex items-center justify-between">
                      <label htmlFor="confirm-delete" className="text-sm font-medium text-slate-800">
                          Chiedi conferma prima di eliminare
                      </label>
                      <button
                          id="confirm-delete"
                          onClick={() => onSetConfirmOnDelete(!confirmOnDelete)}
                          className={`${
                          confirmOnDelete ? 'bg-blue-600' : 'bg-slate-300'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                          role="switch"
                          aria-checked={confirmOnDelete}
                      >
                          <span className={`${
                          confirmOnDelete ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                      </button>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <label htmlFor="group-fund-manager" className="block text-sm font-medium text-slate-800 mb-1">
                        Gruppo Gestore Cassa di Gruppo
                    </label>
                    <p className="text-xs text-slate-500 mb-2">
                        Le spese di questo gruppo verranno sottratte dal fondo comune "Cassa di Gruppo".
                    </p>
                     <select
                        id="group-fund-manager"
                        value={groupFundManagerId || ''}
                        onChange={(e) => onSetGroupFundManagerId(e.target.value)}
                        className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        aria-label="Seleziona il gruppo gestore della cassa di gruppo"
                        disabled={groups.length === 0}
                    >
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>
            </div>
        )}

        {activeTab === 'backup' && (
            <BackupManager 
                onBackup={onBackup} 
                onRestore={onRestore} 
            />
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
