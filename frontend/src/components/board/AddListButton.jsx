import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export function AddListButton({ onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await onAdd(title);
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button 
        onClick={() => setIsAdding(true)} 
        className="w-full flex items-center gap-2 bg-white/50 hover:bg-white/80 transition text-gray-700 font-semibold p-3 rounded-xl shadow-sm"
      >
        <Plus size={18} /> Add another list
      </button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-gray-200/70 rounded-xl p-2 shadow-md"
    >
      <form onSubmit={handleSubmit}>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Enter list title..." 
          className="w-full border-blue-500 border-2 rounded-md px-3 py-2 mb-2" 
          autoFocus 
        />
        <div className="flex items-center gap-2">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700"
          >
            Add list
          </button>
          <button 
            type="button" 
            onClick={() => setIsAdding(false)} 
            className="p-2 text-gray-500 hover:bg-gray-200 rounded"
          >
            <X size={20} />
          </button>
        </div>
      </form>
    </motion.div>
  );
}