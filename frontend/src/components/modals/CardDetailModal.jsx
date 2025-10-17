import { useState, useEffect } from 'react';
import { X, Tag, MessageSquare, Trash2, Edit2, Check } from 'lucide-react';

const LABEL_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
];

export function CardDetailModal({ card, onClose, onUpdate }) {
  const [labels, setLabels] = useState(card?.labels || []);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [labelName, setLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].value);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card?.title || '');

  useEffect(() => {
    if (!card) return;

    const token = localStorage.getItem('token');
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.userId);
    } catch (err) {
      console.error('Failed to parse token', err);
    }

    fetch(`http://localhost:4000/comments?cardId=${card.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setComments)
      .catch(err => console.error('Failed to load comments', err));
  }, [card]);

  useEffect(() => {
    if (card) {
      setLabels(card.labels || []);
      setEditedTitle(card.title);
    }
  }, [card]);

  if (!card) return null;

  const handleUpdateTitle = async () => {
    if (!editedTitle.trim() || editedTitle === card.title) {
      setIsEditingTitle(false);
      setEditedTitle(card.title);
      return;
    }

    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/cards/${card.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: editedTitle,
        assignedToId: card.assignedToId
      })
    });

    if (res.ok) {
      const updatedCard = await res.json();
      onUpdate(updatedCard);
      setIsEditingTitle(false);
    } else {
      console.error('Failed to update card title');
      setEditedTitle(card.title);
      setIsEditingTitle(false);
    }
  };

  const handleAddLabel = async () => {
    if (!labelName.trim()) return;

    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/labels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: labelName,
        color: selectedColor,
        cardId: card.id
      })
    });

    if (res.ok) {
      const newLabel = await res.json();
      const updatedLabels = [...labels, newLabel];
      setLabels(updatedLabels);
      onUpdate({ ...card, labels: updatedLabels });
      setLabelName('');
      setShowLabelPicker(false);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/labels/${labelId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const updatedLabels = labels.filter(l => l.id !== labelId);
      setLabels(updatedLabels);
      onUpdate({ ...card, labels: updatedLabels });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        content: newComment,
        cardId: card.id
      })
    });

    if (res.ok) {
      const comment = await res.json();
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:4000/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec édition du titre */}
        <div className="flex justify-between items-start mb-4">
          {isEditingTitle ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateTitle();
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setEditedTitle(card.title);
                  }
                }}
                className="flex-1 text-2xl font-bold text-gray-800 border-2 border-blue-500 rounded px-2 py-1 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleUpdateTitle}
                className="p-2 hover:bg-green-100 text-green-600 rounded"
                title="Save"
              >
                <Check size={20} />
              </button>
              <button
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditedTitle(card.title);
                }}
                className="p-2 hover:bg-gray-200 rounded"
                title="Cancel"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-3 group">
              <h2 className="text-2xl font-bold text-gray-800">{card.title}</h2>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1.5 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                title="Edit title"
              >
                <Edit2 size={18} className="text-gray-600" />
              </button>
            </div>
          )}
          
          {!isEditingTitle && (
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded ml-2">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Labels */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-700">Labels</h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium group"
                style={{ backgroundColor: label.color }}
              >
                <span>{label.name}</span>
                <button
                  onClick={() => handleDeleteLabel(label.id)}
                  className="opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {!showLabelPicker ? (
            <button
              onClick={() => setShowLabelPicker(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add label
            </button>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg">
              <input
                type="text"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
                placeholder="Label name"
                className="border rounded px-3 py-2 w-full mb-2"
                autoFocus
              />
              <div className="flex gap-2 mb-3">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-full ${
                      selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddLabel}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowLabelPicker(false)}
                  className="bg-gray-200 px-4 py-1.5 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-700">Comments</h3>
          </div>

          <div className="space-y-3 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        comment.user.name || 'U'
                      )}&size=24&background=0D8ABC&color=fff`}
                      alt={comment.user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium text-sm text-gray-800">
                      {comment.user.name || comment.user.email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {comment.userId === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:bg-red-100 p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 text-sm ml-8">{comment.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 self-end"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}