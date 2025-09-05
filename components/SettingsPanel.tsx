import React, { useState } from 'react';
import { Category, Group } from '../types';
import CategoryManager from './CategoryManager';

interface SettingsPanelProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  groups: Group[];
  onUpdateGroupName: (groupId: string, newName: string) => void;
  confirmOnDelete: boolean;
  onSetConfirmOnDelete: (value: boolean) => void;
}

type ActiveTab = 'groups' | 'categories' | 'prefs';

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  groups,
  onUpdateGroupName,
  confirmOnDelete,
  onSetConfirmOnDelete
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('groups');
  const [groupNames, setGroupNames] = useState<Record<string, string>>(
    groups.reduce((acc, group) => ({ ...acc, [group.id]: group.name }), {})
  );

  const handleGroupNameChange = (id: string, name: string) => {
    setGroupNames(prev => ({ ...prev, [id]: name }));
  };
  
  const handleSaveGroupName = (id: string) => {
      onUpdateGroupName(id, groupNames[id]);
      // Optional: Add a visual confirmation
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

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2" aria-label="Tabs" role="tablist">
          <TabButton tabId="groups">Gestisci Gruppi</TabButton>
          <TabButton tabId="categories">Gestisci Categorie</TabButton>
          <TabButton tabId="prefs">Preferenze</TabButton>
        </nav>
      </div>

      <div role="tabpanel">
        {activeTab === 'groups' && (
          <div className="space-y-4">
             <h3 className="text-lg font-medium text-slate-800">Modifica Nomi Gruppi</h3>
             {groups.map(group => (
                 <div key={group.id} className="flex items-center space-x-3">
                     <label htmlFor={`group-name-${group.id}`} className="w-40 text-sm font-medium text-slate-700 truncate">{group.name}</label>
                     <input
                        id={`group-name-${group.id}`}
                        type="text"
                        value={groupNames[group.id] || ''}
                        onChange={(e) => handleGroupNameChange(group.id, e.target.value)}
                        onBlur={() => handleSaveGroupName(group.id)}
                        className="flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     />
                 </div>
             ))}
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoryManager 
            categories={categories}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
          />
        )}
        
        {activeTab === 'prefs' && (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800">Preferenze Applicazione</h3>
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-md">
                    <label htmlFor="confirm-delete" className="text-sm font-medium text-slate-800">
                        Chiedi conferma prima di eliminare una transazione
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
            </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
