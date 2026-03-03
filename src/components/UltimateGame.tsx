import { useState, useEffect } from "react";
import type { Champion } from "../types";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";
import { fetchChampions, fetchChampionDetail } from "../services/riotApi";

export function UltimateGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [target, setTarget] = useState<Champion | null>(null);
  const [ultimateName, setUltimateName] = useState<string>("");
  const [ultimateImage, setUltimateImage] = useState<string>("");

  const [pixelationLevel, setPixelationLevel] = useState(8); // Start very pixelated (8px blocks)

  const [guesses, setGuesses] = useState<string[]>([]);
  const [isVictory, setIsVictory] = useState(false);
  const [loading, setLoading] = useState(true);

  const startNewGame = async (champList: Champion[] = champions) => {
    if (champList.length === 0) return;
    setLoading(true);
    setIsVictory(false);
    setGuesses([]);
    setPixelationLevel(8);

    // 1. Pick Random Champion
    const randomChamp = champList[Math.floor(Math.random() * champList.length)];

    // 2. Fetch Details to get Spell Names
    const detail = await fetchChampionDetail(randomChamp.apiId);

    if (!detail) {
      // Fallback or retry?
      setLoading(false);
      return;
    }

    // 3. Get Ultimate Name (Index 3 is 'R')
    const ult = detail.spells[3];

    setTarget(randomChamp);
    setUltimateName(ult.name);

    setUltimateImage(ult.image.full);

    setLoading(false);
  };

  const loadData = async () => {
    setLoading(true);

    const data = await fetchChampions();
    setChampions(data);
    await startNewGame(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGuess = (guess: Champion) => {
    if (!target) return;
    if (guesses.includes(guess.name)) return;

    setGuesses([...guesses, guess.name]);

    if (guess.id === target.id) {
      setIsVictory(true);
      setPixelationLevel(1); // Fully clear on victory
    } else {
      // Depixelate on wrong guess
      setPixelationLevel((prev) => Math.max(1, prev - 1));
    }
  };

  const showAnswer = () => {
    if (!target) return;
    setIsVictory(true);
    setPixelationLevel(1);
  };

  if (loading || !target)
    return (
      <div className="p-4 text-center text-slate-300">Loading Ultimate...</div>
    );

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 min-h-screen w-full">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-100 text-center">
          Guess the Ultimate
        </h1>

        <div className="bg-slate-900/90 p-4 sm:p-8 rounded-xl shadow-xl mb-8 w-full text-center border border-slate-700 flex flex-col items-center">
          <h2 className="text-slate-400 uppercase tracking-widest font-bold mb-4">
            Ultimate Ability
          </h2>

          <div className="mb-6 w-24 h-24 sm:w-32 sm:h-32 bg-black rounded-lg overflow-hidden relative border-4 border-slate-600">
            <img
              src={ultimateImage}
              alt="Mystery Ultimate"
              className="w-full h-full object-cover transition-all duration-700"
              style={{
                imageRendering: "pixelated",
                filter: `blur(${pixelationLevel * 1.5}px) contrast(${2 - pixelationLevel * 0.15})`,
              }}
            />
          </div>

          <div className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-slate-100 break-words px-2">
            "{ultimateName}"
          </div>
        </div>

        {!isVictory && (
          <div className="w-full max-w-md mx-auto">
            <SearchBar
              data={champions}
              onSelect={handleGuess}
              getKey={(c) => c.name}
              filter={(c, q) =>
                c.name.toLowerCase().includes(q.toLowerCase()) &&
                !guesses.includes(c.name)
              }
              placeholder="Who uses this Ultimate?"
            />
            <div className="flex justify-center mt-3">
              <button
                onClick={showAnswer}
                className="px-4 py-2 rounded-lg bg-yellow-600/80 hover:bg-yellow-500 text-white font-semibold text-sm transition-colors"
              >
                Show Answer
              </button>
            </div>
            <div className="text-center text-slate-300 mt-2">
              Wrong guesses: {guesses.length} (Pixelation: {pixelationLevel}/8)
            </div>
          </div>
        )}
      </div>

      <VictoryModal
        isOpen={isVictory}
        onPlayAgain={() => startNewGame()}
        onClose={() => setIsVictory(false)}
        targetName={target.name}
        targetIcon={target.icon}
      />
    </div>
  );
}
