import { useState, useEffect } from "react";
import type { Champion } from "../types";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";
import { fetchChampions, fetchChampionDetail } from "../services/riotApi";

export function SplashGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [target, setTarget] = useState<Champion | null>(null);
  const [currentSkin, setCurrentSkin] = useState<{
    num: number;
    name: string;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(3.5); // Start closer
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [isVictory, setIsVictory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guesses, setGuesses] = useState<string[]>([]); // Keep track of wrong guesses names

  // Refs for image interaction if needed, but CSS transform is enough

  const startNewGame = async (champList: Champion[] = champions) => {
    if (champList.length === 0) return;
    setLoading(true);

    const randomChamp = champList[Math.floor(Math.random() * champList.length)];
    setTarget(randomChamp);

    // Fetch skins for this champion
    const detail = await fetchChampionDetail(randomChamp.apiId);
    let skinNum = 0;
    let skinName = "Default";

    if (detail && detail.skins.length > 0) {
      const randomSkin =
        detail.skins[Math.floor(Math.random() * detail.skins.length)];
      skinNum = randomSkin.num;
      skinName = randomSkin.name === "default" ? "Default" : randomSkin.name;
    }

    setCurrentSkin({ num: skinNum, name: skinName });

    // Random focus point, but keep away from extreme edges to avoid showing black bars if possible
    // though with overflow hidden and scale > 1 it should be fine.
    // Let's allow 0-100% basically.
    const randomX = Math.floor(Math.random() * 101);
    const randomY = Math.floor(Math.random() * 101);

    // Set initial state
    setOrigin({ x: randomX, y: randomY });
    setZoomLevel(3.5);
    setIsVictory(false);
    setGuesses([]);
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
    if (guesses.includes(guess.name)) return; // Already guessed

    setGuesses([...guesses, guess.name]);

    if (guess.id === target.id) {
      // Victory!
      setIsVictory(true);
      setZoomLevel(1);
      setOrigin({ x: 50, y: 50 }); // Center it
    } else {
      // Wrong guess: Zoom out
      setZoomLevel((prev) => Math.max(1, prev - 0.5));
    }
  };

  if (loading || !target || !currentSkin)
    return <div className="p-4 text-center">Loading Splash Art...</div>;

  // URL for the splash art
  // Using specific skin number, using apiId (Original Casing)
  const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${target.apiId}_${currentSkin.num}.jpg`;

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 min-h-screen bg-gray-100 w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">
        Guess the Splash Art
      </h1>

      <div className="relative w-full max-w-4xl h-[260px] sm:h-[380px] md:h-[500px] border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl mb-6 bg-black">
        <img
          src={splashUrl}
          alt="Mystery Splash"
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        />

        {/* Optional: Overlay to prevent right-click save? Or just simple img is fine. */}
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
            placeholder="Who is this?..."
          />
          <div className="text-center text-gray-600 mt-2">
            Wrong guesses: {guesses.length} (Zoom: {zoomLevel.toFixed(1)}x)
          </div>
        </div>
      )}

      {/* Show wrong guesses list casually? Maybe not needed if we filter them out. */}

      <VictoryModal
        isOpen={isVictory}
        onPlayAgain={() => startNewGame()}
        onClose={() => setIsVictory(false)}
        targetName={`${target.name} (${currentSkin.name})`}
        targetIcon={target.icon} // Pass icon or maybe splash? simple icon is fine for consistency
      />
    </div>
  );
}
