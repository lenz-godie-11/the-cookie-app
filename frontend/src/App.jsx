import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import PrivateChat from "./pages/PrivateChat";
import JoinFamily from "./pages/JoinFamily";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const ProtectedRoute = ({ children }) => {
  const username = localStorage.getItem("username");
  const family_id = localStorage.getItem("family_id");
  if (!username || !family_id) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );
  const [familyId, setFamilyId] = useState(
    localStorage.getItem("family_id") || "",
  );
  const location = useLocation();

  const hideNav =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/family/join");

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0b] w-full overflow-x-hidden">
      {!hideNav && <Navbar />}
      <main className="flex-1 w-full mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/login"
            element={
              <Login setUsername={setUsername} setFamilyId={setFamilyId} />
            }
          />
          <Route path="/family/join/:family_id" element={<JoinFamily />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat username={username} familyId={familyId} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/private-chat"
            element={
              <ProtectedRoute>
                <PrivateChat username={username} familyId={familyId} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings setUsername={setUsername} setFamilyId={setFamilyId} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
