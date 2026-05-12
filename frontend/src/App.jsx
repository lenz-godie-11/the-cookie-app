import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import PrivateChat from './pages/PrivateChat';
import Footer from './components/Footer';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0b]">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setUsername={setUsername} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat username={username} />} />
          <Route path="/private-chat" element={<PrivateChat username={username} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;