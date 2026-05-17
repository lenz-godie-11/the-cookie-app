import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import PrivateChat from './pages/PrivateChat';
import JoinFamily from './pages/JoinFamily';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [familyId, setFamilyId] = useState(localStorage.getItem('family_id') || '');
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/family/join');

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0b]">
      {!hideNav && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setUsername={setUsername} setFamilyId={setFamilyId} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat username={username} familyId={familyId} />} />
          <Route path="/private-chat" element={<PrivateChat username={username} familyId={familyId} />} />
          <Route path="/family/join/:family_id" element={<JoinFamily />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;