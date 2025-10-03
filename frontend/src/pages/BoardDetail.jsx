import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function BoardDetail() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch board details
    fetch(`http://localhost:4000/boards/${boardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load board data.');
        return res.json();
      })
      .then(setBoard)
      .catch(err => setError(err.message));
  }, [boardId, navigate]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Navbar />
      <header className="px-6 py-4 bg-white/50 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-800">{board ? board.title : 'Loading...'}</h1>
      </header>
      <main className="flex-1 p-4">
        <p className="text-gray-600">La gestion des listes et des cartes sera implémentée ici.</p>
      </main>
    </div>
  );
}