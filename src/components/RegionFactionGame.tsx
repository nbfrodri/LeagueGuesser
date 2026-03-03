import { useEffect, useState } from "react";
import type { Champion } from "../types";
import { fetchChampionDetail, fetchChampions } from "../services/riotApi";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";

interface RegionFactionRound {
  champion: Champion;
  region: string;
  title: string;
}

function getRegionColors(region: string): {
  borderColor: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
} {
  const regionColorMap: Record<
    string,
    {
      borderColor: string;
      bgColor: string;
      textColor: string;
      accentColor: string;
    }
  > = {
    Demacia: {
      borderColor: "border-blue-400/60",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-100",
      accentColor: "text-blue-300",
    },
    Noxus: {
      borderColor: "border-red-400/60",
      bgColor: "bg-red-500/10",
      textColor: "text-red-100",
      accentColor: "text-red-300",
    },
    Ionia: {
      borderColor: "border-purple-400/60",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-100",
      accentColor: "text-purple-300",
    },
    Freljord: {
      borderColor: "border-cyan-400/60",
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-100",
      accentColor: "text-cyan-300",
    },
    Piltover: {
      borderColor: "border-yellow-400/60",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-100",
      accentColor: "text-yellow-300",
    },
    Zaun: {
      borderColor: "border-green-400/60",
      bgColor: "bg-green-500/10",
      textColor: "text-green-100",
      accentColor: "text-green-300",
    },
    Ixtal: {
      borderColor: "border-emerald-400/60",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-100",
      accentColor: "text-emerald-300",
    },
    "Shadow Isles": {
      borderColor: "border-indigo-400/60",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-100",
      accentColor: "text-indigo-300",
    },
    Bilgewater: {
      borderColor: "border-orange-400/60",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-100",
      accentColor: "text-orange-300",
    },
    Shurima: {
      borderColor: "border-amber-400/60",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-100",
      accentColor: "text-amber-300",
    },
    Targon: {
      borderColor: "border-pink-400/60",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-100",
      accentColor: "text-pink-300",
    },
    Void: {
      borderColor: "border-slate-500/60",
      bgColor: "bg-slate-600/10",
      textColor: "text-slate-100",
      accentColor: "text-slate-300",
    },
    "Bandle City": {
      borderColor: "border-fuchsia-400/60",
      bgColor: "bg-fuchsia-500/10",
      textColor: "text-fuchsia-100",
      accentColor: "text-fuchsia-300",
    },
    Runeterra: {
      borderColor: "border-slate-400/60",
      bgColor: "bg-slate-500/10",
      textColor: "text-slate-100",
      accentColor: "text-slate-300",
    },
  };

  return (
    regionColorMap[region] || {
      borderColor: "border-slate-400/60",
      bgColor: "bg-slate-500/10",
      textColor: "text-slate-100",
      accentColor: "text-slate-300",
    }
  );
}

function getRegionButtonColor(region: string): string {
  const buttonColorMap: Record<string, string> = {
    Demacia: "bg-blue-600 hover:bg-blue-500",
    Noxus: "bg-red-600 hover:bg-red-500",
    Ionia: "bg-purple-600 hover:bg-purple-500",
    Freljord: "bg-cyan-600 hover:bg-cyan-500",
    Piltover: "bg-yellow-600 hover:bg-yellow-500",
    Zaun: "bg-green-600 hover:bg-green-500",
    Ixtal: "bg-emerald-600 hover:bg-emerald-500",
    "Shadow Isles": "bg-indigo-600 hover:bg-indigo-500",
    Bilgewater: "bg-orange-600 hover:bg-orange-500",
    Shurima: "bg-amber-600 hover:bg-amber-500",
    Targon: "bg-pink-600 hover:bg-pink-500",
    Void: "bg-slate-600 hover:bg-slate-500",
    "Bandle City": "bg-fuchsia-600 hover:bg-fuchsia-500",
    Runeterra: "bg-slate-500 hover:bg-slate-400",
  };

  return buttonColorMap[region] || "bg-slate-600 hover:bg-slate-500";
}

export function RegionFactionGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [round, setRound] = useState<RegionFactionRound | null>(null);
  const [guessedChampionIds, setGuessedChampionIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVictory, setIsVictory] = useState(false);

  const buildRound = async (
    champion: Champion,
  ): Promise<RegionFactionRound> => {
    const detail = await fetchChampionDetail(champion.apiId);
    return {
      champion,
      region:
        champion.regions.find((region) => region !== "Unknown") ??
        champion.regions[0] ??
        "Unknown",
      title: detail?.title || "The Unknown",
    };
  };

  const startNewRound = async (pool: Champion[] = champions) => {
    if (pool.length === 0) return;

    setLoading(true);
    setIsVictory(false);
    setFeedback(null);
    setGuessedChampionIds([]);

    const champion = pool[Math.floor(Math.random() * pool.length)];
    const nextRound = await buildRound(champion);

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
      setFeedback("Correct. Region and title matched perfectly.");
      return;
    }

    setGuessedChampionIds((current) => [guess.id, ...current]);
    setFeedback("Not this champion. Use both region and title clue.");
  };

  const showAnswer = () => {
    if (!round) return;
    setIsVictory(true);
    setFeedback("Correct. Region and title matched perfectly.");
  };

  if (loading || !round) {
    return (
      <div className="p-4 text-center text-slate-300">
        Loading Region/Faction Mode...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 w-full">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-slate-100">
          Region/Faction Mode
        </h1>
        <p className="text-center text-slate-300 mb-5 text-sm sm:text-base">
          Guess the champion from region and lore title.
        </p>

        <div
          className={`rounded-xl border ${getRegionColors(round.region).borderColor} ${getRegionColors(round.region).bgColor} p-4 sm:p-5 mb-6 text-center`}
        >
          <p
            className={`text-xs uppercase tracking-[0.18em] ${getRegionColors(round.region).accentColor}/80 mb-2`}
          >
            Lore Region
          </p>
          <p
            className={`text-2xl sm:text-3xl font-bold ${getRegionColors(round.region).textColor} mb-4`}
          >
            {round.region}
          </p>

          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80 mb-2">
            Title
          </p>
          <p className="text-xl sm:text-2xl font-semibold text-cyan-100 italic">
            {round.title}
          </p>
        </div>

        {!isVictory && (
          <div className="w-full max-w-lg mx-auto">
            <SearchBar
              data={champions}
              onSelect={handleGuess}
              getKey={(champion) => champion.name}
              filter={(champion, query) =>
                champion.name.toLowerCase().includes(query.toLowerCase()) &&
                !guessedChampionIds.includes(champion.id)
              }
              placeholder="Who is this champion?"
            />
            <div className="flex justify-center mt-3">
              <button
                onClick={showAnswer}
                className="px-4 py-2 rounded-lg bg-yellow-600/80 hover:bg-yellow-500 text-white font-semibold text-sm transition-colors"
              >
                Show Answer
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div className="mt-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-200 text-sm sm:text-base">
            {feedback}
          </div>
        )}

        {guessedChampionIds.length >= 2 &&
          !isVictory &&
          round.champion.regions.length > 1 && (
            <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-amber-200 text-sm sm:text-base">
              Extra hint: Also associated with{" "}
              <span className="font-semibold">{round.champion.regions[1]}</span>
              .
            </div>
          )}

        <div className="mt-5 flex justify-center">
          <button
            onClick={() => startNewRound()}
            className={`rounded-lg ${getRegionButtonColor(round.region)} text-white font-semibold px-5 py-2.5 transition`}
          >
            New Region Clue
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
