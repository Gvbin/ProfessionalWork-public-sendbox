import Navbar from '../components/Navbar.jsx'

export default function Boards() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Boards</h1>
        <p className="text-lg text-blue-700">This page is under development.</p>
      </div>
    </div>
  )
}