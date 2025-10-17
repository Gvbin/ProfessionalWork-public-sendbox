import { useState } from 'react';

export function EditListModal({ list, onSave, onClose }) {
  const [title, setTitle] = useState(list?.title || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(list.id, title);
  };

  if (!list) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Edit List</h2>
        <form onSubmit={handleSubmit}>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="border rounded px-3 py-2 w-full mb-4" 
            autoFocus 
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-200 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}