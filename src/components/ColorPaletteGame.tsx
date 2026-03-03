import { useEffect, useMemo, useState } from "react";
import type { Champion } from "../types";
import { fetchChampions } from "../services/riotApi";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";

interface PaletteRound {
  champion: Champion;
  colors: string[];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorDistance(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
}

function extractPalette(imageUrl: string, count = 6): Promise<string[]> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const width = 64;
        const height = 64;
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          resolve([]);
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height).data;

        const buckets = new Map<
          string,
          { color: [number, number, number]; weight: number }
        >();

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const alpha = imageData[i + 3];

          if (alpha < 160) continue;

          const brightness = (r + g + b) / 3;
          if (brightness < 15 || brightness > 245) continue;

          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;

          const key = `${qr},${qg},${qb}`;
          const existing = buckets.get(key);

          if (existing) {
            existing.weight += 1;
          } else {
            buckets.set(key, {
              color: [Math.min(255, qr), Math.min(255, qg), Math.min(255, qb)],
              weight: 1,
            });
          }
        }

        const sorted = [...buckets.values()]
          .sort((a, b) => b.weight - a.weight)
          .map((bucket) => bucket.color);

        const selected: [number, number, number][] = [];
        for (const candidate of sorted) {
          const isDistinct = selected.every(
            (picked) => colorDistance(candidate, picked) > 48,
          );

          if (isDistinct) {
            selected.push(candidate);
          }

          if (selected.length === count) break;
        }

        resolve(
          selected.map((color) => rgbToHex(color[0], color[1], color[2])),
        );
      } catch {
        resolve([]);
      }
    };

    image.onerror = () => resolve([]);
    image.src = imageUrl;
  });
}

export function ColorPaletteGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [round, setRound] = useState<PaletteRound | null>(null);
  const [guessedChampionIds, setGuessedChampionIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVictory, setIsVictory] = useState(false);

  const fallbackPalette = useMemo(
    () => ["#1e293b", "#334155", "#0ea5e9", "#38bdf8", "#a855f7", "#f43f5e"],
    [],
  );

  const startNewRound = async (pool: Champion[] = champions) => {
    if (pool.length === 0) return;

    setLoading(true);
    setIsVictory(false);
    setFeedback(null);
    setGuessedChampionIds([]);

    let nextRound: PaletteRound | null = null;

    for (let tries = 0; tries < 20; tries += 1) {
      const champion = pool[Math.floor(Math.random() * pool.length)];
      const palette = await extractPalette(champion.icon, 6);

      nextRound = {
        champion,
        colors: palette.length >= 4 ? palette : fallbackPalette,
      };
      break;
    }

    setRound(nextRound);
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      const data = await fetchChampions();
      setChampions(data);
      await startNewRound(data);
    };

    load();
  }, []);

  const handleGuess = (guess: Champion) => {
    if (!round || guessedChampionIds.includes(guess.id)) return;

    if (guess.id === round.champion.id) {
      setIsVictory(true);
      setFeedback(null);
      return;
    }

    setGuessedChampionIds((current) => [guess.id, ...current]);
    setFeedback("Not that champion. Check the palette tones and try again.");
  };

  const showAnswer = () => {
    if (!round) return;
    setIsVictory(true);
    setFeedback(null);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-300">
        Loading Color Palette...
      </div>
    );
  }

  if (!round) {
    return (
      <div className="p-4 text-center text-slate-300">
        Unable to load Color Palette data.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 w-full">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-slate-100">
          Color Palette Mode
        </h1>
        <p className="text-center text-slate-300 mb-5 text-sm sm:text-base">
          Guess the champion from the extracted color palette.
        </p>

        <div className="rounded-xl border border-cyan-400/25 bg-slate-900/80 p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {round.colors.map((color, index) => (
              <div
                key={`${color}-${index}`}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-slate-600 shadow-lg"
                  style={{ backgroundColor: color }}
                  aria-label={`Palette color ${index + 1}`}
                />
                <span className="text-[11px] sm:text-xs text-slate-300 tracking-wide uppercase">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {!isVictory && (
          <>
            <SearchBar
              data={champions}
              onSelect={handleGuess}
              getKey={(champion) => champion.name}
              filter={(champion, query) =>
                champion.name.toLowerCase().includes(query.toLowerCase()) &&
                !guessedChampionIds.includes(champion.id)
              }
              placeholder="Which champion matches this palette?"
            />
            <div className="flex justify-center mt-3">
              <button
                onClick={showAnswer}
                className="px-4 py-2 rounded-lg bg-yellow-600/80 hover:bg-yellow-500 text-white font-semibold text-sm transition-colors"
              >
                Show Answer
              </button>
            </div>
          </>
        )}

        {feedback && (
          <div className="mt-2 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-red-200 text-sm sm:text-base">
            {feedback}
          </div>
        )}

        {guessedChampionIds.length >= 2 && !isVictory && (
          <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-amber-200 text-sm sm:text-base">
            Hint: Primary role is{" "}
            <span className="font-semibold">{round.champion.positions[0]}</span>
            .
          </div>
        )}

        {guessedChampionIds.length > 0 && (
          <p className="text-slate-400 text-sm mt-4 text-center">
            Guesses used: {guessedChampionIds.length}
          </p>
        )}

        <div className="mt-5 flex justify-center">
          <button
            onClick={() => startNewRound()}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2.5 transition"
          >
            New Palette
          </button>
        </div>
      </div>

      <VictoryModal
        isOpen={isVictory}
        onPlayAgain={() => startNewRound()}
        onClose={() => setIsVictory(false)}
        targetName={round.champion.name}
        targetIcon={round.champion.icon}
      />
    </div>
  );
}
