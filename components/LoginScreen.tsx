import React from 'react';

interface LoginScreenProps {
  onRoleSelect: (role: 'USER' | 'ADMIN') => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-slate-800">
            Benvenuto
        </h1>
        <p className="mt-2 text-lg text-slate-600">
            Gestore Contabilità di Gruppo
        </p>
        <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-slate-700 mb-6">
                Come vuoi accedere?
            </h2>
            <div className="space-y-4">
                <button
                    onClick={() => onRoleSelect('USER')}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm text-lg"
                >
                    Entra come Utente
                </button>
                <button
                    onClick={() => onRoleSelect('ADMIN')}
                    className="w-full bg-slate-600 text-white px-4 py-3 rounded-md hover:bg-slate-700 transition-colors duration-200 font-semibold shadow-sm text-lg"
                >
                    Entra come Amministratore
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
