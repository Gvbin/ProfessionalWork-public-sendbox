import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '../styles/index.css'
import App from './App.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Boards from './pages/Boards.jsx'
import BoardDetail from './pages/BoardDetail.jsx' // Import the new page
import Help from './pages/Help.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<App />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/boards/:boardId" element={<BoardDetail />} /> {/* Add this route */}
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)