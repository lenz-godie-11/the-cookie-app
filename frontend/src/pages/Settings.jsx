import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Bell,
  Palette,
  LogOut,
  Trash2,
  UserMinus,
  Eye,
  EyeOff,
  CheckCircle,
  X,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://the-cookie-app.onrender.com") +
  "/api";

export default function Settings({
  theme,
  setTheme,
  setUsername,
  setFamilyId,
}) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const family_id = localStorage.getItem("family_id");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  const [activeSection, setActiveSection] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [accountForm, setAccountForm] = useState({
    newUsername: "",
    currentPassword: "",
    newPassword: "",
  });

  const [notifSettings, setNotifSettings] = useState({
    consume: true,
    stock: true,
    member: true,
    message: true,
  });

  const isDark = theme === "dark";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("notifSettings");
    if (saved) setNotifSettings(JSON.parse(saved));
  }, []);

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    showToast(`Switched to ${selectedTheme} mode`);
  };

  const handleChangeUsername = async () => {
    if (!accountForm.newUsername.trim()) {
      return showToast("Please enter a new username", "error");
    }
    if (accountForm.newUsername.trim().length < 3) {
      return showToast("Username must be at least 3 characters", "error");
    }
    try {
      await axios.post(`${API_BASE_URL}/auth/change-username`, {
        username,
        newUsername: accountForm.newUsername.trim(),
        family_id,
      });
      localStorage.setItem("username", accountForm.newUsername.trim());
      setUsername(accountForm.newUsername.trim());
      setAccountForm((prev) => ({ ...prev, newUsername: "" }));
      showToast("Username updated successfully");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update username",
        "error",
      );
    }
  };

  const handleChangePassword = async () => {
    if (!accountForm.currentPassword || !accountForm.newPassword) {
      return showToast("Please fill in both password fields", "error");
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[^\s]{8,}$/;
    if (!passwordRegex.test(accountForm.newPassword)) {
      return showToast("New password does not meet requirements", "error");
    }
    try {
      await axios.post(`${API_BASE_URL}/auth/change-password`, {
        username,
        currentPassword: accountForm.currentPassword,
        newPassword: accountForm.newPassword,
      });
      setAccountForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
      showToast("Password updated successfully");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update password",
        "error",
      );
    }
  };

  const handleNotifToggle = (type) => {
    const updated = { ...notifSettings, [type]: !notifSettings[type] };
    setNotifSettings(updated);
    localStorage.setItem("notifSettings", JSON.stringify(updated));
    showToast(
      `${type} notifications ${updated[type] ? "enabled" : "disabled"}`,
    );
  };

  const handleLeaveFamily = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/leave-family`, {
        username,
        family_id,
      });
      localStorage.clear();
      setUsername("");
      setFamilyId("");
      navigate("/login");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to leave family",
        "error",
      );
    }
  };

  const handleDeleteFamily = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/delete-family`, {
        data: { username, family_id },
      });
      localStorage.clear();
      setUsername("");
      setFamilyId("");
      navigate("/login");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete family",
        "error",
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsername("");
    setFamilyId("");
    navigate("/login");
  };

  const sections = [
    { id: "account", label: "Account", icon: <User size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
    { id: "family", label: "Family", icon: <UserMinus size={16} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-[80vh]">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.type === "error" ? <X size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      <h1
        className={`text-2xl font-bold mb-6 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}
      >
        Settings
      </h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <div
            className={`border rounded-2xl p-2 space-y-1 shadow-sm transition-all ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200"}`}
          >
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-[#3b5d8f] text-white"
                    : isDark
                      ? "text-slate-400 hover:text-white hover:bg-[#1a1a1c]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {section.icon} {section.label}
              </button>
            ))}
            <div
              className={`border-t mt-2 pt-2 ${isDark ? "border-white/5" : "border-slate-200"}`}
            >
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 transition-all ${isDark ? "hover:text-red-300 hover:bg-[#1a1a1c]" : "hover:text-red-600 hover:bg-slate-100"}`}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Account Section */}
          {activeSection === "account" && (
            <div className="space-y-4">
              <div
                className={`border rounded-2xl p-6 shadow-sm transition-all ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200"}`}
              >
                <h2
                  className={`font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  <User size={16} className="text-[#3b5d8f]" /> Change Username
                </h2>
                <p className="text-slate-500 text-xs mb-4">
                  Current username:{" "}
                  <span
                    className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}
                  >
                    {username}
                  </span>
                </p>
                <input
                  type="text"
                  placeholder="New username"
                  value={accountForm.newUsername}
                  onChange={(e) =>
                    setAccountForm((prev) => ({
                      ...prev,
                      newUsername: e.target.value,
                    }))
                  }
                  className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-[#3b5d8f] text-sm mb-3 ${
                    isDark
                      ? "bg-[#1a1a1c] border-white/10 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
                <button
                  onClick={handleChangeUsername}
                  className="bg-[#3b5d8f] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2e4a72] transition-all"
                >
                  Update Username
                </button>
              </div>

              <div
                className={`border rounded-2xl p-6 shadow-sm transition-all ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200"}`}
              >
                <h2
                  className={`font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  <Lock size={16} className="text-[#3b5d8f]" /> Change Password
                </h2>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Current password"
                      value={accountForm.currentPassword}
                      onChange={(e) =>
                        setAccountForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-[#3b5d8f] text-sm pr-12 ${
                        isDark
                          ? "bg-[#1a1a1c] border-white/10 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      value={accountForm.newPassword}
                      onChange={(e) =>
                        setAccountForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-[#3b5d8f] text-sm pr-12 ${
                        isDark
                          ? "bg-[#1a1a1c] border-white/10 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="bg-[#3b5d8f] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2e4a72] transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div
              className={`border rounded-2xl p-6 shadow-sm transition-all ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200"}`}
            >
              <h2
                className={`font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
              >
                <Bell size={16} className="text-[#3b5d8f]" /> Notification
                Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    key: "consume",
                    label: "Item consumed",
                    desc: "When a family member consumes an item",
                  },
                  {
                    key: "stock",
                    label: "Low stock alerts",
                    desc: "When an item is running low or out of stock",
                  },
                  {
                    key: "member",
                    label: "New member",
                    desc: "When someone joins your family",
                  },
                  {
                    key: "message",
                    label: "New messages",
                    desc: "When you receive a private or group message",
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? "border-white/5" : "border-slate-100"}`}
                  >
                    <div>
                      <p
                        className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        {label}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => handleNotifToggle(key)}
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        notifSettings[key]
                          ? "bg-[#3b5d8f]"
                          : isDark
                            ? "bg-[#1a1a1c] border border-white/10"
                            : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                          notifSettings[key] ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <div
              className={`border rounded-2xl p-6 shadow-sm transition-all ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200"}`}
            >
              <h2
                className={`font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
              >
                <Palette size={16} className="text-[#3b5d8f]" /> Appearance
              </h2>
              <p
                className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Choose your preferred theme
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                    isDark
                      ? "border-[#3b5d8f] bg-[#3b5d8f]/20 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🌙 Dark Mode
                </button>
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                    !isDark
                      ? "border-[#3b5d8f] bg-[#3b5d8f]/10 text-[#3b5d8f] font-bold"
                      : "border-white/10 bg-[#1a1a1c] text-slate-400 hover:text-white"
                  }`}
                >
                  ☀️ Light Mode
                </button>
              </div>
            </div>
          )}

          {/* Family Section */}
          {activeSection === "family" && (
            <div className="space-y-4">
              {!isAdmin && (
                <div
                  className={`border rounded-2xl p-6 shadow-sm transition-all ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200"}`}
                >
                  <h2
                    className={`font-bold mb-2 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    <UserMinus size={16} className="text-yellow-400" /> Leave
                    Family
                  </h2>
                  <p
                    className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    You will lose access to all family data and need a new
                    invite link to rejoin.
                  </p>
                  {!confirmLeave ? (
                    <button
                      onClick={() => setConfirmLeave(true)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-700 transition-all"
                    >
                      Leave Family
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleLeaveFamily}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-700 transition-all"
                      >
                        Yes, Leave
                      </button>
                      <button
                        onClick={() => setConfirmLeave(false)}
                        className={`border px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          isDark
                            ? "bg-[#1a1a1c] border-white/10 text-slate-300 hover:bg-[#252528]"
                            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isAdmin && (
                <div
                  className={`border rounded-2xl p-6 shadow-sm transition-all ${isDark ? "bg-[#121214] border-red-500/20" : "bg-white border-red-200"}`}
                >
                  <h2
                    className={`font-bold mb-2 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    <Trash2 size={16} className="text-red-400" /> Delete Family
                  </h2>
                  <p
                    className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    This will permanently delete the family and all its data
                    including products, messages and members. This cannot be
                    undone.
                  </p>
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all"
                    >
                      Delete Family
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteFamily}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all"
                      >
                        Yes, Delete Everything
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className={`border px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          isDark
                            ? "bg-[#1a1a1c] border-white/10 text-slate-300 hover:bg-[#252528]"
                            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
