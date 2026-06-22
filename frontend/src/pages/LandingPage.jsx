import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Globe, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

const translations = {
  en: {
    brand: "The Cookie App",
    heroTitle: "Keep Your Family's Snacks & Supplies in Perfect Balance",
    heroSubtitle: "Track consumption, manage inventory, send low-stock alerts, and stay connected with your household members in real time.",
    getStarted: "Get Started",
    login: "Log In",
    signup: "Sign Up",
    alertMessage: "Please Log In or Sign Up to access your family's dashboard!",
  },
  sw: {
    brand: "The Cookie App",
    heroTitle: "Weka Vyakula na Mahitaji ya Familia Yako Kwenye Uwiano Sawa",
    heroSubtitle: "Fuatilia jinsi bidhaa zinavyotumika, dhibiti stoo, tuma taarifa za bidhaa zinazoisha, na baki karibu na familia yako kwa wakati halisi.",
    getStarted: "Anza Sasa",
    login: "Ingia",
    signup: "Jisajili",
    alertMessage: "Tafadhali Ingia au Jisajili kwanza ili uweze kufikia dashibodi ya familia yako!",
  }
};

export default function LandingPage({ theme = "dark" }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  // This state controls the language switcher ('en' or 'sw')
  const [lang, setLang] = useState("en");

  const isDark = theme === "dark";
  const t = translations[lang]; // Pulls either English or Swahili strings dynamically

  const handleProceed = () => {
    const username = localStorage.getItem("username");
    if (!username) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0a0b] text-white" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Security Alert Popup */}
      {showAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-amber-600 text-white font-medium text-sm border border-amber-500 shadow-xl max-w-md w-[90%] animate-bounce">
          <ShieldAlert size={20} className="shrink-0" />
          <span>{t.alertMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <nav className={`border-b sticky top-0 z-40 backdrop-blur-md ${isDark ? "bg-[#0a0a0b]/80 border-white/5" : "bg-white/80 border-slate-200"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black text-blue-400">{t.brand}</span>

          {/* Desktop Nav Toggle Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1 border rounded-xl p-1 bg-black/5 dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs font-semibold">
              <button 
                onClick={() => setLang("en")} 
                className={`px-3 py-1.5 rounded-lg transition-all ${lang === "en" ? "bg-[#3b5d8f] text-white shadow-sm" : "text-slate-400"}`}
              >
                English
              </button>
              <button 
                onClick={() => setLang("sw")} 
                className={`px-3 py-1.5 rounded-lg transition-all ${lang === "sw" ? "bg-[#3b5d8f] text-white shadow-sm" : "text-slate-400"}`}
              >
                Swahili
              </button>
            </div>
            <button onClick={() => navigate("/login")} className="text-sm font-bold">{t.login}</button>
            <button onClick={() => navigate("/signup")} className="bg-[#3b5d8f] text-white text-sm font-bold px-4 py-2 rounded-xl">{t.signup}</button>
          </div>

          {/* Mobile Hamburg Toggle Icon */}
          <button className="md:hidden p-2 rounded-xl" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Flyout Hamburger Menu View */}
        {menuOpen && (
          <div className={`md:hidden border-b p-6 space-y-4 shadow-inner ${isDark ? "bg-[#0c0c0e] border-white/5" : "bg-white border-slate-200"}`}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Globe size={12} /> Lugha / Language</span>
              <div className="grid grid-cols-2 gap-2 border rounded-xl p-1 text-center text-sm font-bold">
                <div onClick={() => { setLang("en"); setMenuOpen(false); }} className={`py-2 rounded-lg cursor-pointer ${lang === "en" ? "bg-[#3b5d8f] text-white" : "text-slate-400"}`}>English</div>
                <div onClick={() => { setLang("sw"); setMenuOpen(false); }} className={`py-2 rounded-lg cursor-pointer ${lang === "sw" ? "bg-[#3b5d8f] text-white" : "text-slate-400"}`}>Swahili</div>
              </div>
            </div>
            <div className="h-[1px] bg-slate-200 dark:bg-white/5 my-2"></div>
            <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="w-full text-center py-2.5 font-bold text-sm rounded-xl border border-slate-200 dark:border-white/10">{t.login}</button>
            <button onClick={() => { navigate("/signup"); setMenuOpen(false); }} className="w-full text-center py-2.5 bg-[#3b5d8f] text-white font-bold text-sm rounded-xl">{t.signup}</button>
          </div>
        )}
      </nav>

      {/* Hero Content Section */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          {t.heroTitle}
        </h1>
        <p className={`text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {t.heroSubtitle}
        </p>

        <button 
          onClick={handleProceed} 
          className="bg-[#3b5d8f] hover:bg-[#2e4a72] text-white font-bold px-8 py-4 rounded-2xl inline-flex items-center gap-2 transition-all shadow-md text-base"
        >
          {t.getStarted} <ArrowRight size={18} />
        </button>
      </main>
    </div>
  );
}
