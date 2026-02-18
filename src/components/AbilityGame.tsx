import { useState, useEffect } from "react";
import type { Champion } from "../types";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";
import { fetchChampions, fetchChampionDetail } from "../services/riotApi";

// Helper to get image URL
const getAbilityUrl = (
  version: string,
  filename: string,
  type: "passive" | "spell",
) => {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/${type}/${filename}`;
};

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
  const [version, setVersion] = useState("14.3.1"); // Will fetch real version
  const [feedback, setFeedback] = useState<string | null>(null);

  const startNewGame = async (
    champList: Champion[] = champions,
    ver: string = version,
  ) => {
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
        image: getAbilityUrl(ver, detail.passive.image.full, "passive"),
        slot: "P" as const,
        name: detail.passive.name,
      };
    } else {
      const spellIndex = pick - 1;
      const spell = detail.spells[spellIndex];
      const slots = ["Q", "W", "E", "R"] as const;
      newAbilityData = {
        image: getAbilityUrl(ver, spell.image.full, "spell"),
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
    // get version from API indirectly via fetchChampions or just hardcode/fetch separately
    // Ideally we expose getLatestVersion from riotApi or just fetch champions and reuse its internal version logic
    // For now, let's just fetch champions and assume version is reasonable or fetch it.
    const url = "https://ddragon.leagueoflegends.com/api/versions.json";
    const vResp = await fetch(url);
    const versions = await vResp.json();
    setVersion(versions[0]);

    const data = await fetchChampions();
    setChampions(data);
    await startNewGame(data, versions[0]);
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

  if (loading || !target || !abilityData)
    return <div className="p-4 text-center">Loading Ability...</div>;

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Guess the Ability
      </h1>

      {/* Ability Image Container */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-32 h-32 border-4 border-gray-800 rounded-full overflow-hidden shadow-xl bg-black relative">
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
        <div className="mt-2 text-sm text-gray-600">
          {phase === "champion"
            ? "Identify the Champion!"
            : "Identify the Ability Slot!"}
        </div>
        {feedback && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 border border-red-300 rounded animate-bounce">
            {feedback}
          </div>
        )}
      </div>

      {phase === "champion" && !isVictory && (
        <div className="w-full max-w-md z-10">
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
          <div className="text-center text-gray-600 mt-2">
            Wrong guesses: {wrongGuessCount}
          </div>
        </div>
      )}

      {phase === "slot" && !isVictory && (
        <div className="flex gap-4">
          {(["P", "Q", "W", "E", "R"] as const).map((slot) => (
            <button
              key={slot}
              onClick={() => handleSlotGuess(slot)}
              className="w-16 h-16 bg-blue-600 text-white text-2xl font-bold rounded-lg shadow hover:bg-blue-700 transition active:scale-95"
            >
              {slot}
            </button>
          ))}
        </div>
      )}

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
