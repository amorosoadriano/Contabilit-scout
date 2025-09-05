import React, { useState, useMemo, useCallback } from 'react';
// FIX: Added TransactionType to the import to resolve a type error in the migration function.
import { Transaction, Category, Group, ViewType, Member, Unit, MemberInstallments, Installment, QuoteSettings, PaymentMethod, Siblings, TransactionType } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { INITIAL_CATEGORIES, INITIAL_GROUPS, INITIAL_UNITS, INITIAL_QUOTE_SETTINGS, GROUP_COLORS, SIBLINGS_OPTIONS } from './constants';
import Header from './components/Header';
import Summary from './components/Summary';
import TransactionList from './components/TransactionList';
import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import PasswordModal from './components/PasswordModal';
import SettingsPanel from './components/SettingsPanel';
import { exportToCsv } from './services/exportService';
import FilterPanel, { Filters } from './components/FilterPanel';
import QuotePanel from './components/QuotePanel';
import MemberForm from './components/MemberForm';
import InstallmentModal from './components/InstallmentModal';
import AccountsPanel from './components/AccountsPanel';
import AdvancesPanel from './components/AdvancesPanel';

type ModalState = 
  | { type: 'transaction'; data?: Transaction }
  | { type: 'password' }
  | { type: 'settings' }
  | { type: 'member'; data: { member?: Member; groupId: string } }
  | { type: 'installment'; data: { member: Member; installmentKey: keyof MemberInstallments } };

// --- Data Migration Functions ---
const migrateTransactions = (data: any): Transaction[] => {
    if (!Array.isArray(data)) return [];
    return data
        .filter(t => t && typeof t === 'object')
        .map(t => ({
            id: t.id || `tx_${Date.now()}_${Math.random()}`,
            groupId: t.groupId || '',
            description: t.description || '',
            amount: typeof t.amount === 'number' ? t.amount : 0,
            date: t.date || new Date().toISOString().split('T')[0],
            // FIX: Use TransactionType enum members instead of string literals for type safety.
            type: t.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
            category: t.category || '',
            paymentMethod: t.paymentMethod || PaymentMethod.CASH,
            isCampExpense: !!t.isCampExpense,
            advancedBy: t.advancedBy || null,
            repaid: !!t.repaid,
            repaidDate: t.repaidDate || null,
            repaymentMethod: t.repaymentMethod || null,
        }));
};

const migrateGroups = (data: any): Group[] => {
    if (!Array.isArray(data)) return INITIAL_GROUPS;

    const safeQuoteSettings = (qs: any): QuoteSettings => {
        const initial = JSON.parse(JSON.stringify(INITIAL_QUOTE_SETTINGS));
        if (!qs || typeof qs !== 'object') {
            return initial;
        }
        return {
            installments: (qs.installments && typeof qs.installments === 'object') ? { ...initial.installments, ...qs.installments } : initial.installments,
            siblingDiscounts: (qs.siblingDiscounts && typeof qs.siblingDiscounts === 'object') ? { ...initial.siblingDiscounts, ...qs.siblingDiscounts } : initial.siblingDiscounts,
            groupFee: typeof qs.groupFee === 'number' ? qs.groupFee : initial.groupFee,
            bpParkFee: typeof qs.bpParkFee === 'number' ? qs.bpParkFee : initial.bpParkFee,
            censimento: typeof qs.censimento === 'number' ? qs.censimento : initial.censimento,
            preCamp: typeof qs.preCamp === 'number' ? qs.preCamp : initial.preCamp,
        };
    };

    return data
        .filter(g => g && typeof g === 'object')
        .map((g, index) => ({
            id: g.id || `group_${Date.now()}_${index}`,
            name: g.name || `Gruppo ${index + 1}`,
            color: g.color || GROUP_COLORS[index % GROUP_COLORS.length],
            quoteSettings: safeQuoteSettings(g.quoteSettings),
        }));
};

const migrateMembers = (data: any): Member[] => {
    if (!Array.isArray(data)) return [];

    const safeInstallments = (insts: any): MemberInstallments => {
        const defaultInstallment: Installment = { amount: 0, date: null, paymentMethod: null };
        if (!insts || typeof insts !== 'object') {
            return {
                first: { ...defaultInstallment },
                second: { ...defaultInstallment },
                third: { ...defaultInstallment },
                summerCamp: { ...defaultInstallment },
            };
        }
        return {
            first: { ...defaultInstallment, ...(insts.first && typeof insts.first === 'object' ? insts.first : {}) },
            second: { ...defaultInstallment, ...(insts.second && typeof insts.second === 'object' ? insts.second : {}) },
            third: { ...defaultInstallment, ...(insts.third && typeof insts.third === 'object' ? insts.third : {}) },
            summerCamp: { ...defaultInstallment, ...(insts.summerCamp && typeof insts.summerCamp === 'object' ? insts.summerCamp : {}) },
        };
    };

    return data
        .filter(m => m && typeof m === 'object')
        .map(m => ({
            id: m.id || `member_${Date.now()}_${Math.random()}`,
            groupId: m.groupId || '',
            name: m.name || '',
            unit: m.unit || '',
            siblings: SIBLINGS_OPTIONS.includes(m.siblings) ? m.siblings : '0',
            installments: safeInstallments(m.installments),
        }));
};

const migrateCategories = (data: any): Category[] => {
    if (!Array.isArray(data)) return INITIAL_CATEGORIES;
    return data
        .filter(c => c && typeof c === 'object' && c.name)
        .map(c => ({
            id: c.id || `cat_${Date.now()}_${Math.random()}`,
            name: c.name,
        }));
};

const migrateUnits = (data: any): Unit[] => {
    if (!Array.isArray(data)) return INITIAL_UNITS;
    return data
        .filter(u => u && typeof u === 'object' && u.name)
        .map(u => ({
            id: u.id || `unit_${Date.now()}_${Math.random()}`,
            name: u.name,
        }));
};


const App: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', [], migrateTransactions);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', INITIAL_CATEGORIES, migrateCategories);
  const [groups, setGroups] = useLocalStorage<Group[]>('groups', INITIAL_GROUPS, migrateGroups);
  const [members, setMembers] = useLocalStorage<Member[]>('members', [], migrateMembers);
  const [units, setUnits] = useLocalStorage<Unit[]>('units', INITIAL_UNITS, migrateUnits);
  
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('contabilita');
  
  const [currentModal, setCurrentModal] = useState<ModalState | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [confirmOnDelete, setConfirmOnDelete] = useLocalStorage<boolean>('confirmOnDelete', true);
  
  const [filters, setFilters] = useState<Filters>({
    text: '',
    type: 'ALL',
    category: 'ALL',
    startDate: '',
    endDate: '',
  });

  const handleOpenModal = useCallback((modal: ModalState) => {
    setCurrentModal(modal);
  }, []);

  const handleSettingsClick = useCallback(() => {
    if (isAdminAuthenticated) {
      handleOpenModal({ type: 'settings' });
    } else {
      handleOpenModal({ type: 'password' });
    }
  }, [isAdminAuthenticated, handleOpenModal]);

  const handleLoginSuccess = useCallback(() => {
    setIsAdminAuthenticated(true);
    setCurrentModal({ type: 'settings' });
  }, []);

  const handleCloseModal = useCallback(() => {
    setCurrentModal(null);
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().toISOString() + Math.random(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>, id?: string) => {
    if (id) {
        const transactionToUpdate = transactions.find(t => t.id === id);
        if (transactionToUpdate) {
            updateTransaction({ ...transactionData, id });
        }
    } else {
        addTransaction(transactionData);
    }
    handleCloseModal();
  };

  const updateTransactionRepayment = (transactionId: string, repaid: boolean, repaidDate: string | null, repaymentMethod: PaymentMethod | null) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, repaid, repaidDate, repaymentMethod } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    const performDelete = () => setTransactions(transactions.filter(t => t.id !== id));
    if (confirmOnDelete) {
        if (window.confirm('Sei sicuro di voler eliminare questa transazione?')) {
            performDelete();
        }
    } else {
        performDelete();
    }
  };

  const addCategory = (name: string) => {
    if (name && !categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        const newCategory: Category = {
            id: new Date().toISOString() + Math.random(),
            name,
        }
        setCategories(prev => [...prev, newCategory]);
    }
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };
  
  const addUnit = (name: string) => {
    if (name && !units.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        const newUnit: Unit = { id: new Date().toISOString() + Math.random(), name };
        setUnits(prev => [...prev, newUnit]);
    }
  };

  const deleteUnit = (id: string) => setUnits(units.filter(u => u.id !== id));

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = { ...memberData, id: new Date().toISOString() + Math.random() };
    setMembers(prev => [...prev, newMember]);
  };
  
  const updateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const deleteMember = (id: string) => {
    const performDelete = () => setMembers(members.filter(m => m.id !== id));
    if (confirmOnDelete) {
        if (window.confirm('Sei sicuro di voler eliminare questo membro?')) {
            performDelete();
        }
    } else {
       performDelete();
    }
  };

  const handleSaveMember = (memberData: Omit<Member, 'id'> | Member) => {
    if ('id' in memberData) {
      updateMember(memberData);
    } else {
      addMember(memberData);
    }
    handleCloseModal();
  };

  const updateMemberInstallment = (memberId: string, installmentKey: keyof MemberInstallments, data: Installment) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId 
        ? { ...m, installments: { ...m.installments, [installmentKey]: data } } 
        : m
    ));
  };

  const handleExport = () => {
    exportToCsv(filteredTransactions, 'report_contabilita.csv', groups);
  };

  const addGroup = () => {
    const newGroup: Group = {
      id: new Date().toISOString() + Math.random(),
      name: 'Nuovo Gruppo',
      color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
      quoteSettings: JSON.parse(JSON.stringify(INITIAL_QUOTE_SETTINGS))
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const deleteGroup = (groupId: string) => {
    const isGroupInUse = transactions.some(t => t.groupId === groupId) || members.some(m => m.groupId === groupId);
    if (isGroupInUse) {
      alert('Impossibile eliminare il gruppo. Contiene transazioni o membri associati.');
      return;
    }

    if (groups.length <= 1) {
      alert('Non è possibile eliminare l\'ultimo gruppo.');
      return;
    }

    setGroups(prev => prev.filter(g => g.id !== groupId));
    if (activeGroupId === groupId) {
      setActiveGroupId(null);
    }
  };
  
  const updateGroupName = (groupId: string, newName: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
  };

  const updateGroupColor = (groupId: string, newColor: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId ? { ...group, color: newColor } : group
      )
    );
  };

  const updateGroupQuoteSettings = (groupId: string, newSettings: QuoteSettings) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId ? { ...group, quoteSettings: newSettings } : group
      )
    );
  };

  const handleBackup = () => {
    try {
        const backupData = {
            transactions,
            categories,
            groups,
            members,
            units,
            confirmOnDelete,
        };
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `backup_contabilita_comune_${date}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error creating backup:", error);
        alert("Si è verificato un errore durante la creazione del backup.");
    }
  };

  const isValidBackupData = (data: any): boolean => {
    if (typeof data !== 'object' || data === null) {
        alert('File di backup non valido. Il contenuto non è un oggetto JSON valido.');
        return false;
    }

    const arrayKeys = ['transactions', 'categories', 'groups', 'members', 'units'];
    for (const key of arrayKeys) {
        if (!data.hasOwnProperty(key) || !Array.isArray(data[key])) {
            alert(`File di backup non valido: la sezione '${key}' è mancante o non è nel formato corretto (dovrebbe essere una lista).`);
            return false;
        }
    }

    if (!data.hasOwnProperty('confirmOnDelete') || typeof data.confirmOnDelete !== 'boolean') {
        alert('File di backup non valido: l\'impostazione "confirmOnDelete" è mancante o non è nel formato corretto (dovrebbe essere vero/falso).');
        return false;
    }

    return true;
  }

  const handleValidateBackup = (data: any): { isValid: boolean, summary: string } => {
    if (!isValidBackupData(data)) {
        return { isValid: false, summary: '' };
    }
    const summary = `File valido. Contiene:
- ${data.transactions?.length || 0} Transazioni
- ${data.groups?.length || 0} Gruppi
- ${data.members?.length || 0} Membri
- ${data.categories?.length || 0} Categorie
- ${data.units?.length || 0} Unità`;
    return { isValid: true, summary };
  };

  const handleRestore = (data: any) => {
    try {
        const migratedData = {
            transactions: migrateTransactions(data.transactions || []),
            categories: migrateCategories(data.categories || []),
            groups: migrateGroups(data.groups || []),
            members: migrateMembers(data.members || []),
            units: migrateUnits(data.units || []),
            confirmOnDelete: typeof data.confirmOnDelete === 'boolean' ? data.confirmOnDelete : true,
        };

        window.localStorage.setItem('transactions', JSON.stringify(migratedData.transactions));
        window.localStorage.setItem('categories', JSON.stringify(migratedData.categories));
        window.localStorage.setItem('groups', JSON.stringify(migratedData.groups));
        window.localStorage.setItem('members', JSON.stringify(migratedData.members));
        window.localStorage.setItem('units', JSON.stringify(migratedData.units));
        window.localStorage.setItem('confirmOnDelete', JSON.stringify(migratedData.confirmOnDelete));

        alert('Dati ripristinati con successo! L\'applicazione verrà ricaricata per applicare le modifiche.');
        setTimeout(() => window.location.reload(), 500);
    } catch (error) {
        console.error("Error restoring data:", error);
        alert("Si è verificato un errore durante il ripristino dei dati.");
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (activeGroupId) filtered = filtered.filter(t => t.groupId === activeGroupId);
    if (filters.text) filtered = filtered.filter(t => t.description.toLowerCase().includes(filters.text.toLowerCase()));
    if (filters.type !== 'ALL') filtered = filtered.filter(t => t.type === filters.type);
    if (filters.category !== 'ALL') filtered = filtered.filter(t => t.category === filters.category);
    if (filters.startDate) filtered = filtered.filter(t => t.date >= filters.startDate);
    if (filters.endDate) filtered = filtered.filter(t => t.date <= filters.endDate);
    return filtered;
  }, [transactions, activeGroupId, filters]);
  
  const hasActiveFilters = filters.text !== '' || filters.type !== 'ALL' || filters.category !== 'ALL' || filters.startDate !== '' || filters.endDate !== '';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <Header 
        onOpenTransactionModal={() => handleOpenModal({ type: 'transaction' })} 
        onOpenSettings={handleSettingsClick} 
        onExport={handleExport}
        activeView={activeView}
        onSetView={setActiveView}
      />
      
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {activeView === 'contabilita' && (
          <>
            <Summary 
              transactions={transactions} 
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={setActiveGroupId}
            />
            <div className="mt-8">
              <FilterPanel
                categories={categories}
                filters={filters}
                onFilterChange={setFilters}
              />
              <TransactionList 
                transactions={filteredTransactions} 
                groups={groups}
                onDelete={deleteTransaction}
                onEdit={(transaction) => handleOpenModal({ type: 'transaction', data: transaction })}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </>
        )}
        {activeView === 'quote' && (
            <QuotePanel
                groups={groups}
                members={members}
                units={units}
                onOpenMemberModal={(data) => handleOpenModal({type: 'member', data})}
                onOpenInstallmentModal={(data) => handleOpenModal({type: 'installment', data})}
                onDeleteMember={deleteMember}
                onUpdateMember={updateMember}
            />
        )}
        {activeView === 'conti' && (
            <AccountsPanel 
              transactions={transactions}
              groups={groups}
              members={members}
            />
        )}
        {activeView === 'anticipi' && (
            <AdvancesPanel 
              transactions={transactions}
              onUpdateRepayment={updateTransactionRepayment}
            />
        )}
      </main>

      {currentModal?.type === 'transaction' && (
        <Modal title={currentModal.data ? "Modifica Transazione" : "Aggiungi Transazione"} onClose={handleCloseModal}>
          <TransactionForm 
            onSave={handleSaveTransaction} 
            categories={categories}
            groups={groups}
            members={members}
            initialData={currentModal.data}
          />
        </Modal>
      )}

      {currentModal?.type === 'password' && (
        <PasswordModal 
          onClose={handleCloseModal}
          onSuccess={handleLoginSuccess}
        />
      )}

      {currentModal?.type === 'settings' && (
        <Modal title="Impostazioni Amministratore" onClose={handleCloseModal} size="3xl">
            <SettingsPanel
                categories={categories}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
                groups={groups}
                onAddGroup={addGroup}
                onDeleteGroup={deleteGroup}
                onUpdateGroupName={updateGroupName}
                onUpdateGroupColor={updateGroupColor}
                units={units}
                onAddUnit={addUnit}
                onDeleteUnit={deleteUnit}
                onUpdateGroupQuoteSettings={updateGroupQuoteSettings}
                confirmOnDelete={confirmOnDelete}
                onSetConfirmOnDelete={setConfirmOnDelete}
                onBackup={handleBackup}
                onValidateBackup={handleValidateBackup}
                onRestore={handleRestore}
            />
        </Modal>
      )}

      {currentModal?.type === 'member' && (
        <Modal title={currentModal.data.member ? "Modifica Membro" : "Aggiungi Membro"} onClose={handleCloseModal}>
          <MemberForm 
            onSave={handleSaveMember}
            initialData={currentModal.data.member}
            groupId={currentModal.data.groupId}
            units={units}
            onClose={handleCloseModal}
          />
        </Modal>
      )}

      {currentModal?.type === 'installment' && (() => {
          const memberGroup = groups.find(g => g.id === currentModal.data.member.groupId);
          return (
              <InstallmentModal
                  member={currentModal.data.member}
                  installmentKey={currentModal.data.installmentKey}
                  onSave={updateMemberInstallment}
                  onClose={handleCloseModal}
                  quoteSettings={memberGroup?.quoteSettings || INITIAL_QUOTE_SETTINGS}
              />
          )
      })()}
    </div>
  );
};

export default App;