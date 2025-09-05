import React, { useRef, useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from './icons/Icons';

interface BackupManagerProps {
  onBackup: () => void;
  onValidate: (data: any) => { isValid: boolean, summary: string };
  onRestore: (data: any) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ onBackup, onValidate, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadedData, setLoadedData] = useState<any | null>(null);
  const [backupSummary, setBackupSummary] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleImportClick = () => {
    setLoadedData(null);
    setBackupSummary('');
    setError('');
    setIsConfirming(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onerror = () => {
        setError(`Errore durante la lettura del file: ${reader.error?.message}`);
    };

    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Impossibile leggere il contenuto del file.');
        }
        const data = JSON.parse(text);
        
        const validationResult = onValidate(data);

        if (validationResult.isValid) {
            setLoadedData(data);
            setBackupSummary(validationResult.summary);
            setError('');
        } else {
            setLoadedData(null);
            setBackupSummary('');
        }

      } catch (error) {
        setLoadedData(null);
        setBackupSummary('');
        setError('Errore: Il file non è in formato JSON valido o è corrotto.');
        console.error('Error parsing backup file:', error);
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  const handleFinalRestore = () => {
    if (!loadedData) return;
    onRestore(loadedData);
    setLoadedData(null);
    setBackupSummary('');
    setIsConfirming(false);
  };

  const handleCancelRestore = () => {
    setLoadedData(null);
    setBackupSummary('');
    setIsConfirming(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800">Esporta Dati</h3>
        <p className="text-sm text-slate-500 mt-1 mb-3">
          Crea un file di backup contenente tutti i dati dell'applicazione (transazioni, gruppi, membri, impostazioni, ecc.). Conserva questo file in un posto sicuro.
        </p>
        <button
          onClick={onBackup}
          className="flex items-center justify-center w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Esporta Backup
        </button>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-medium text-slate-800">Importa Dati</h3>
        <p className="text-sm text-slate-500 mt-1 mb-3">
          Ripristina i dati da un file di backup.
        </p>
        <button
          onClick={handleImportClick}
          className="mt-3 flex items-center justify-center w-full sm:w-auto bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition-colors duration-200 text-sm font-medium shadow"
        >
          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
          Seleziona File di Backup...
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

        {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                <p className="font-bold">Importazione Fallita</p>
                <p>{error}</p>
            </div>
        )}
        
        {loadedData && backupSummary && (
            <div className="mt-6 space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {!isConfirming ? (
                    <>
                        <h4 className="text-md font-semibold text-slate-800">Step 1: Riepilogo del File Caricato</h4>
                        <div className="text-sm text-slate-700 whitespace-pre-wrap">{backupSummary}</div>
                        <div className="pt-2">
                            <p className="font-bold text-slate-800">Step 2: Procedi con il Ripristino</p>
                            <p className="text-sm text-slate-600 mt-1">Se il riepilogo è corretto, clicca il pulsante per passare alla conferma finale.</p>
                        </div>
                        <div className="flex items-center space-x-3 pt-2">
                            <button
                                onClick={() => setIsConfirming(true)}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 font-semibold shadow-sm"
                            >
                                Procedi al Ripristino...
                            </button>
                            <button
                                onClick={handleCancelRestore}
                                className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors duration-200 font-semibold"
                            >
                                Annulla
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h4 className="text-md font-semibold text-slate-800">Step 3: Conferma Finale</h4>
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                            <p className="font-bold">Questa azione è irreversibile.</p>
                            <p>Sei assolutamente sicuro di voler sovrascrivere tutti i dati correnti con quelli del file di backup?</p>
                        </div>
                        <div className="flex items-center space-x-3 pt-2">
                            <button
                                onClick={handleFinalRestore}
                                className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors duration-200 font-bold shadow-sm"
                            >
                                Sì, sovrascrivi tutto
                            </button>
                            <button
                                onClick={() => setIsConfirming(false)}
                                className="bg-slate-200 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-300 transition-colors duration-200 font-semibold"
                            >
                                Indietro
                            </button>
                        </div>
                    </>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default BackupManager;