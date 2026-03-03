import { useEffect, useState } from "react";
import type { Champion } from "../types";
import { fetchChampionDetail, fetchChampions } from "../services/riotApi";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";

interface RoundData {
  champion: Champion;
  line: string;
  hintTitle: string;
}

function toMask(token: string): string {
  return token
    .split("")
    .map((char) => (char.trim() ? "█" : char))
    .join("");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function redactChampionName(line: string, championName: string): string {
  let result = line;

  const fullNamePattern = new RegExp(
    `\\b${escapeRegExp(championName)}\\b`,
    "gi",
  );
  result = result.replace(fullNamePattern, (match) => toMask(match));

  const normalizedName = championName.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const nameParts = normalizedName
    .split(/\s+/)
    .filter((part) => part.length >= 3);

  for (const part of nameParts) {
    const partPattern = new RegExp(`\\b${escapeRegExp(part)}\\b`, "gi");
    result = result.replace(partPattern, (match) => toMask(match));
  }

  return result;
}

function getLoreLine(lore: string): string | null {
  const cleaned = lore
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;

  const sentence = cleaned
    .split(/(?<=[.!?])\s+/)
    .find((part) => part.trim().length > 35);

  if (sentence) {
    return sentence.trim();
  }

  if (cleaned.length > 220) {
    return `${cleaned.slice(0, 220).trim()}...`;
  }

  return cleaned;
}

export function LoreQuoteGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [round, setRound] = useState<RoundData | null>(null);
  const [guessedChampionIds, setGuessedChampionIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVictory, setIsVictory] = useState(false);

  const startNewRound = async (pool: Champion[] = champions) => {
    if (pool.length === 0) return;

    setLoading(true);
    setGuessedChampionIds([]);
    setFeedback(null);
    setIsVictory(false);

    let nextRound: RoundData | null = null;

    for (let tries = 0; tries < 30; tries += 1) {
      const champion = pool[Math.floor(Math.random() * pool.length)];
      const detail = await fetchChampionDetail(champion.apiId);
      if (!detail) continue;

      const line = getLoreLine(detail.lore);
      if (!line) continue;

      const redactedLine = redactChampionName(
        redactChampionName(line, detail.name),
        champion.name,
      );

      nextRound = {
        champion,
        line: redactedLine,
        hintTitle: detail.title,
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
    setFeedback("Not that one. Try another champion.");
  };

  const showAnswer = () => {
    if (!round) return;
    setIsVictory(true);
    setFeedback(null);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-300">
        Loading Lore Quote...
      </div>
    );
  }

  if (!round) {
    return (
      <div className="p-4 text-center text-slate-300">
        Unable to load Lore Quote data.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 w-full">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-slate-100">
          Lore Quote Mode
        </h1>
        <p className="text-center text-slate-300 mb-6 text-sm sm:text-base">
          Read the lore line and guess the champion.
        </p>

        <blockquote className="rounded-xl border border-violet-400/30 bg-violet-600/10 p-4 sm:p-5 text-slate-100 italic text-base sm:text-lg leading-relaxed mb-6">
          “{round.line}”
        </blockquote>

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
              placeholder="Which champion is this lore about?"
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
            Hint: Champion title is{" "}
            <span className="font-semibold">{round.hintTitle}</span>.
          </div>
        )}

        {guessedChampionIds.length > 0 && (
          <p className="text-slate-400 text-sm mt-4 text-center">
            Guesses used: {guessedChampionIds.length}
          </p>
        )}
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
