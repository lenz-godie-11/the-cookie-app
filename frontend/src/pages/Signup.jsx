import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, UserPlus, CheckCircle, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com') + '/api';

const validatePassword = (password) => {
  const rules = [
    { test: password.length >= 8, message: 'Angalau herufi 8' },
    { test: /[A-Z]/.test(password), message: 'Herufi kubwa moja (A-Z)' },
    { test: /[a-z]/.test(password), message: 'Herufi ndogo moja (a-z)' },
    { test: /[0-9]/.test(password), message: 'Nambari moja (0-9)' },
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), message: 'Symbol moja (!@#$%^&*)' },
    { test: !/\s/.test(password), message: 'Bila spaces' },
  ];
  return rules;
};

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  const rules = validatePassword(formData.password);
  const isPasswordValid = rules.every(r => r.test);

  const handleSignup = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isPasswordValid) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Registration failed" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[80vh] bg-[#0a0a0b]">
      {isSuccess && (
        <div className="fixed top-10 bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle size={20} /> Account created! Redirecting...
        </div>
      )}

      <div className="bg-[#121214] w-full max-w-md rounded-2xl border border-white/5 p-8 flex flex-col items-center shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm mb-8">Enter details to register</p>

        {errors.server && <p className="text-red-500 text-xs mb-4 font-bold uppercase">{errors.server}</p>}

        <form className="w-full space-y-4" onSubmit={handleSignup} autoComplete="off">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Username"
              autoComplete="off"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1c] border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#3b5d8f]"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setTouched(true); }}
              className="w-full pl-12 pr-12 py-3.5 bg-[#1a1a1c] border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#3b5d8f]"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {touched && formData.password.length > 0 && (
            <div className="bg-[#1a1a1c] border border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-slate-400 text-xs font-bold mb-2">Password lazima iwe na:</p>
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  {rule.test
                    ? <CheckCircle size={14} className="text-green-400" />
                    : <X size={14} className="text-red-400" />
                  }
                  <span className={`text-xs ${rule.test ? 'text-green-400' : 'text-red-400'}`}>
                    {rule.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            disabled={touched && !isPasswordValid}
            className="w-full bg-[#3b5d8f] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus size={20} /> Sign Up
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-[#3b5d8f] font-bold ml-1 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}