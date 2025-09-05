import React from 'react';
import { PlusIcon, CogIcon, DownloadIcon } from './icons/Icons';

interface HeaderProps {
  onOpenTransactionModal: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenTransactionModal, onOpenSettings, onExport }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Contabilità Comune
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-3">
             <button
              onClick={onOpenTransactionModal}
              className="flex items-center bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow"
              aria-label="Aggiungi nuova transazione"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Aggiungi</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center bg-slate-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-slate-600 transition-colors duration-200 text-sm font-medium shadow"
              aria-label="Apri impostazioni"
            >
              <CogIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Impostazioni</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium shadow"
              aria-label="Esporta dati in CSV"
            >
              <DownloadIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Esporta</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;