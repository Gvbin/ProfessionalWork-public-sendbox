export function MembersModal({ 
  board, 
  boardMembers, 
  allUsers, 
  currentUserId, 
  onAddMember, 
  onRemoveMember, 
  onClose 
}) {
  const isOwner = board?.ownerId === currentUserId;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Board Members</h2>
        
        <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
          {boardMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No members yet</p>
          ) : (
            boardMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}&size=32&background=0D8ABC&color=fff`}
                    alt={member.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{member.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-600">{member.email}</p>
                    {member.id === board?.ownerId && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
                
                {board?.ownerId !== member.id && isOwner && (
                  <button 
                    onClick={() => onRemoveMember(member.id)}
                    className="text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        
        {isOwner && (
          <>
            <h3 className="font-semibold mb-2">Add Members</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {allUsers.filter(u => !boardMembers.some(m => m.id === u.id)).length === 0 ? (
                <p className="text-gray-500 text-center py-4">All users are already members</p>
              ) : (
                allUsers.filter(u => !boardMembers.some(m => m.id === u.id)).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onAddMember(user.id)}
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
                ))
              )}
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
          <button 
            onClick={onClose} 
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}