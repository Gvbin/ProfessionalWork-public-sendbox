import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Plus, Trash2, X, MoreHorizontal, Edit, UserPlus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) callback();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

function SortableCard({ card, onUpdate, onDelete, onAssign }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white rounded-lg shadow-sm group relative border hover:border-blue-500 touch-none cursor-grab">
      <div className="p-3">
        <p onClick={(e) => { e.stopPropagation(); onUpdate(card); }} className="text-gray-800 flex-1 cursor-pointer mb-2">{card.title}</p>
        {card.assignedTo && (
          <div className="flex items-center gap-2 mt-2">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(card.assignedTo.name || 'U')}&size=24&background=0D8ABC&color=fff`}
              alt={card.assignedTo.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-gray-600">{card.assignedTo.name || card.assignedTo.email}</span>
          </div>
        )}
      </div>
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={(e) => { e.stopPropagation(); onAssign(card); }} className="p-1.5 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-600">
          <UserPlus size={14} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(card.id, card.listId); }} className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function SortableList({ list, children, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `list-${list.id}` });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: `droppable-${list.id}`, data: { listId: list.id } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const listMenuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useOutsideAlerter(listMenuRef, () => setMenuOpen(false));

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-200/70 rounded-xl shadow-md w-80 flex-shrink-0 flex flex-col max-h-full">
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-300/50">
        <span {...attributes} {...listeners} className="font-semibold text-gray-800 cursor-grab flex-1">{list.title}</span>
        <div className="relative" ref={listMenuRef}>
          <button onClick={() => setMenuOpen(true)} className="p-1 rounded-md hover:bg-gray-300/60 text-gray-500"><MoreHorizontal size={18} /></button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
              <button onClick={() => { onEdit(list); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"><Edit size={14} /> Edit list</button>
              <button onClick={() => { onDelete(list); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete list</button>
            </div>
          )}
        </div>
      </div>
      <div ref={setDroppableRef} className={`p-2 flex-1 overflow-y-auto transition-colors ${isOver ? 'bg-blue-100/50' : ''}`}>
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2" style={{ minHeight: list.cards.length === 0 ? '100px' : 'auto' }}>
            {children}
            {list.cards.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Drop cards here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default function BoardDetail() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingCardInList, setEditingCardInList] = useState(null);
  const [newCardTitles, setNewCardTitles] = useState({});
  const [editingCard, setEditingCard] = useState(null);
  const [editingCardTitle, setEditingCardTitle] = useState('');
  const [editingList, setEditingList] = useState(null);
  const [editingListTitle, setEditingListTitle] = useState('');
  const [listToDelete, setListToDelete] = useState(null);
  const [assigningCard, setAssigningCard] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    // Récupérer l'ID de l'utilisateur courant depuis le token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.userId);
    } catch (err) {
      console.error('Failed to parse token', err);
    }

    Promise.all([
      fetch(`http://localhost:4000/boards/${boardId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`http://localhost:4000/lists?boardId=${boardId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`http://localhost:4000/users?boardId=${boardId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`http://localhost:4000/users`, { headers: { Authorization: `Bearer ${token}` } })
    ]).then(async ([boardRes, listsRes, boardUsersRes, allUsersRes]) => {
      if (!boardRes.ok || !listsRes.ok) throw new Error('Failed to load board.');
      const boardData = await boardRes.json();
      setBoard(boardData);
      setLists(await listsRes.json());
      if (boardUsersRes.ok) setUsers(await boardUsersRes.json());
      if (allUsersRes.ok) setAllUsers(await allUsersRes.json());
      
      // Construire la liste des membres (owner + members explicites)
      const members = [];
      
      // Ajouter le propriétaire s'il existe
      if (boardData.owner) {
        members.push(boardData.owner);
      }
      
      // Ajouter les membres explicites
      if (boardData.members && Array.isArray(boardData.members)) {
        boardData.members.forEach(m => {
          // Vérifier que m.user existe et n'est pas déjà dans la liste
          if (m.user && !members.some(member => member.id === m.user.id)) {
            members.push(m.user);
          }
        });
      }
      
      setBoardMembers(members);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [boardId, navigate]);

  const handleAddMember = async (userId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/boards/${boardId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId })
    });
    if (res.ok) {
      const member = await res.json();
      // Vérifier que l'utilisateur n'est pas déjà dans la liste
      if (!boardMembers.some(m => m.id === member.user.id)) {
        setBoardMembers([...boardMembers, member.user]);
      }
      
      // Rafraîchir la liste des utilisateurs du board
      const usersRes = await fetch(`http://localhost:4000/users?boardId=${boardId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (usersRes.ok) setUsers(await usersRes.json());
    } else {
      const errorData = await res.json();
      setError(errorData.error || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (userId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/boards/${boardId}/members/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setBoardMembers(boardMembers.filter(m => m.id !== userId));
      
      // Rafraîchir la liste des utilisateurs du board
      const usersRes = await fetch(`http://localhost:4000/users?boardId=${boardId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (usersRes.ok) setUsers(await usersRes.json());
    } else {
      setError('Failed to remove member.');
    }
  };

  const handleAddList = async (e) => { e.preventDefault(); if (!newListTitle.trim()) return; const token = localStorage.getItem('token'); const res = await fetch('http://localhost:4000/lists', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: newListTitle, boardId }) }); if (res.ok) { const newList = await res.json(); setLists([...lists, { ...newList, cards: [] }]); setNewListTitle(''); setIsAddingList(false); } else setError('Failed to create list.'); };
  const handleUpdateList = async (e, listId) => { e.preventDefault(); const token = localStorage.getItem('token'); const res = await fetch(`http://localhost:4000/lists/${listId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: editingListTitle }) }); if (res.ok) { const updatedList = await res.json(); setLists(lists.map((l) => (l.id === listId ? { ...l, title: updatedList.title } : l))); setEditingList(null); } else setError('Failed to update list.'); };
  const handleDeleteList = async (listId) => { const token = localStorage.getItem('token'); const res = await fetch(`http://localhost:4000/lists/${listId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { setLists(lists.filter((l) => l.id !== listId)); setListToDelete(null); } else setError('Failed to delete list.'); };
  const handleAddCard = async (listId) => { const title = newCardTitles[listId]; if (!title || !title.trim()) return; const token = localStorage.getItem('token'); const res = await fetch('http://localhost:4000/cards', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, listId }) }); if (res.ok) { const newCard = await res.json(); setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l))); setNewCardTitles((prev) => ({ ...prev, [listId]: '' })); setEditingCardInList(null); } else setError('Failed to add card.'); };
  const handleUpdateCard = async (e, cardId) => { e.preventDefault(); const token = localStorage.getItem('token'); const res = await fetch(`http://localhost:4000/cards/${cardId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: editingCardTitle }) }); if (res.ok) { const updatedCard = await res.json(); setLists((prev) => prev.map((l) => ({ ...l, cards: l.cards.map((c) => (c.id === cardId ? updatedCard : c)) }))); setEditingCard(null); } else setError('Failed to update card.'); };
  const handleDeleteCard = async (cardId, listId) => { const token = localStorage.getItem('token'); const res = await fetch(`http://localhost:4000/cards/${cardId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l))); } else setError('Failed to delete card.'); };
  
  const handleAssignUser = async (userId) => {
    if (!assigningCard) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/cards/${assigningCard.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: assigningCard.title, assignedToId: userId })
    });
    if (res.ok) {
      const updatedCard = await res.json();
      setLists((prev) => prev.map((l) => ({ ...l, cards: l.cards.map((c) => (c.id === assigningCard.id ? updatedCard : c)) })));
      setAssigningCard(null);
    } else setError('Failed to assign user.');
  };

  const handleUnassignUser = async () => {
    if (!assigningCard) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/cards/${assigningCard.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: assigningCard.title, assignedToId: null })
    });
    if (res.ok) {
      const updatedCard = await res.json();
      setLists((prev) => prev.map((l) => ({ ...l, cards: l.cards.map((c) => (c.id === assigningCard.id ? updatedCard : c)) })));
      setAssigningCard(null);
    } else setError('Failed to unassign user.');
  };

  const persistReorder = async (newLists) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:4000/boards/reorder`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ lists: newLists }) });
  };

  function handleDragStart(event) {
    const { active } = event;
    const isList = typeof active.id === 'string' && active.id.startsWith('list-');
    if (isList) { const listId = parseInt(active.id.replace('list-', '')); setActiveItem(lists.find((l) => l.id === listId)); } 
    else { for (const list of lists) { const found = list.cards.find((c) => c.id === active.id); if (found) { setActiveItem(found); break; } } }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) { setActiveItem(null); return; }
    const isListDrag = typeof active.id === 'string' && active.id.startsWith('list-');
    
    if (isListDrag) {
      setLists((current) => {
        const oldIndex = current.findIndex((l) => `list-${l.id}` === active.id);
        const newIndex = current.findIndex((l) => `list-${l.id}` === over.id);
        if (oldIndex === -1 || newIndex === -1) return current;
        const newLists = arrayMove(current, oldIndex, newIndex);
        persistReorder(newLists);
        return newLists;
      });
      setActiveItem(null);
      return;
    }

    setLists((current) => {
      const activeList = current.find((l) => l.cards.some((c) => c.id === active.id));
      if (!activeList) return current;

      let targetList = null;
      let insertIndex = -1;

      if (typeof over.id === 'string' && over.id.startsWith('droppable-')) {
        const targetListId = parseInt(over.id.replace('droppable-', ''));
        targetList = current.find((l) => l.id === targetListId);
        insertIndex = 0;
      } else {
        targetList = current.find((l) => l.cards.some((c) => c.id === over.id));
        if (targetList) {
          insertIndex = targetList.cards.findIndex((c) => c.id === over.id);
        }
      }

      if (!targetList) return current;

      const activeCardIndex = activeList.cards.findIndex((c) => c.id === active.id);
      const [movedCard] = activeList.cards.splice(activeCardIndex, 1);

      if (activeList.id !== targetList.id) {
        movedCard.listId = targetList.id;
        if (insertIndex >= 0) {
          targetList.cards.splice(insertIndex, 0, movedCard);
        } else {
          targetList.cards.push(movedCard);
        }
      } else {
        if (insertIndex >= 0) {
          if (insertIndex > activeCardIndex) insertIndex--;
          targetList.cards.splice(insertIndex, 0, movedCard);
        } else {
          targetList.cards.push(movedCard);
        }
      }

      const newLists = [...current];
      persistReorder(newLists);
      return newLists;
    });

    setActiveItem(null);
  }

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-purple-100">
        <Navbar />
        <header className="px-6 py-3 bg-white/60 backdrop-blur-sm shadow-sm flex items-center justify-between border-b border-white/30">
          <div className="flex items-center gap-4">
            <Link to="/boards" className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={20} /></Link>
            <h1 className="text-2xl font-bold text-gray-800">{board?.title}</h1>
          </div>
          <button 
            onClick={() => setShowMembersModal(true)}
            className="flex items-center gap-2 bg-white/80 hover:bg-white px-4 py-2 rounded-lg shadow transition"
          >
            <Users size={18} />
            Members ({boardMembers.length})
          </button>
        </header>
        <main className="flex-1 p-4 flex gap-4 overflow-x-auto">
          <SortableContext items={lists.map((l) => `list-${l.id}`)} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <SortableList key={list.id} list={list} onEdit={() => { setEditingList(list); setEditingListTitle(list.title); }} onDelete={setListToDelete}>
                {list.cards.map((card) => (
                  <SortableCard key={card.id} card={card} onUpdate={() => { setEditingCard(card); setEditingCardTitle(card.title); }} onDelete={handleDeleteCard} onAssign={setAssigningCard} />
                ))}
                {editingCard?.id && list.cards.some(c => c.id === editingCard.id) && (
                  <form onSubmit={(e) => handleUpdateCard(e, editingCard.id)} className="mt-2 bg-white rounded-lg p-3 shadow-sm border">
                    <textarea value={editingCardTitle} onChange={(e) => setEditingCardTitle(e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm resize-none" rows={3} autoFocus />
                    <div className="flex items-center gap-2 mt-2">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700">Save</button>
                      <button type="button" onClick={() => setEditingCard(null)} className="p-2 text-gray-500 hover:bg-gray-200 rounded"><X size={20} /></button>
                    </div>
                  </form>
                )}
                <div className="pt-1">
                  {editingCardInList === list.id ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <textarea value={newCardTitles[list.id] || ''} onChange={(e) => setNewCardTitles((prev) => ({ ...prev, [list.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(list.id); } }} placeholder="Enter a title..." className="w-full border-gray-300 rounded-md p-2 text-sm resize-none" rows={2} autoFocus />
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleAddCard(list.id)} className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700">Add card</button>
                        <button onClick={() => setEditingCardInList(null)} className="p-2 text-gray-500 hover:bg-gray-200 rounded"><X size={20} /></button>
                      </div>
                    </motion.div>
                  ) : (
                    <button onClick={() => setEditingCardInList(list.id)} className="w-full flex items-center gap-2 text-gray-600 p-2 rounded-lg hover:bg-gray-300/60 transition font-medium"><Plus size={16} /> Add a card</button>
                  )}
                </div>
              </SortableList>
            ))}
          </SortableContext>
          <div className="w-80 flex-shrink-0">
            {isAddingList ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-200/70 rounded-xl p-2 shadow-md">
                <form onSubmit={handleAddList}>
                  <input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Enter list title..." className="w-full border-blue-500 border-2 rounded-md px-3 py-2 mb-2" autoFocus />
                  <div className="flex items-center gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700">Add list</button>
                    <button type="button" onClick={() => setIsAddingList(false)} className="p-2 text-gray-500 hover:bg-gray-200 rounded"><X size={20} /></button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <button onClick={() => setIsAddingList(true)} className="w-full flex items-center gap-2 bg-white/50 hover:bg-white/80 transition text-gray-700 font-semibold p-3 rounded-xl shadow-sm"><Plus size={18} /> Add another list</button>
            )}
          </div>
        </main>
      </div>
      <DragOverlay>
        {activeItem && (activeItem.cards ? (<div className="bg-gray-200/70 rounded-xl shadow-md w-80 p-4 opacity-80"><div className="font-semibold text-gray-800 mb-2">{activeItem.title}</div></div>) : (<div className="bg-white rounded-lg shadow-lg p-3 border-2 border-blue-500 opacity-80 w-72">{activeItem.title}</div>))}
      </DragOverlay>
      
      {/* Edit List Modal */}
      {editingList && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Edit List</h2>
            <form onSubmit={(e) => handleUpdateList(e, editingList.id)}>
              <input value={editingListTitle} onChange={(e) => setEditingListTitle(e.target.value)} className="border rounded px-3 py-2 w-full mb-4" autoFocus />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingList(null)} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete List Confirmation Modal */}
      {listToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2 text-red-600">Delete List</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the list "<strong>{listToDelete.title}</strong>"? 
              {listToDelete.cards?.length > 0 && ` This will also delete ${listToDelete.cards.length} card${listToDelete.cards.length > 1 ? 's' : ''}.`} This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setListToDelete(null)} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
              <button type="button" onClick={() => handleDeleteList(listToDelete.id)} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {assigningCard && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Assign User to "{assigningCard.title}"</h2>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {assigningCard.assignedTo && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(assigningCard.assignedTo.name || 'U')}&size=32&background=0D8ABC&color=fff`}
                        alt={assigningCard.assignedTo.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{assigningCard.assignedTo.name || 'Unnamed'}</p>
                        <p className="text-xs text-gray-600">{assigningCard.assignedTo.email}</p>
                      </div>
                    </div>
                    <button onClick={handleUnassignUser} className="text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              )}
              {users.filter(u => u.id !== assigningCard.assignedTo?.id).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleAssignUser(user.id)}
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
              <button onClick={() => setAssigningCard(null)} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
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
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Owner</span>
                        )}
                      </div>
                    </div>
                    {board?.ownerId !== member.id && board?.ownerId === currentUserId && (
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {board?.ownerId === currentUserId && (
              <>
                <h3 className="font-semibold mb-2">Add Members</h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {allUsers.filter(u => !boardMembers.some(m => m.id === u.id)).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">All users are already members</p>
                  ) : (
                    allUsers.filter(u => !boardMembers.some(m => m.id === u.id)).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAddMember(user.id)}
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
              <button onClick={() => setShowMembersModal(false)} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}