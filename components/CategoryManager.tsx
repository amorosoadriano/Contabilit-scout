
import React, { useState } from 'react';
import { Category } from '../types';
import { TrashIcon } from './icons/Icons';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAddCategory, onDeleteCategory }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Aggiungi Categoria</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nome nuova categoria"
            className="flex-grow px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-sm"
          >
            Aggiungi
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Categorie Esistenti</h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {categories.map(category => (
            <li key={category.id} className="flex justify-between items-center bg-slate-100 p-2 rounded-md">
              <span className="text-sm text-slate-700">{category.name}</span>
              <button
                onClick={() => onDeleteCategory(category.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                aria-label={`Elimina categoria ${category.name}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManager;
