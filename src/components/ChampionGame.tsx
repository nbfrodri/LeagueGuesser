import { useState, useEffect } from "react";
// import { champions } from "../data/champions"; // Removed static import
import type { Champion, ChampionGuessFeedback } from "../types";
import { compareChampions } from "../utils/gameLogic";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";
import { fetchChampions } from "../services/riotApi";

export function ChampionGuessGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [target, setTarget] = useState<Champion | null>(null);
  const [guesses, setGuesses] = useState<ChampionGuessFeedback[]>([]);
  const [isVictory, setIsVictory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchChampions();
      setChampions(data);
      if (data.length > 0) {
        setTarget(data[Math.floor(Math.random() * data.length)]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const startNewGame = () => {
    if (champions.length === 0) return;
    const random = champions[Math.floor(Math.random() * champions.length)];
    setTarget(random);
    setGuesses([]);
    setIsVictory(false);
  };

  const handleGuess = (guess: Champion) => {
    if (!target) return;

    if (guesses.some((g) => g.champion.id === guess.id)) return;

    const feedback = compareChampions(target, guess);
    setGuesses([feedback, ...guesses]);

    if (guess.id === target.id) {
      setIsVictory(true);
    }
  };

  const getCellColor = (status: string) => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white";
      case "partial":
        return "bg-orange-500 text-white";
      case "higher":
        return "bg-red-500 text-white";
      case "lower":
        return "bg-red-500 text-white";
      default:
        return "bg-red-500 text-white";
    }
  };

  const renderArrow = (status: string) => {
    if (status === "higher") return "↑";
    if (status === "lower") return "↓";
    return "";
  };

  if (loading || !target)
    return (
      <div className="p-4 text-center text-slate-300">Loading Data...</div>
    );

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 w-full">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-slate-100">
          Guess the Champion
        </h1>

        {!isVictory && (
          <SearchBar
            data={champions}
            onSelect={handleGuess}
            getKey={(c) => c.name}
            filter={(c, q) =>
              c.name.toLowerCase().includes(q.toLowerCase()) &&
              !guesses.some((g) => g.champion.id === c.id)
            }
            placeholder="Type a champion name..."
          />
        )}

        <div className="overflow-x-auto w-full max-w-6xl rounded-xl border border-slate-700/60">
          <table className="min-w-[760px] sm:min-w-full text-center text-xs sm:text-sm overflow-hidden">
            <thead className="bg-slate-800 text-slate-200">
              <tr>
                <th className="p-2 sm:p-3">Champion</th>
                <th className="p-2 sm:p-3">Gender</th>
                <th className="p-2 sm:p-3">Position(s)</th>
                <th className="p-2 sm:p-3">Species</th>
                <th className="p-2 sm:p-3">Resource</th>
                <th className="p-2 sm:p-3">Range Type</th>
                <th className="p-2 sm:p-3">Region(s)</th>
                <th className="p-2 sm:p-3">Release Year</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/95 text-slate-100">
              {guesses.map((g, i) => (
                <tr key={i} className="border-b border-slate-800">
                  <td className="p-2 flex flex-col items-center min-w-[120px]">
                    <img
                      src={g.champion.icon}
                      alt={g.champion.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-1 object-cover border border-slate-600"
                    />
                    <span className="font-semibold">{g.champion.name}</span>
                  </td>
                  <td
                    className={`p-2 border font-medium ${getCellColor(g.gender)}`}
                  >
                    {g.champion.gender}
                  </td>
                  <td
                    className={`p-2 border font-medium ${getCellColor(g.position)}`}
                  >
                    {g.champion.positions.join(", ")}
                  </td>
                  <td
                    className={`p-2 border font-medium ${getCellColor(g.species)}`}
                  >
                    {g.champion.species}
                  </td>
                  <td
                    className={`p-2 border font-medium ${getCellColor(g.resource)}`}
                  >
                    {g.champion.resource}
                  </td>
                  <td
                    className={`p-2 border font-medium ${getCellColor(g.rangeType)}`}
                  >
                    {g.champion.rangeType}
                  </td>
                  <td
                    className={`p-2 border font-medium ${getCellColor(g.region)}`}
                  >
                    {g.champion.regions.join(", ")}
                  </td>
                  <td
                    className={`p-2 border font-medium ${getCellColor(g.releaseYear)}`}
                  >
                    {g.champion.releaseYear} {renderArrow(g.releaseYear)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <VictoryModal
        isOpen={isVictory}
        onPlayAgain={startNewGame}
        onClose={() => setIsVictory(false)}
        targetName={target.name}
        targetIcon={target.icon}
      />
    </div>
  );
}
