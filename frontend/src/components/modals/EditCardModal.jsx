import { useState } from 'react';
import { X } from 'lucide-react';

export function EditCardModal({ card, listId, lists, onSave, onClose }) {
  const [title, setTitle] = useState(card?.title || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(card.id, title);
  };

  // Vérifier si la carte appartient à cette liste
  const isInCurrentList = lists.find(l => l.id === listId)?.cards.some(c => c.id === card?.id);
  
  if (!card || !isInCurrentList) return null;

  return (
    <form onSubmit={handleSubmit} className="mt-2 bg-white rounded-lg p-3 shadow-sm border">
      <textarea 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        className="w-full border-gray-300 rounded-md p-2 text-sm resize-none" 
        rows={3} 
        autoFocus 
      />
      <div className="flex items-center gap-2 mt-2">
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700"
        >
          Save
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          className="p-2 text-gray-500 hover:bg-gray-200 rounded"
        >
          <X size={20} />
        </button>
      </div>
    </form>
  );
}