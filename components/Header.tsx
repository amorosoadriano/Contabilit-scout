
import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, CogIcon, DownloadIcon, UsersIcon, ClipboardDocumentListIcon, BanknotesIcon, ArrowUturnLeftIcon, ArrowPathRoundedSquareIcon, PencilSquareIcon, LightBulbIcon } from './icons/Icons';
import { ViewType, UserPermissions, UserRole } from '../types';

interface HeaderProps {
  onOpenTransactionModal: () => void;
  onOpenFundTransferModal: () => void;
  onOpenInternalTransferModal: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
  activeView: ViewType;
  onSetView: (view: ViewType) => void;
  permissions: UserPermissions;
  role: UserRole;
  onLogout: () => void;
}

const NavButton: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode; icon: React.ReactNode;}> = ({ onClick, isActive, children, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-3 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
            isActive 
            ? 'border-blue-600 text-blue-600' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`}
    >
        {icon}
        {children}
    </button>
)

const Header: React.FC<HeaderProps> = ({ onOpenTransactionModal, onOpenFundTransferModal, onOpenInternalTransferModal, onOpenSettings, onExport, activeView, onSetView, permissions, role, onLogout }) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Contabilità Comune
            </h1>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {role === 'ADMIN' ? 'Amministratore' : 'Utente'}
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
             <div className="relative" ref={addMenuRef}>
                {(permissions.canAddTransaction || permissions.canManageFundTransfers || permissions.canManageInternalTransfers) && (
                  <button
                    onClick={() => setIsAddMenuOpen(prev => !prev)}
                    className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                    aria-haspopup="true"
                    aria-expanded={isAddMenuOpen}
                  >
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Aggiungi
                  </button>
                )}
                {isAddMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                    <div className="py-1" role="none">
                      {permissions.canAddTransaction && (
                        <button onClick={() => { onOpenTransactionModal(); setIsAddMenuOpen(false); }} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">
                          <PencilSquareIcon className="w-4 h-4 mr-2 inline-block"/>
                          Transazione
                        </button>
                      )}
                      {permissions.canManageFundTransfers && (
                        <button onClick={() => { onOpenFundTransferModal(); setIsAddMenuOpen(false); }} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">
                           <ArrowPathRoundedSquareIcon className="w-4 h-4 mr-2 inline-block"/>
                           Giroconto
                        </button>
                      )}
                      {permissions.canManageInternalTransfers && (
                         <button onClick={() => { onOpenInternalTransferModal(); setIsAddMenuOpen(false); }} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100" role="menuitem">
                            <ArrowUturnLeftIcon className="w-4 h-4 mr-2 inline-block -scale-x-100"/>
                            Trasferimento Interno
                         </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            {permissions.canExport && (
              <button onClick={onExport} className="hidden sm:flex items-center bg-white text-slate-600 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors duration-200 text-sm font-medium border border-slate-300">
                <DownloadIcon className="w-5 h-5 mr-1" />
                Esporta
              </button>
            )}
            
            <button onClick={onOpenSettings} className="flex items-center bg-white text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200">
              <CogIcon className="w-6 h-6" />
            </button>
            
            <button onClick={onLogout} className="flex items-center bg-white text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200" title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
            </button>
          </div>
        </div>
        
        <div className="border-t border-slate-200">
            <nav className="flex space-x-1 sm:space-x-2 -mb-px overflow-x-auto" aria-label="Tabs">
                <NavButton onClick={() => onSetView('contabilita')} isActive={activeView === 'contabilita'} icon={<ClipboardDocumentListIcon className="w-5 h-5 mr-2"/>}>
                    Contabilità
                </NavButton>
                {permissions.canViewQuote && (
                    <NavButton onClick={() => onSetView('quote')} isActive={activeView === 'quote'} icon={<UsersIcon className="w-5 h-5 mr-2"/>}>
                        Quote
                    </NavButton>
                )}
                 {permissions.canViewConti && (
                    <NavButton onClick={() => onSetView('conti')} isActive={activeView === 'conti'} icon={<BanknotesIcon className="w-5 h-5 mr-2"/>}>
                        Conti
                    </NavButton>
                )}
                {permissions.canViewAnticipi && (
                    <NavButton onClick={() => onSetView('anticipi')} isActive={activeView === 'anticipi'} icon={<ArrowUturnLeftIcon className="w-5 h-5 mr-2"/>}>
                        Anticipi
                    </NavButton>
                )}
                {permissions.canViewAutofinanziamenti && (
                    <NavButton onClick={() => onSetView('autofinanziamenti')} isActive={activeView === 'autofinanziamenti'} icon={<LightBulbIcon className="w-5 h-5 mr-2"/>}>
                        Autofinanziamenti
                    </NavButton>
                )}
            </nav>
        </div>

      </div>
    </header>
  );
};

export default Header;