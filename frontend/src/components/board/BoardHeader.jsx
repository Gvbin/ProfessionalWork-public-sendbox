import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';

export function BoardHeader({ board, boardMembers, onShowMembers }) {
  return (
    <header className="px-6 py-3 bg-white/60 backdrop-blur-sm shadow-sm flex items-center justify-between border-b border-white/30">
      <div className="flex items-center gap-4">
        <Link to="/boards" className="p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{board?.title}</h1>
      </div>
      <button 
        onClick={onShowMembers}
        className="flex items-center gap-2 bg-white/80 hover:bg-white px-4 py-2 rounded-lg shadow transition"
      >
        <Users size={18} />
        Members ({boardMembers.length})
      </button>
    </header>
  );
}