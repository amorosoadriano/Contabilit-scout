import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Category, Group, ViewType, Member, Unit, MemberInstallments, Installment, QuoteSettings, PaymentMethod, TransactionType, UserRole, UserPermissions, FundTransfer, InternalTransfer, SelfFinancingProject, LedgerEntry, LedgerEntryType, FundTransferType, Filters } from './types';
import { INITIAL_CATEGORIES, INITIAL_GROUPS, INITIAL_UNITS, INITIAL_QUOTE_SETTINGS, GROUP_COLORS, SIBLINGS_OPTIONS, INITIAL_USER_PERMISSIONS } from './constants';
import Header from './components/Header';
import Summary from './components/Summary';
import TransactionList from './components/TransactionList';
import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import PasswordModal from './components/PasswordModal';
import SettingsPanel from './components/SettingsPanel';
import { exportToCsv } from './services/exportService';
import FilterPanel from './components/FilterPanel';
import QuotePanel from './components/QuotePanel';
import MemberForm from './components/MemberForm';
import InstallmentModal from './components/InstallmentModal';
import AccountsPanel from './components/AccountsPanel';
import AdvancesPanel from './components/AdvancesPanel';
import LoginScreen from './components/LoginScreen';
import FundTransferForm from './components/FundTransferForm';
import InternalTransferForm from './components/InternalTransferForm';
import SelfFinancingPanel from './components/SelfFinancingPanel';
import SelfFinancingProjectForm from './components/SelfFinancingProjectForm';
import CombinedLedger from './components/CombinedLedger';

type ModalState = 
  | { type: 'transaction'; data?: Transaction, context?: { selfFinancingId: string; groupId: string; } }
  | { type: 'password'; fromScreen?: 'login' | 'elevation' }
  | { type: 'settings' }
  | { type: 'member'; data: { member?: Member; groupId: string } }
  | { type: 'installment'; data: { member: Member; installmentKey: keyof MemberInstallments } }
  | { type: 'fundTransfer' }
  | { type: 'internalTransfer' }
  | { type: 'selfFinancingProject'; data?: SelfFinancingProject };

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [members, setMembers] = useState<Member[]>([]);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [fundTransfers, setFundTransfers] = useState<FundTransfer[]>([]);
  const [internalTransfers, setInternalTransfers] = useState<InternalTransfer[]>([]);
  const [selfFinancingProjects, setSelfFinancingProjects] = useState<SelfFinancingProject[]>([]);
  
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('contabilita');
  
  const [currentModal, setCurrentModal] = useState<ModalState | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('NONE');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [confirmOnDelete, setConfirmOnDelete] = useState<boolean>(true);
  const [groupFundManagerId, setGroupFundManagerId] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>(INITIAL_USER_PERMISSIONS);

  const [filters, setFilters] = useState<Filters>({
    text: '',
    type: 'ALL',
    category: 'ALL',
    startDate: '',
    endDate: '',
    ledgerType: 'ALL',
    groupId: 'ALL',
  });

  useEffect(() => {
    if (groupFundManagerId === null && groups.length > 0) {
      const cocaGroup = groups.find(g => g.name === 'Co.Ca.');
      const newManagerId = cocaGroup ? cocaGroup.id : groups[0].id;
      setGroupFundManagerId(newManagerId);
    }
  }, [groups, groupFundManagerId]);

  const handleOpenModal = useCallback((modal: ModalState) => {
    setCurrentModal(modal);
  }, []);

  const handleSettingsClick = useCallback(() => {
    if (currentUserRole === 'ADMIN') {
      handleOpenModal({ type: 'settings' });
    } else {
      setPendingAction(() => () => handleOpenModal({ type: 'settings' }));
      handleOpenModal({ type: 'password', fromScreen: 'elevation' });
    }
  }, [currentUserRole, handleOpenModal]);

  const handleLoginSuccess = useCallback(() => {
    setCurrentUserRole('ADMIN');
    if (pendingAction) {
        pendingAction();
        setPendingAction(null);
    }
    handleCloseModal();
  }, [pendingAction]);

  const handleCloseModal = useCallback(() => {
    setCurrentModal(null);
  }, []);
  
  const handleRoleSelect = (role: 'USER' | 'ADMIN') => {
      if (role === 'USER') {
          setCurrentUserRole('USER');
      } else {
          handleOpenModal({ type: 'password', fromScreen: 'login' });
      }
  };

  const handleLogout = () => {
      setCurrentUserRole('NONE');
      setActiveView('contabilita');
  };

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
    const performDelete = () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };
    if (confirmOnDelete) {
        if (window.confirm('Sei sicuro di voler eliminare questa transazione?')) {
            performDelete();
        }
    } else {
        performDelete();
    }
  };

  const addFundTransfer = (transfer: Omit<FundTransfer, 'id'>) => {
    const newTransfer: FundTransfer = {
      ...transfer,
      id: new Date().toISOString() + Math.random(),
    };
    setFundTransfers(prev => [newTransfer, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    handleCloseModal();
  };

  const addInternalTransfer = (transfer: Omit<InternalTransfer, 'id'>) => {
    const newTransfer: InternalTransfer = {
      ...transfer,
      id: new Date().toISOString() + Math.random(),
    };
    setInternalTransfers(prev => [newTransfer, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    handleCloseModal();
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
    setCategories(prev => prev.filter(c => c.id !== id));
  };
  
  const addUnit = (name: string) => {
    if (name && !units.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        const newUnit: Unit = { id: new Date().toISOString() + Math.random(), name };
        setUnits(prev => [...prev, newUnit]);
    }
  };

  const deleteUnit = (id: string) => {
      setUnits(prev => prev.filter(u => u.id !== id));
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = { ...memberData, id: new Date().toISOString() + Math.random() };
    setMembers(prev => [...prev, newMember]);
  };
  
  const updateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const deleteMember = (id: string) => {
    const performDelete = () => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };
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
    setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, name: newName } : group
    ));
  };

  const updateGroupColor = (groupId: string, newColor: string) => {
    setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, color: newColor } : group
    ));
  };

  const updateGroupQuoteSettings = (groupId: string, newSettings: QuoteSettings) => {
    setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, quoteSettings: newSettings } : group
    ));
  };

  const handleSaveSelfFinancingProject = (projectData: Omit<SelfFinancingProject, 'id'> | SelfFinancingProject) => {
    if ('id' in projectData) { // Update
      setSelfFinancingProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
    } else { // Add
      const newProject: SelfFinancingProject = { ...projectData, id: new Date().toISOString() + Math.random() };
      setSelfFinancingProjects(prev => [...prev, newProject]);
    }
    handleCloseModal();
  };

  const deleteSelfFinancingProject = (projectId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo progetto di autofinanziamento? Le transazioni associate NON verranno eliminate ma solo scollegate.')) {
        setSelfFinancingProjects(prev => prev.filter(p => p.id !== projectId));
        // Unlink transactions
        setTransactions(prev => prev.map(t => t.selfFinancingId === projectId ? { ...t, selfFinancingId: undefined } : t));
    }
  };

  const handleBackup = () => {
    try {
        const backupData = {
            transactions,
            categories,
            groups,
            members,
            units,
            fundTransfers,
            internalTransfers,
            selfFinancingProjects,
            confirmOnDelete,
            groupFundManagerId,
            userPermissions,
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

  const handleRestore = (data: any) => {
    try {
        setTransactions(data.transactions || []);
        setCategories(data.categories || INITIAL_CATEGORIES);
        setGroups(data.groups || INITIAL_GROUPS);
        setMembers(data.members || []);
        setUnits(data.units || INITIAL_UNITS);
        setFundTransfers(data.fundTransfers || []);
        setInternalTransfers(data.internalTransfers || []);
        setSelfFinancingProjects(data.selfFinancingProjects || []);
        setConfirmOnDelete(data.confirmOnDelete !== undefined ? data.confirmOnDelete : true);
        setGroupFundManagerId(data.groupFundManagerId || null);
        setUserPermissions(data.userPermissions || INITIAL_USER_PERMISSIONS);
        alert('Dati ripristinati con successo!');
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

  const combinedLedgerEntries = useMemo(() => {
    const groupMap = new Map(groups.map(g => [g.id, g.name]));
    const installmentLabels: Record<keyof MemberInstallments, string> = { first: '1° Rata', second: '2° Rata', third: '3° Rata', summerCamp: 'Campo Estivo' };

    const transactionEntries: LedgerEntry[] = transactions.map(t => ({
      id: `t-${t.id}`,
      date: t.date,
      type: t.type === TransactionType.INCOME ? LedgerEntryType.TRANSACTION_INCOME : LedgerEntryType.TRANSACTION_EXPENSE,
      description: t.description,
      amount: t.amount,
      details: `${t.category} • ${t.paymentMethod}`,
      groupsInvolved: [t.groupId],
      originalObject: t,
    }));

    const installmentEntries: LedgerEntry[] = members.flatMap(m =>
      (Object.keys(m.installments) as Array<keyof MemberInstallments>).map(key => {
        const installment = m.installments[key];
        if (installment.amount <= 0 || !installment.date) return null;
        return {
          id: `i-${m.id}-${key}`,
          date: installment.date,
          type: LedgerEntryType.INSTALLMENT_PAYMENT,
          description: `Pagamento ${installmentLabels[key as keyof MemberInstallments]}`,
          amount: installment.amount,
          details: `${m.name} • ${installment.paymentMethod}`,
          groupsInvolved: [m.groupId],
          originalObject: { member: m, installmentKey: key },
        };
      }).filter((e): e is LedgerEntry => e !== null)
    );

    const fundTransferEntries: LedgerEntry[] = fundTransfers.map(ft => ({
      id: `ft-${ft.id}`,
      date: ft.date,
      type: LedgerEntryType.FUND_TRANSFER,
      description: ft.type === FundTransferType.WITHDRAWAL ? 'Giroconto: Prelievo da Banca' : 'Giroconto: Versamento in Banca',
      amount: ft.totalAmount,
      details: ft.description,
      groupsInvolved: Object.keys(ft.distribution),
      originalObject: ft,
    }));

    const internalTransferEntries: LedgerEntry[] = internalTransfers.map(it => ({
        id: `it-${it.id}`,
        date: it.date,
        type: LedgerEntryType.INTERNAL_TRANSFER,
        description: `Trasferimento: ${groupMap.get(it.fromGroupId)} ➞ ${groupMap.get(it.toGroupId)}`,
        amount: it.amount,
        details: it.description,
        groupsInvolved: [it.fromGroupId, it.toGroupId],
        originalObject: it,
    }));
    
    return [...transactionEntries, ...installmentEntries, ...fundTransferEntries, ...internalTransferEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, members, fundTransfers, internalTransfers, groups]);

  const filteredLedgerEntries = useMemo(() => {
    let filtered = combinedLedgerEntries;
    
    if (filters.groupId !== 'ALL') {
      filtered = filtered.filter(e => e.groupsInvolved.includes(filters.groupId));
    }
    
    if (filters.ledgerType !== 'ALL') {
      const typesToMatch = filters.ledgerType === 'TRANSACTION_INCOME' 
        ? [LedgerEntryType.TRANSACTION_INCOME, LedgerEntryType.INSTALLMENT_PAYMENT]
        : [filters.ledgerType as LedgerEntryType];
      if (filters.ledgerType === 'TRANSACTION_EXPENSE') typesToMatch.push(LedgerEntryType.TRANSACTION_EXPENSE);
      
      filtered = filtered.filter(e => typesToMatch.includes(e.type));
    }
    if (filters.text) filtered = filtered.filter(t => t.description.toLowerCase().includes(filters.text.toLowerCase()));
    if (filters.category !== 'ALL') {
      filtered = filtered.filter(e => {
        if (e.type === LedgerEntryType.TRANSACTION_INCOME || e.type === LedgerEntryType.TRANSACTION_EXPENSE) {
          return (e.originalObject as Transaction).category === filters.category;
        }
        return false; // Non-transactions don't have categories
      });
    }
    if (filters.startDate) filtered = filtered.filter(t => t.date >= filters.startDate);
    if (filters.endDate) filtered = filtered.filter(t => t.date <= filters.endDate);
    return filtered;
  }, [combinedLedgerEntries, filters]);
  
  const hasActiveFilters = filters.text !== '' || filters.type !== 'ALL' || filters.category !== 'ALL' || filters.startDate !== '' || filters.endDate !== '' || filters.ledgerType !== 'ALL' || filters.groupId !== 'ALL';

  const permissions = currentUserRole === 'ADMIN' ? 
    // Admin has all permissions
    Object.keys(INITIAL_USER_PERMISSIONS).reduce((acc, key) => ({ ...acc, [key]: true }), {} as UserPermissions)
    : userPermissions;

  return (
    <>
      {currentUserRole === 'NONE' ? (
        <LoginScreen onRoleSelect={handleRoleSelect} />
      ) : (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
          <Header 
            onOpenTransactionModal={() => handleOpenModal({ type: 'transaction' })}
            onOpenFundTransferModal={() => handleOpenModal({ type: 'fundTransfer' })}
            onOpenInternalTransferModal={() => handleOpenModal({ type: 'internalTransfer' })}
            onOpenSettings={handleSettingsClick} 
            onExport={handleExport}
            activeView={activeView}
            onSetView={setActiveView}
            permissions={permissions}
            role={currentUserRole}
            onLogout={handleLogout}
          />
          
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {activeView === 'contabilita' && (
              <>
                <Summary 
                  transactions={transactions} 
                  groups={groups}
                  members={members}
                  fundTransfers={fundTransfers}
                  internalTransfers={internalTransfers}
                  activeGroupId={activeGroupId}
                  onSelectGroup={setActiveGroupId}
                  groupFundManagerId={groupFundManagerId}
                />
                <div className="mt-8">
                  <FilterPanel
                    categories={categories}
                    filters={filters}
                    onFilterChange={setFilters}
                    mode={activeGroupId ? 'transactions' : 'ledger'}
                    groups={groups}
                  />
                  {activeGroupId ? (
                    <TransactionList 
                      transactions={filteredTransactions} 
                      groups={groups}
                      onDelete={deleteTransaction}
                      onEdit={(transaction) => handleOpenModal({ type: 'transaction', data: transaction })}
                      hasActiveFilters={hasActiveFilters}
                      permissions={permissions}
                    />
                  ) : (
                    <CombinedLedger
                      entries={filteredLedgerEntries}
                      groups={groups}
                      hasActiveFilters={hasActiveFilters}
                    />
                  )}
                </div>
              </>
            )}
            {activeView === 'quote' && permissions.canViewQuote && (
                <QuotePanel
                    groups={groups}
                    members={members}
                    units={units}
                    onOpenMemberModal={(data) => handleOpenModal({type: 'member', data})}
                    onOpenInstallmentModal={(data) => handleOpenModal({type: 'installment', data})}
                    onDeleteMember={deleteMember}
                    onUpdateMember={updateMember}
                    permissions={permissions}
                />
            )}
            {activeView === 'conti' && permissions.canViewConti && (
                <AccountsPanel 
                  transactions={transactions}
                  groups={groups}
                  members={members}
                  fundTransfers={fundTransfers}
                  internalTransfers={internalTransfers}
                  groupFundManagerId={groupFundManagerId}
                />
            )}
            {activeView === 'anticipi' && permissions.canViewAnticipi && (
                <AdvancesPanel 
                  transactions={transactions}
                  onUpdateRepayment={updateTransactionRepayment}
                />
            )}
             {activeView === 'autofinanziamenti' && permissions.canViewAutofinanziamenti && (
                <SelfFinancingPanel
                    projects={selfFinancingProjects}
                    transactions={transactions}
                    groups={groups}
                    onOpenProjectModal={(data) => handleOpenModal({ type: 'selfFinancingProject', data })}
                    onDeleteProject={deleteSelfFinancingProject}
                    onOpenTransactionModal={(context) => handleOpenModal({ type: 'transaction', context })}
                    permissions={permissions}
                />
            )}
          </main>
        </div>
      )}

      {/* Modals are rendered here at the top level to overlay any screen */}
      {currentModal?.type === 'transaction' && (
        <Modal title={currentModal.data ? "Modifica Transazione" : "Aggiungi Transazione"} onClose={handleCloseModal}>
          <TransactionForm 
            onSave={handleSaveTransaction} 
            categories={categories}
            groups={groups}
            members={members}
            initialData={currentModal.data}
            context={currentModal.context}
          />
        </Modal>
      )}

      {currentModal?.type === 'fundTransfer' && (
        <Modal title="Nuovo Giroconto" onClose={handleCloseModal}>
          <FundTransferForm
            groups={groups}
            onSave={addFundTransfer}
          />
        </Modal>
      )}

      {currentModal?.type === 'internalTransfer' && groupFundManagerId && (
        <Modal title="Nuovo Trasferimento Interno" onClose={handleCloseModal}>
          <InternalTransferForm
            groups={groups}
            onSave={addInternalTransfer}
            managerGroupId={groupFundManagerId}
            internalTransfers={internalTransfers}
          />
        </Modal>
      )}

      {currentModal?.type === 'password' && (
        <PasswordModal 
          onClose={handleCloseModal}
          onSuccess={handleLoginSuccess}
        />
      )}
      
      {currentModal?.type === 'selfFinancingProject' && (
        <Modal title={currentModal.data ? "Modifica Progetto" : "Nuovo Progetto di Autofinanziamento"} onClose={handleCloseModal}>
          <SelfFinancingProjectForm
            groups={groups}
            onSave={handleSaveSelfFinancingProject}
            initialData={currentModal.data}
            onClose={handleCloseModal}
          />
        </Modal>
      )}

      {currentModal?.type === 'settings' && currentUserRole === 'ADMIN' && (
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
                onRestore={handleRestore}
                groupFundManagerId={groupFundManagerId}
                onSetGroupFundManagerId={setGroupFundManagerId}
                userPermissions={userPermissions}
                onSetUserPermissions={setUserPermissions}
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
    </>
  );
};

export default App;