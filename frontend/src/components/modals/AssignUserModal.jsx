export function AssignUserModal({ card, users, onAssign, onUnassign, onClose }) {
  if (!card) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          Assign User to "{card.title}"
        </h2>
        
        <div className="max-h-64 overflow-y-auto space-y-2">
          {card.assignedTo && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(card.assignedTo.name || 'U')}&size=32&background=0D8ABC&color=fff`}
                    alt={card.assignedTo.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {card.assignedTo.name || 'Unnamed'}
                    </p>
                    <p className="text-xs text-gray-600">{card.assignedTo.email}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnassign();
                  }}
                  className="text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
          
          {users.filter(u => u.id !== card.assignedTo?.id).map((user) => (
            <button
              key={user.id}
              onClick={(e) => {
                e.stopPropagation();
                onAssign(user.id);
              }}
              className="w-full p-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&size=32&background=0D8ABC&color=fff`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-left">
                <p className="font-medium text-gray-800">{user.name || 'Unnamed'}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}