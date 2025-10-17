import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export function SortableList({ list, children, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: `list-${list.id}` 
  });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ 
    id: `droppable-${list.id}`, 
    data: { listId: list.id } 
  });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: isDragging ? 0.5 : 1 
  };
  
  const listMenuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useOutsideClick(listMenuRef, () => setMenuOpen(false));

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-gray-200/70 rounded-xl shadow-md w-80 flex-shrink-0 flex flex-col max-h-full"
    >
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-300/50">
        <span 
          {...attributes} 
          {...listeners} 
          className="font-semibold text-gray-800 cursor-grab flex-1"
        >
          {list.title}
        </span>
        
        <div className="relative" ref={listMenuRef}>
          <button 
            onClick={() => setMenuOpen(true)} 
            className="p-1 rounded-md hover:bg-gray-300/60 text-gray-500"
          >
            <MoreHorizontal size={18} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
              <button 
                onClick={() => { 
                  onEdit(list); 
                  setMenuOpen(false); 
                }} 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit size={14} /> Edit list
              </button>
              <button 
                onClick={() => { 
                  onDelete(list); 
                  setMenuOpen(false); 
                }} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete list
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div 
        ref={setDroppableRef} 
        className={`p-2 flex-1 overflow-y-auto transition-colors ${isOver ? 'bg-blue-100/50' : ''}`}
      >
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div 
            className="space-y-2" 
            style={{ minHeight: list.cards.length === 0 ? '50px' : 'auto' }}
          >
            {children}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}