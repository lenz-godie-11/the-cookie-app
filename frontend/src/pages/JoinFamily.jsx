import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle,
  X,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://the-cookie-app.onrender.com") +
  "/api";

const validatePassword = (password) => {
  const rules = [
    { test: password.length >= 8, message: "Atleast 8 characters" },
    { test: /[A-Z]/.test(password), message: "Uppercase Letter (A-Z)" },
    { test: /[a-z]/.test(password), message: "Lowercase Letter (a-z)" },
    { test: /[0-9]/.test(password), message: "Number (0-9)" },
    {
      test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      message: "Symbol moja (!@#$%^&*)",
    },
    { test: !/\s/.test(password), message: "No spaces Allowed" },
  ];
  return rules;
};

export default function JoinFamily({ theme = "dark" }) {
  const { family_id } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  const isDark = theme === "dark";
  const rules = validatePassword(formData.password);
  const isPasswordValid = rules.every((r) => r.test);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/family/join/${family_id}`)
      .then((res) => setFamily(res.data))
      .catch(() => setNotFound(true));
  }, [family_id]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isPasswordValid) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/family/join/${family_id}`,
        formData,
      );
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setErrors({
        server: err.response?.data?.message || "Failed to join family",
      });
    }
  };

  if (notFound) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${isDark ? "bg-[#0a0a0b]" : "bg-slate-50"}`}
      >
        <div
          className={`border rounded-2xl p-8 text-center ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200 shadow-lg"}`}
        >
          <p className="text-red-500 text-xl font-bold">Invalid invite link</p>
          <p
            className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm mt-2`}
          >
            This family does not exist
          </p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${isDark ? "bg-[#0a0a0b]" : "bg-slate-50"}`}
      >
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 min-h-screen transition-colors duration-200 ${isDark ? "bg-[#0a0a0b]" : "bg-slate-50"}`}
    >
      {isSuccess && (
        <div className="fixed top-10 bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle size={20} /> Joined! Redirecting to login...
        </div>
      )}
      <div
        className={`w-full max-w-md rounded-2xl border p-8 flex flex-col items-center shadow-2xl transition-all duration-200 ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200"}`}
      >
        <div
          className={`border rounded-xl px-4 py-2 mb-6 ${isDark ? "bg-[#1a1a1c] border-white/10" : "bg-slate-100 border-slate-200"}`}
        >
          <p
            className={`text-xs text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            You have been invited to join a family
          </p>
        </div>
        <h2
          className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}
        >
          Create Account
        </h2>
        <p
          className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm mb-8`}
        >
          Enter details to join this family
        </p>

        {errors.server && (
          <p className="text-red-500 text-xs mb-4 font-bold uppercase">
            {errors.server}
          </p>
        )}

        <form
          className="w-full space-y-4"
          onSubmit={handleJoin}
          autoComplete="off"
        >
          <div className="relative">
            <User
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              size={18}
            />
            <input
              type="text"
              placeholder="Username"
              autoComplete="off"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className={`w-full pl-12 pr-4 py-3.5 border rounded-xl outline-none focus:ring-1 focus:ring-[#3b5d8f] transition-colors ${
                isDark
                  ? "bg-[#1a1a1c] border-white/10 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>
          <div className="relative">
            <Lock
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              size={18}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setTouched(true);
              }}
              className={`w-full pl-12 pr-12 py-3.5 border rounded-xl outline-none focus:ring-1 focus:ring-[#3b5d8f] transition-colors ${
                isDark
                  ? "bg-[#1a1a1c] border-white/10 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {touched && formData.password.length > 0 && (
            <div
              className={`border rounded-xl p-4 space-y-2 ${isDark ? "bg-[#1a1a1c] border-white/10" : "bg-slate-50 border-slate-200"}`}
            >
              <p
                className={`text-xs font-bold mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Password lazima iwe na:
              </p>
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  {rule.test ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <X size={14} className="text-red-500" />
                  )}
                  <span
                    className={`text-xs ${rule.test ? "text-green-500" : "text-red-500"}`}
                  >
                    {rule.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            disabled={touched && !isPasswordValid}
            className="w-full bg-[#3b5d8f] hover:bg-[#2d4a73] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus size={20} /> Join Family
          </button>
        </form>
      </div>
    </div>
  );
}
