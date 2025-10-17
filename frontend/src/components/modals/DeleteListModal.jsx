export function DeleteListModal({ list, onConfirm, onClose }) {
  if (!list) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-2 text-red-600">Delete List</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the list "<strong>{list.title}</strong>"? 
          {list.cards?.length > 0 && ` This will also delete ${list.cards.length} card${list.cards.length > 1 ? 's' : ''}.`} 
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => onConfirm(list.id)} 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}