import { useState, useEffect } from "react";
import type { Champion } from "../types";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";
import { fetchChampions, fetchChampionDetail } from "../services/riotApi";

interface SplashRound {
  target: Champion;
  skin: {
    num: number;
    name: string;
    splashPath?: string;
  };
  origin: { x: number; y: number };
}

export function SplashGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [target, setTarget] = useState<Champion | null>(null);
  const [currentSkin, setCurrentSkin] = useState<{
    num: number;
    name: string;
    splashPath?: string;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState(3.5); // Start closer
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [isVictory, setIsVictory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guesses, setGuesses] = useState<string[]>([]); // Keep track of wrong guesses names
  const [nextRound, setNextRound] = useState<SplashRound | null>(null);
  const [isRoundReady, setIsRoundReady] = useState(false);

  // Refs for image interaction if needed, but CSS transform is enough

  const buildRound = async (
    champList: Champion[] = champions,
  ): Promise<SplashRound | null> => {
    if (champList.length === 0) return null;

    const randomChamp = champList[Math.floor(Math.random() * champList.length)];
    const detail = await fetchChampionDetail(randomChamp.apiId);
    let skinNum = 0;
    let skinName = "Default";
    let splashPath: string | undefined;

    if (detail && detail.skins.length > 0) {
      const randomSkin =
        detail.skins[Math.floor(Math.random() * detail.skins.length)];
      skinNum = randomSkin.num;
      skinName = randomSkin.name === "default" ? "Default" : randomSkin.name;
      splashPath = randomSkin.splashPath;
    }

    return {
      target: randomChamp,
      skin: { num: skinNum, name: skinName, splashPath },
      origin: {
        x: Math.floor(Math.random() * 101),
        y: Math.floor(Math.random() * 101),
      },
    };
  };

  const applyRound = (round: SplashRound) => {
    setIsRoundReady(false);
    setTarget(round.target);
    setCurrentSkin(round.skin);
    setOrigin(round.origin);
    setZoomLevel(3.5);
    setIsVictory(false);
    setGuesses([]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsRoundReady(true);
      });
    });
  };

  const startNewGame = async (champList: Champion[] = champions) => {
    if (champList.length === 0) return;

    if (nextRound) {
      applyRound(nextRound);
      const futureRound = await buildRound(champList);
      setNextRound(futureRound);
      return;
    }

    setLoading(true);
    const freshRound = await buildRound(champList);
    if (freshRound) {
      applyRound(freshRound);
    }

    const futureRound = await buildRound(champList);
    setNextRound(futureRound);
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

  const showAnswer = () => {
    if (!target) return;
    setIsVictory(true);
    setZoomLevel(1);
    setOrigin({ x: 50, y: 50 });
  };

  if (loading || !target || !currentSkin)
    return (
      <div className="p-4 text-center text-slate-300">
        Loading Splash Art...
      </div>
    );

  const splashUrl = currentSkin.splashPath || target.icon;

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 min-h-screen w-full">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-slate-100 text-center">
          Guess the Splash Art
        </h1>

        <div className="relative w-full max-w-4xl mx-auto h-[260px] sm:h-[380px] md:h-[500px] border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl mb-6 bg-black">
          {isRoundReady ? (
            <img
              src={splashUrl}
              alt="Mystery Splash"
              className="w-full h-full object-cover transition-all duration-700 ease-in-out"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
            />
          ) : (
            <div className="w-full h-full bg-black" />
          )}
        </div>

        {!isVictory && (
          <div className="w-full max-w-md z-10 mx-auto">
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
            <div className="flex justify-center mt-3">
              <button
                onClick={showAnswer}
                className="px-4 py-2 rounded-lg bg-yellow-600/80 hover:bg-yellow-500 text-white font-semibold text-sm transition-colors"
              >
                Show Answer
              </button>
            </div>
            <div className="text-center text-slate-300 mt-2">
              Wrong guesses: {guesses.length} (Zoom: {zoomLevel.toFixed(1)}x)
            </div>
          </div>
        )}
      </div>

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
