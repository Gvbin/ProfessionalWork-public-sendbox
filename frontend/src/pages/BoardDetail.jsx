import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, X } from 'lucide-react';

import Navbar from '../components/Navbar';
import { BoardHeader } from '../components/board/BoardHeader';
import { SortableCard } from '../components/board/SortableCard';
import { SortableList } from '../components/board/SortableList';
import { AddListButton } from '../components/board/AddListButton';
import { EditListModal } from '../components/modals/EditListModal';
import { DeleteListModal } from '../components/modals/DeleteListModal';
import { EditCardModal } from '../components/modals/EditCardModal';
import { AssignUserModal } from '../components/modals/AssignUserModal';
import { MembersModal } from '../components/modals/MembersModal';
import { CardDetailModal } from '../components/modals/CardDetailModal';

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
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [editingCardInList, setEditingCardInList] = useState(null);
  const [newCardTitles, setNewCardTitles] = useState({});
  const [editingCard, setEditingCard] = useState(null);
  const [editingList, setEditingList] = useState(null);
  const [listToDelete, setListToDelete] = useState(null);
  const [assigningCard, setAssigningCard] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [cardDetailOpen, setCardDetailOpen] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { 
      navigate('/login'); 
      return; 
    }

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
      
      const members = [];
      if (boardData.owner) members.push(boardData.owner);
      if (boardData.members && Array.isArray(boardData.members)) {
        boardData.members.forEach(m => {
          if (m.user && !members.some(member => member.id === m.user.id)) {
            members.push(m.user);
          }
        });
      }
      setBoardMembers(members);
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [boardId, navigate]);

  const handleAddList = async (title) => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, boardId })
    });
    if (res.ok) {
      const newList = await res.json();
      setLists([...lists, { ...newList, cards: [] }]);
    } else {
      setError('Failed to create list.');
    }
  };

  const handleUpdateList = async (listId, title) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/lists/${listId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title })
    });
    if (res.ok) {
      const updatedList = await res.json();
      setLists(lists.map((l) => (l.id === listId ? { ...l, title: updatedList.title } : l)));
      setEditingList(null);
    } else {
      setError('Failed to update list.');
    }
  };

  const handleDeleteList = async (listId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/lists/${listId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setLists(lists.filter((l) => l.id !== listId));
      setListToDelete(null);
    } else {
      setError('Failed to delete list.');
    }
  };

  const handleAddCard = async (listId) => {
    const title = newCardTitles[listId];
    if (!title || !title.trim()) return;
    
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, listId })
    });
    if (res.ok) {
      const newCard = await res.json();
      setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l)));
      setNewCardTitles((prev) => ({ ...prev, [listId]: '' }));
      setEditingCardInList(null);
    } else {
      setError('Failed to add card.');
    }
  };

  const handleUpdateCard = async (cardId, title) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title })
    });
    if (res.ok) {
      const updatedCard = await res.json();
      setLists((prev) => prev.map((l) => ({ ...l, cards: l.cards.map((c) => (c.id === cardId ? updatedCard : c)) })));
      setEditingCard(null);
    } else {
      setError('Failed to update card.');
    }
  };

  const handleDeleteCard = async (cardId, listId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/cards/${cardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l)));
    } else {
      setError('Failed to delete card.');
    }
  };

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
    } else {
      setError('Failed to assign user.');
    }
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
    } else {
      setError('Failed to unassign user.');
    }
  };

  // Handlers - Members
  const handleAddMember = async (userId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/boards/${boardId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId })
    });
    if (res.ok) {
      const member = await res.json();
      if (!boardMembers.some(m => m.id === member.user.id)) {
        setBoardMembers([...boardMembers, member.user]);
      }
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
      const usersRes = await fetch(`http://localhost:4000/users?boardId=${boardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) setUsers(await usersRes.json());
    } else {
      setError('Failed to remove member.');
    }
  };

  const persistReorder = async (newLists) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:4000/boards/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lists: newLists })
    });
  };

  function handleDragStart(event) {
    const { active } = event;
    const isList = typeof active.id === 'string' && active.id.startsWith('list-');
    if (isList) {
      const listId = parseInt(active.id.replace('list-', ''));
      setActiveItem(lists.find((l) => l.id === listId));
    } else {
      for (const list of lists) {
        const found = list.cards.find((c) => c.id === active.id);
        if (found) {
          setActiveItem(found);
          break;
        }
      }
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) {
      setActiveItem(null);
      return;
    }

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
        <BoardHeader 
          board={board} 
          boardMembers={boardMembers} 
          onShowMembers={() => setShowMembersModal(true)} 
        />
        
        <main className="flex-1 p-4 flex gap-4 overflow-x-auto">
          <SortableContext items={lists.map((l) => `list-${l.id}`)} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <SortableList 
                key={list.id} 
                list={list} 
                onEdit={setEditingList} 
                onDelete={setListToDelete}
              >
                {list.cards.map((card) => (
                  <SortableCard 
                    key={card.id} 
                    card={card} 
                    onUpdate={setEditingCard} 
                    onDelete={handleDeleteCard} 
                    onAssign={setAssigningCard}
                    onOpenDetail={setCardDetailOpen}
                  />
                ))}
                
                <EditCardModal
                  card={editingCard}
                  listId={list.id}
                  lists={lists}
                  onSave={handleUpdateCard}
                  onClose={() => setEditingCard(null)}
                />
                
                <div className="pt-1">
                  {editingCardInList === list.id ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <textarea 
                        value={newCardTitles[list.id] || ''} 
                        onChange={(e) => setNewCardTitles((prev) => ({ ...prev, [list.id]: e.target.value }))} 
                        onKeyDown={(e) => { 
                          if (e.key === 'Enter' && !e.shiftKey) { 
                            e.preventDefault(); 
                            handleAddCard(list.id); 
                          } 
                        }} 
                        placeholder="Enter a title..." 
                        className="w-full border-gray-300 rounded-md p-2 text-sm resize-none" 
                        rows={2} 
                        autoFocus 
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => handleAddCard(list.id)} 
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700"
                        >
                          Add card
                        </button>
                        <button 
                          onClick={() => setEditingCardInList(null)} 
                          className="p-2 text-gray-500 hover:bg-gray-200 rounded"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button 
                      onClick={() => setEditingCardInList(list.id)} 
                      className="w-full flex items-center gap-2 text-gray-600 p-2 rounded-lg hover:bg-gray-300/60 transition font-medium"
                    >
                      <Plus size={16} /> Add a card
                    </button>
                  )}
                </div>
              </SortableList>
            ))}
          </SortableContext>
          
          <div className="w-80 flex-shrink-0">
            <AddListButton onAdd={handleAddList} />
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeItem && (
          activeItem.cards ? (
            <div className="bg-gray-200/70 rounded-xl shadow-md w-80 p-4 opacity-80">
              <div className="font-semibold text-gray-800 mb-2">{activeItem.title}</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-3 border-2 border-blue-500 opacity-80 w-72">
              {activeItem.title}
            </div>
          )
        )}
      </DragOverlay>

      {/* Modals */}
      {editingList && (
        <EditListModal 
          list={editingList} 
          onSave={handleUpdateList} 
          onClose={() => setEditingList(null)} 
        />
      )}

      {listToDelete && (
        <DeleteListModal 
          list={listToDelete} 
          onConfirm={handleDeleteList} 
          onClose={() => setListToDelete(null)} 
        />
      )}

      {assigningCard && (
        <AssignUserModal 
          card={assigningCard} 
          users={users} 
          onAssign={handleAssignUser} 
          onUnassign={handleUnassignUser} 
          onClose={() => setAssigningCard(null)} 
        />
      )}

      {showMembersModal && (
        <MembersModal 
          board={board} 
          boardMembers={boardMembers} 
          allUsers={allUsers} 
          currentUserId={currentUserId} 
          onAddMember={handleAddMember} 
          onRemoveMember={handleRemoveMember} 
          onClose={() => setShowMembersModal(false)} 
        />
      )}

      {cardDetailOpen && (
        <CardDetailModal
          card={cardDetailOpen}
          onClose={() => setCardDetailOpen(null)}
          onUpdate={(updatedCard) => {
            setLists((prev) => 
              prev.map((l) => ({
                ...l,
                cards: l.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c))
              }))
            );
            setCardDetailOpen(updatedCard);
          }}
        />
      )}
    </DndContext>
  );
}