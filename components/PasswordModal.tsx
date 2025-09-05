import React, { useState } from 'react';
import Modal from './Modal';

interface PasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this should be a secure check against a backend.
    if (password === 'adriano') {
      onSuccess();
    } else {
      setError('Password errata. Riprova.');
      setPassword('');
    }
  };

  return (
    <Modal title="Accesso Amministratore" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password-input" className="block text-sm font-medium text-slate-700">
            Inserisci la password per accedere alle impostazioni
          </label>
          <input
            id="password-input"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); // Clear error on new input
            }}
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            autoFocus
          />
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="pt-2 flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm"
          >
            Accedi
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordModal;