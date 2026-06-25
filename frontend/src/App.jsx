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
import Navbar from "./components/Navbar";
import Discover from "./components/Discover";
import LandingPage from "./pages/LandingPage";

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
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  const location = useLocation();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const hideNav =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/family/join");

  const isDark = theme === "dark";

  return (
    <div
      className={`flex flex-col h-screen w-full overflow-x-hidden transition-colors duration-200 ${isDark ? "bg-[#0a0a0b]" : "bg-slate-50"}`}
    >
      {!hideNav && <Navbar theme={theme} setTheme={handleThemeChange} />}
      <main className="flex-1 w-full mx-auto overflow-y-auto">
        <Routes>
          <Route path="/" element={<LandingPage theme={theme} />} />
          <Route path="/signup" element={<Signup theme={theme} />} />
          <Route
            path="/login"
            element={
              <Login
                theme={theme}
                setUsername={setUsername}
                setFamilyId={setFamilyId}
              />
            }
          />
          <Route
            path="/family/join/:family_id"
            element={<JoinFamily theme={theme} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard theme={theme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover
                  username={username}
                  familyId={familyId}
                  theme={theme}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat username={username} familyId={familyId} theme={theme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/private-chat"
            element={
              <ProtectedRoute>
                <PrivateChat
                  username={username}
                  familyId={familyId}
                  theme={theme}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications theme={theme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings
                  theme={theme}
                  setTheme={handleThemeChange}
                  setUsername={setUsername}
                  setFamilyId={setFamilyId}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
