import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, LogIn, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com') + '/api';

export default function Login({ setUsername, setFamilyId }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      if (response.data.success) {
        setIsSuccess(true);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('family_id', response.data.family_id);
        localStorage.setItem('is_admin', response.data.is_admin);
        setUsername(response.data.username);
        setFamilyId(response.data.family_id);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Invalid credentials" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[80vh] bg-[#0a0a0b]">
      {isSuccess && (
        <div className="fixed top-10 bg-[#3b5d8f] text-white px-6 py-3 rounded-xl flex items-center gap-3 z-50 animate-pulse">
          <CheckCircle size={20} /> Welcome back! Redirecting...
        </div>
      )}
      <div className="bg-[#121214] w-full max-w-md rounded-2xl border border-white/5 p-8 flex flex-col items-center shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm mb-8">Login to your account</p>
        {errors.server && <p className="text-red-500 text-xs mb-4 font-bold uppercase">{errors.server}</p>}
        <form className="w-full space-y-4" onSubmit={handleLogin} autoComplete="off">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Username"
              autoComplete="off"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1c] border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#3b5d8f]"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-12 pr-12 py-3.5 bg-[#1a1a1c] border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#3b5d8f]"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button className="w-full bg-[#3b5d8f] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all mt-4">
            <LogIn size={20} /> Login
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          New here? <Link to="/signup" className="text-[#3b5d8f] font-bold ml-1 hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}