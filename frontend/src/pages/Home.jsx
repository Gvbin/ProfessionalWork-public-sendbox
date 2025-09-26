import Navbar from '../components/Navbar.jsx'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-900">Bienvenue sur Epitrello</h1>
        <p className="text-lg text-blue-700 mb-8 text-center max-w-xl">
          Gérez vos projets, collaborez avec votre équipe et organisez vos tâches visuellement.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 transition"
            onClick={() => navigate('/boards')}
          >
            Accéder à mes boards
          </button>
          <button
            className="bg-white text-blue-600 border-2 border-blue-600 rounded px-8 py-3 font-semibold hover:bg-blue-600 hover:text-white transition"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </button>
        </div>
      </main>
    </div>
  )
}