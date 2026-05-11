import { Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Footer from './components/Footer';

function App() {
  return (
    /* flex-col and min-h-screen ensures the footer stays at the very bottom */
    <div className="flex flex-col min-h-screen bg-[#0a0a0b]">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {/* Add Dashboard route here later */}
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
