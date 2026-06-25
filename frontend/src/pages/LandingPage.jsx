import { useState } from "react";
import { useNavigate } from "react-router-dom";

const translations = {
  en: { signup: "Get Started" },
  sw: { signup: "Anza Sasa" },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full screen background image */}
      <img
        src="/images/hero.png"
        alt="hero"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay - bottom only so image stays clear on top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Lang toggle - top right */}
      <div className="absolute top-5 right-5 z-20 flex gap-2 text-xs font-bold">
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            lang === "en"
              ? "bg-white text-black"
              : "text-white border border-white/50"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang("sw")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            lang === "sw"
              ? "bg-white text-black"
              : "text-white border border-white/50"
          }`}
        >
          SW
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-14 flex flex-col items-center gap-4">
        <h1 className="text-white text-3xl md:text-5xl font-black text-center drop-shadow-lg">
          The Cookie App
        </h1>
        <p className="text-white/80 text-sm md:text-base text-center max-w-md">
          {lang === "en"
            ? "Keep your family's snacks & supplies in perfect balance."
            : "Weka vyakula na mahitaji ya familia yako kwenye uwiano sawa."}
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="mt-2 bg-white text-black font-bold px-10 py-3.5 rounded-full text-base shadow-xl hover:bg-slate-100 transition-all"
        >
          {t.signup}
        </button>
      </div>
    </div>
  );
}
