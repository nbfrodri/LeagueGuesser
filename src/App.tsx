import { useState } from "react";
import { Home } from "./components/Home";
import { ChampionGuessGame } from "./components/ChampionGame";
import { ItemGuessGame } from "./components/ItemGame";
import { SplashGame } from "./components/SplashGame";
import { AbilityGame } from "./components/AbilityGame";
import { UltimateGame } from "./components/UltimateGame";

import { Footer } from "./components/Footer";

function App() {
  const [mode, setMode] = useState<
    "home" | "champion" | "item" | "splash" | "ability" | "ultimate"
  >("home");

  const goToHome = () => setMode("home");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative flex flex-col w-full">
      {mode !== "home" && (
        <>
          <button
            onClick={goToHome}
            aria-label="Back to menu"
            title="Back to menu"
            className="absolute top-2 left-2 z-50 h-9 w-9 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition sm:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={goToHome}
            className="hidden sm:inline-flex absolute top-4 left-4 z-50 bg-gray-800 text-white px-4 py-2 rounded text-base hover:bg-gray-700 transition items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Menu
          </button>
        </>
      )}

      <div className="flex-grow">
        {mode === "home" && <Home onSelectMode={setMode} />}
        {mode === "champion" && <ChampionGuessGame />}
        {mode === "item" && <ItemGuessGame />}
        {mode === "splash" && <SplashGame />}
        {mode === "ability" && <AbilityGame />}
        {mode === "ultimate" && <UltimateGame />}
      </div>

      <Footer />
    </div>
  );
}

export default App;
