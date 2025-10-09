import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:4000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data.");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setEditName(data.name || "");
      })
      .catch((err) => setError(err.message));
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:4000/auth/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
      setEditModalOpen(false);
    } else {
      setError("Failed to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:4000/auth/me", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      localStorage.removeItem("token");
      navigate("/");
    } else {
      setError("Failed to delete account.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Cover + avatar centré */}
        {user && (
          <div className="relative h-48 rounded-xl overflow-hidden shadow-md">
            <img
              src="https://source.unsplash.com/1600x400/?abstract,technology"
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name || "User"
                )}&size=120&background=0D8ABC&color=fff`}
                alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <h1 className="mt-3 text-2xl font-bold text-gray-800">
                {user.name}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        )}

        <div className="mt-24 bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="text-red-500 font-semibold mb-4">{error}</div>
          )}
          {user ? (
            <>
              {/* Infos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                  <h3 className="text-sm text-gray-500">Full Name</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {user.name || "Not provided"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                  <h3 className="text-sm text-gray-500">Email</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {user.email}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                  <h3 className="text-sm text-gray-500">Role</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {user.role || "Member"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                  <h3 className="text-sm text-gray-500">Joined</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/"); // Rediriger vers l'accueil
                  }}
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow transition"
                >
                  Logout
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition"
                >
                  Delete Account
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Loading profile...</p>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Delete Account
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded bg-red-600 text-white shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
