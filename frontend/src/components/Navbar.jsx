import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
      fetch('http://localhost:4000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) {
            localStorage.removeItem('token');
            setLoggedIn(false);
            setUser(null);
            throw new Error('Session invalide');
          }
          return res.json();
        })
        .then(data => setUser(data))
        .catch(() => { /* Gérer l'erreur silencieusement */ });
    } else {
      setLoggedIn(false);
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const navItems = [
    { name: 'Home', to: '/' },
    { name: 'Workspace', to: '/boards' },
    { name: 'Get Started', to: '/signup', disabled: true },
    { name: 'Help', to: '/help' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    setLoggedIn(false)
    setUser(null);
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/vite.svg"
            alt="Epitrello Logo"
            className="h-9 group-hover:scale-110 transition-transform duration-300"
          />
          <span className="text-2xl font-extrabold text-white tracking-tight group-hover:text-gray-100 transition">
            Epitrello
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-8">
            {navItems.map(item =>
              item.disabled ? (
                <span
                  key={item.name}
                  className={`font-medium px-3 py-1.5 rounded-lg transition duration-300 ${
                    pathname === item.to
                      ? 'text-white bg-white/20 shadow-inner'
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  } cursor-default`}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`font-medium px-3 py-1.5 rounded-lg transition duration-300 ${
                    pathname === item.to
                      ? 'text-white bg-white/20 shadow-inner'
                      : 'text-gray-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Login / Account */}
        <div className="flex items-center">
          {!loggedIn ? (
            <button
              className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold shadow hover:shadow-lg hover:scale-105 transform transition duration-300"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                className="bg-white/20 text-white px-5 py-2 rounded-lg font-semibold hover:bg-white/30 transition flex items-center gap-2"
                onClick={() => setMenuOpen(v => !v)}
              >
                Account
                <svg
                  className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown amélioré */}
              {menuOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 rounded-2xl bg-white/80 backdrop-blur-md 
                             shadow-xl border border-white/40 overflow-hidden animate-slideDownFade"
                >
                  <div className="px-5 py-4 border-b border-white/30">
                    <p className="font-bold text-gray-800 truncate">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 font-semibold hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 font-semibold 
                               hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
