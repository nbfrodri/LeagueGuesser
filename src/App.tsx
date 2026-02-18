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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative flex flex-col">
      {mode !== "home" && (
        <button
          onClick={goToHome}
          className="absolute top-4 left-4 z-50 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          ← Back to Menu
        </button>
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
