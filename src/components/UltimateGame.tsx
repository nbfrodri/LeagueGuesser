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

  const [blurLevel, setBlurLevel] = useState(30); // Start very blurry
  const [version, setVersion] = useState("14.3.1");

  const [guesses, setGuesses] = useState<string[]>([]);
  const [isVictory, setIsVictory] = useState(false);
  const [loading, setLoading] = useState(true);

  const startNewGame = async (
    champList: Champion[] = champions,
    ver: string = version,
  ) => {
    if (champList.length === 0) return;
    setLoading(true);
    setIsVictory(false);
    setGuesses([]);
    setBlurLevel(30);

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

    // Construct Image URL
    const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${ver}/img/spell/${ult.image.full}`;
    setUltimateImage(imgUrl);

    setLoading(false);
  };

  const loadData = async () => {
    setLoading(true);

    // Fetch version
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

  const handleGuess = (guess: Champion) => {
    if (!target) return;
    if (guesses.includes(guess.name)) return;

    setGuesses([...guesses, guess.name]);

    if (guess.id === target.id) {
      setIsVictory(true);
      setBlurLevel(0); // Reveal on victory
    } else {
      // Reduce blur on wrong guess
      setBlurLevel((prev) => Math.max(0, prev - 5));
    }
  };

  if (loading || !target)
    return <div className="p-4 text-center">Loading Ultimate...</div>;

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Guess the Ultimate
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-xl mb-8 w-full max-w-2xl text-center border-t-8 border-red-600 flex flex-col items-center">
        <h2 className="text-gray-500 uppercase tracking-widest font-bold mb-4">
          Ultimate Ability
        </h2>

        <div className="mb-6 w-32 h-32 bg-black rounded-lg overflow-hidden relative border-4 border-gray-200">
          <img
            src={ultimateImage}
            alt="Mystery Ultimate"
            className="w-full h-full object-cover transition-all duration-700"
            style={{ filter: `blur(${blurLevel}px)` }}
          />
        </div>

        <div className="text-4xl md:text-6xl font-extrabold text-gray-900 break-words">
          "{ultimateName}"
        </div>
      </div>

      {!isVictory && (
        <div className="w-full max-w-md z-10">
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
          <div className="text-center text-gray-600 mt-4">
            Wrong guesses: {guesses.length} (Blur: {blurLevel}px)
          </div>
        </div>
      )}

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
