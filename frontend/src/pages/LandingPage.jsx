import { useState } from "react";
import { useNavigate } from "react-router-dom";

const translations = {
  en: {
    signup: "Sign Up",
    alertMessage: "Please Log In or Sign Up to access your family's dashboard!",
  },
  sw: {
    signup: "Jisajili",
    alertMessage:
      "Tafadhali Ingia au Jisajili kwanza ili uweze kufikia dashibodi ya familia yako!",
  },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero.png')" }}
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        {/* Lang toggle */}
        <div className="absolute top-6 right-6 flex gap-2 text-xs font-bold">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 rounded-lg transition-all ${lang === "en" ? "bg-white text-black" : "text-white border border-white/40"}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("sw")}
            className={`px-3 py-1.5 rounded-lg transition-all ${lang === "sw" ? "bg-white text-black" : "text-white border border-white/40"}`}
          >
            SW
          </button>
        </div>

        <button
          onClick={() => navigate("/signup")}
          className="bg-[#3b5d8f] hover:bg-[#2e4a72] text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-xl transition-all"
        >
          {t.signup}
        </button>
      </div>
    </div>
  );
}
