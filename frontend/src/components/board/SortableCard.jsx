import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UserPlus, Trash2, MessageSquare, Eye } from 'lucide-react';

export function SortableCard({ card, onUpdate, onDelete, onAssign, onOpenDetail }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: card.id 
  });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: isDragging ? 0.5 : 1 
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="bg-white rounded-lg shadow-sm group relative border hover:border-blue-500 touch-none cursor-grab"
    >
      <div className="p-3">
        <p className="text-gray-800 flex-1 mb-2">
          {card.title}
        </p>

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {card.assignedTo && (
            <div className="flex items-center gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(card.assignedTo.name || 'U')}&size=24&background=0D8ABC&color=fff`}
                alt={card.assignedTo.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-xs text-gray-600">
                {card.assignedTo.name || card.assignedTo.email}
              </span>
            </div>
          )}

          {card.comments && card.comments.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <MessageSquare size={14} />
              <span className="text-xs">{card.comments.length}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onOpenDetail(card);
          }} 
          className="p-1.5 rounded-full text-gray-400 hover:bg-green-100 hover:text-green-600"
          title="View details"
        >
          <Eye size={14} />
        </button>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onAssign(card); 
          }} 
          className="p-1.5 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-600"
          title="Assign user"
        >
          <UserPlus size={14} />
        </button>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(card.id, card.listId); 
          }} 
          className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600"
          title="Delete card"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}