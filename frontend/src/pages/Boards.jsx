import Navbar from "../components/Navbar.jsx";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("http://localhost:4000/boards", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load boards. Please log in again.");
        return res.json();
      })
      .then(setBoards)
      .catch((err) => setError(err.message));
  }, [navigate]);


  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:4000/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const newBoard = await res.json();
      setBoards([...boards, newBoard]);
      setNewTitle("");
      setCreateModalOpen(false);
    } else {
      setError("Error creating board.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:4000/boards/${boardToEdit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const updatedBoard = await res.json();
      setBoards(boards.map((b) => (b.id === boardToEdit.id ? updatedBoard : b)));
      setNewTitle("");
      setEditModalOpen(false);
    } else {
      setError("Error updating board.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:4000/boards/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setBoards(boards.filter((b) => b.id !== id));
    } else {
      setError("Error deleting board.");
    }
  };


  const openEditModal = (board, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardToEdit(board);
    setNewTitle(board.title);
    setEditModalOpen(true);
  };

  const openDeleteConfirm = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this board?")) {
      handleDelete(id);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Workspace</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {boards.map((board) => (
            <Link
              to={`/boards/${board.id}`}
              key={board.id}
              className="relative group bg-blue-600 text-white rounded-lg shadow-md hover:shadow-xl h-28 p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
            >
              <span className="font-bold text-lg">{board.title}</span>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => openEditModal(board, e)} className="text-white hover:text-gray-200">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={(e) => openDeleteConfirm(board.id, e)}
                  className="text-white hover:text-gray-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Link>
          ))}
          <div
            onClick={() => setCreateModalOpen(true)}
            className="flex flex-col items-center justify-center bg-gray-200 rounded-lg h-28 cursor-pointer hover:bg-gray-300 transition"
          >
            <Plus className="text-gray-700 mb-2" size={24} />
            <span className="text-sm text-gray-800">Create new board</span>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">New Board</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Board Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Board Modal */}
      {isEditModalOpen && boardToEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Edit Board</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Board Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
