import React, { useState, useMemo, useCallback } from 'react';
import { Transaction, Category, ModalType, Group } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { INITIAL_CATEGORIES, INITIAL_GROUPS } from './constants';
import Header from './components/Header';
import Summary from './components/Summary';
import TransactionList from './components/TransactionList';
import Modal from './components/Modal';
import TransactionForm from './components/TransactionForm';
import PasswordModal from './components/PasswordModal';
import SettingsPanel from './components/SettingsPanel';
import { exportToCsv } from './services/exportService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', INITIAL_CATEGORIES);
  const [groups, setGroups] = useLocalStorage<Group[]>('groups', INITIAL_GROUPS);
  
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [confirmOnDelete, setConfirmOnDelete] = useLocalStorage<boolean>('confirmOnDelete', true);

  const handleOpenModal = useCallback((modal: ModalType, transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
    } else {
      setEditingTransaction(null);
    }
    setActiveModal(modal);
  }, []);

  const handleSettingsClick = useCallback(() => {
    if (isAdminAuthenticated) {
      setActiveModal('settings');
    } else {
      setActiveModal('password');
    }
  }, [isAdminAuthenticated]);

  const handleLoginSuccess = useCallback(() => {
    setIsAdminAuthenticated(true);
    setActiveModal('settings');
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
    setEditingTransaction(null);
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().toISOString() + Math.random(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
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

  const deleteTransaction = (id: string) => {
    if (confirmOnDelete) {
        if (window.confirm('Sei sicuro di voler eliminare questa transazione?')) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    } else {
        setTransactions(transactions.filter(t => t.id !== id));
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

  const handleExport = () => {
    exportToCsv(transactions, 'report_contabilita.csv', groups);
  };
  
  const updateGroupName = (groupId: string, newName: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
  };

  const filteredTransactions = useMemo(() => {
    if (!activeGroupId) {
      return transactions;
    }
    return transactions.filter(t => t.groupId === activeGroupId);
  }, [transactions, activeGroupId]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <Header onOpenTransactionModal={() => handleOpenModal('transaction')} onOpenSettings={handleSettingsClick} onExport={handleExport} />
      
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Summary 
          transactions={transactions} 
          groups={groups}
          activeGroupId={activeGroupId}
          onSelectGroup={setActiveGroupId}
        />
        
        <div className="mt-8">
          <TransactionList 
            transactions={filteredTransactions} 
            groups={groups}
            onDelete={deleteTransaction}
            onEdit={(transaction) => handleOpenModal('transaction', transaction)}
          />
        </div>
      </main>

      {activeModal === 'transaction' && (
        <Modal title={editingTransaction ? "Modifica Transazione" : "Aggiungi Transazione"} onClose={handleCloseModal}>
          <TransactionForm 
            onSave={handleSaveTransaction} 
            categories={categories}
            groups={groups}
            initialData={editingTransaction}
          />
        </Modal>
      )}

      {activeModal === 'password' && (
        <PasswordModal 
          onClose={handleCloseModal}
          onSuccess={handleLoginSuccess}
        />
      )}

      {activeModal === 'settings' && (
        <Modal title="Impostazioni Amministratore" onClose={handleCloseModal}>
            <SettingsPanel
                categories={categories}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
                groups={groups}
                onUpdateGroupName={updateGroupName}
                confirmOnDelete={confirmOnDelete}
                onSetConfirmOnDelete={setConfirmOnDelete}
            />
        </Modal>
      )}
    </div>
  );
};

export default App;