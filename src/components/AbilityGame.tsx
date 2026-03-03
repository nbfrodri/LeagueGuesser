import { useState, useEffect } from "react";
import type { Champion } from "../types";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";
import { fetchChampions, fetchChampionDetail } from "../services/riotApi";

export function AbilityGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [target, setTarget] = useState<Champion | null>(null);
  const [abilityData, setAbilityData] = useState<{
    image: string;
    slot: "P" | "Q" | "W" | "E" | "R";
    name: string;
  } | null>(null);

  const [phase, setPhase] = useState<"champion" | "slot">("champion");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [wrongGuessCount, setWrongGuessCount] = useState(0);

  // Visual states
  const [rotation, setRotation] = useState(0);
  const [isGrayscale, setIsGrayscale] = useState(true);

  const [isVictory, setIsVictory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const startNewGame = async (champList: Champion[] = champions) => {
    if (champList.length === 0) return;
    setLoading(true);
    setPhase("champion");
    setGuesses([]);
    setWrongGuessCount(0);
    setIsVictory(false);
    setFeedback(null);

    // 1. Pick Champion
    const randomChamp = champList[Math.floor(Math.random() * champList.length)];

    // 2. Fetch Details (Spells)
    // We fetch BEFORE setting state to avoid "Target" being set while "Ability" is old/null
    const detail = await fetchChampionDetail(randomChamp.apiId);

    if (!detail) {
      console.error("Failed to fetch details for", randomChamp.name);
      setLoading(false);
      return; // Retry or handle error
    }

    // 3. Pick Ability (P, Q, W, E, R)
    const pick = Math.floor(Math.random() * 5);
    let newAbilityData = null;

    if (pick === 0) {
      newAbilityData = {
        image: detail.passive.image.full,
        slot: "P" as const,
        name: detail.passive.name,
      };
    } else {
      const spellIndex = pick - 1;
      const spell = detail.spells[spellIndex];
      const slots = ["Q", "W", "E", "R"] as const;
      newAbilityData = {
        image: spell.image.full,
        slot: slots[spellIndex],
        name: spell.name,
      };
    }

    // ATOMIC UPDATE: Set everything at once (or close enough)
    setTarget(randomChamp);
    setAbilityData(newAbilityData);

    // 4. Set Visuals
    setRotation(Math.floor(Math.random() * 360));
    setIsGrayscale(true);

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

  const handleChampionGuess = (guess: Champion) => {
    if (!target) return;
    if (guesses.includes(guess.name)) return;

    if (guess.id === target.id) {
      // Correct Champion! Move to Phase 2
      setPhase("slot");
      setFeedback(null);
      // Reset visuals to normal
      setRotation(0);
      setIsGrayscale(false);
    } else {
      // Wrong
      setGuesses([...guesses, guess.name]);
      const newCount = wrongGuessCount + 1;
      setWrongGuessCount(newCount);

      // Progression Logic
      if (newCount === 1) {
        // First wrong guess: Fix rotation
        setRotation(0);
        setFeedback("Wrong champion! Rotation fixed.");
      } else if (newCount === 2) {
        // Second wrong guess: Fix color
        setIsGrayscale(false);
        setFeedback("Wrong again! Color revealed.");
      } else {
        setFeedback("Incorrect! Try again.");
      }
    }
  };

  const handleSlotGuess = (slot: "P" | "Q" | "W" | "E" | "R") => {
    if (!abilityData) return;
    if (slot === abilityData.slot) {
      setIsVictory(true);
      setFeedback(null);
    } else {
      setFeedback("Wrong slot! Try again.");
    }
  };

  const showAnswer = () => {
    if (!target || !abilityData) return;
    // Complete both phases and show victory
    setPhase("slot");
    setRotation(0);
    setIsGrayscale(false);
    setIsVictory(true);
    setFeedback(null);
  };

  if (loading || !target || !abilityData)
    return (
      <div className="p-4 text-center text-slate-300">Loading Ability...</div>
    );

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 min-h-screen w-full">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-100 text-center">
          Guess the Ability
        </h1>

        {/* Ability Image Container */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-slate-700 rounded-full overflow-hidden shadow-xl bg-black relative">
            <img
              src={abilityData.image}
              alt="Mystery Ability"
              className="w-full h-full object-cover transition-all duration-500"
              style={{
                transform: `rotate(${rotation}deg)`,
                filter: isGrayscale ? "grayscale(100%)" : "none",
              }}
            />
          </div>
          <div className="mt-2 text-sm text-slate-300">
            {phase === "champion"
              ? "Identify the Champion!"
              : "Identify the Ability Slot!"}
          </div>
          {feedback && (
            <div className="mt-4 p-2 bg-red-500/15 text-red-200 border border-red-400/40 rounded">
              {feedback}
            </div>
          )}
        </div>

        {phase === "champion" && !isVictory && (
          <div className="w-full max-w-md z-10 mx-auto">
            <SearchBar
              data={champions}
              onSelect={handleChampionGuess}
              getKey={(c) => c.name}
              filter={(c, q) =>
                c.name.toLowerCase().includes(q.toLowerCase()) &&
                !guesses.includes(c.name)
              }
              placeholder="Which champion has this ability?"
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
              Wrong guesses: {wrongGuessCount}
            </div>
          </div>
        )}

        {phase === "slot" && !isVictory && (
          <>
            <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
              {(["P", "Q", "W", "E", "R"] as const).map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleSlotGuess(slot)}
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-xl sm:text-2xl font-bold rounded-lg shadow-lg hover:from-cyan-500 hover:to-blue-600 transition active:scale-95"
                >
                  {slot}
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={showAnswer}
                className="px-4 py-2 rounded-lg bg-yellow-600/80 hover:bg-yellow-500 text-white font-semibold text-sm transition-colors"
              >
                Show Answer
              </button>
            </div>
          </>
        )}
      </div>

      <VictoryModal
        isOpen={isVictory}
        onPlayAgain={() => startNewGame()}
        onClose={() => setIsVictory(false)}
        targetName={`${target.name} ${abilityData.slot} - ${abilityData.name}`}
        targetIcon={target.icon}
      />
    </div>
  );
}
