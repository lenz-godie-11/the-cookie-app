import { useState } from "react";
import { useNavigate } from "react-router-dom";

const translations = {
  en: { signup: "Explore the App →" },
  sw: { signup: "Gundua App →" },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <img
        src="/images/hero.png"
        alt="hero"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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

      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-16 flex flex-col items-center gap-3 text-center">
        <span className="text-white/60 text-xs uppercase tracking-widest font-semibold">
          {lang === "en"
            ? "Family Inventory Management"
            : "Usimamizi wa Mahitaji ya Familia"}
        </span>

        <h1 className="text-white text-4xl md:text-6xl font-black leading-tight drop-shadow-xl max-w-2xl">
          {lang === "en" ? (
            <>
              Everything Your{" "}
              <span className="text-yellow-300">Family Needs</span>, Always
              Stocked.
            </>
          ) : (
            <>
              Kila Kitu Familia Yako{" "}
              <span className="text-yellow-300">Inahitaji</span>, Daima
              Kinapatikana.
            </>
          )}
        </h1>

        <p className="text-white/80 text-sm md:text-base max-w-md leading-relaxed">
          {lang === "en"
            ? "Stop guessing what's running low. Track, manage, and get alerts before you run out — for the whole household."
            : "Acha kukisia kinachokwisha. Fuatilia, dhibiti, na pata tahadhari kabla hujaikimbia — kwa familia nzima."}
        </p>

        <button
          onClick={() => navigate("/signup")}
          className="mt-3 bg-white text-black font-bold px-10 py-3.5 rounded-full text-base shadow-2xl hover:scale-105 hover:bg-yellow-300 transition-all duration-200"
        >
          {lang === "en" ? "Explore the App →" : "Gundua App →"}
        </button>

        <p className="text-white/40 text-xs mt-1">
          {lang === "en"
            ? "Free to get started. No credit card needed."
            : "Bure kuanza. Hakuna kadi ya benki inayohitajika."}
        </p>
      </div>
    </div>
  );
}
