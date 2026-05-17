import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com') + '/api';

export default function JoinFamily() {
  const { family_id } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/family/join/${family_id}`)
      .then(res => setFamily(res.data.family))
      .catch(() => setNotFound(true));
  }, [family_id]);

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/family/join/${family_id}`, formData);
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setErrors({ server: err.response?.data?.message || "Failed to join family" });
    }
  };

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0b]">
        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 text-center">
          <p className="text-red-400 text-xl font-bold"> Invalid invite link</p>
          <p className="text-slate-400 text-sm mt-2">This family does not exist</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0b]">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-[#0a0a0b]">
      {isSuccess && (
        <div className="fixed top-10 bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle size={20} /> Joined! Redirecting to login...
        </div>
      )}
      <div className="bg-[#121214] w-full max-w-md rounded-2xl border border-white/5 p-8 flex flex-col items-center shadow-2xl">
        <div className="bg-[#1a1a1c] border border-white/10 rounded-xl px-4 py-2 mb-6">
          <p className="text-slate-400 text-xs text-center">You're joining</p>
          <p className="text-[#3b5d8f] font-bold text-center">{family.owner}'s Family</p>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-slate-400 text-sm mb-8">Enter details to join this family</p>

        {errors.server && <p className="text-red-500 text-xs mb-4 font-bold uppercase">{errors.server}</p>}

        <form className="w-full space-y-4" onSubmit={handleJoin} autoComplete="off">
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
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pl-12 pr-12 py-3.5 bg-[#1a1a1c] border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#3b5d8f]"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button className="w-full bg-[#3b5d8f] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all mt-4">
            <UserPlus size={20} /> Join Family
          </button>
        </form>
      </div>
    </div>
  );
}