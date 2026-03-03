import { useState, useEffect } from "react";
import type { Champion, ChampionGuessFeedback } from "../types";
import { compareChampions } from "../utils/gameLogic";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";
import { fetchChampions, fetchItems } from "../services/riotApi";
import { championBuilds } from "../data/championBuilds";

export function ItemGuessGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [itemMap, setItemMap] = useState<Record<string, string>>({}); // ID -> IconURL

  const [targetChampion, setTargetChampion] = useState<Champion | null>(null);
  const [targetBuild, setTargetBuild] = useState<string[]>([]); // Array of Item IDs

  const [guesses, setGuesses] = useState<ChampionGuessFeedback[]>([]);
  const [isVictory, setIsVictory] = useState(false);
  const [loading, setLoading] = useState(true);

  // Moved pickNewGame above useEffect to satisfy linter
  const pickNewGame = (buildKeys: string[], champs: Champion[]) => {
    const randomKey = buildKeys[Math.floor(Math.random() * buildKeys.length)];
    const target = champs.find(
      (c) => c.id.toLowerCase() === randomKey.toLowerCase(),
    );

    if (target) {
      setTargetChampion(target);
      setTargetBuild(championBuilds[randomKey]);
    } else {
      console.error("Target champion not found in champion list:", randomKey);
    }

    setGuesses([]);
    setIsVictory(false);
  };

  useEffect(() => {
    const loadData = async () => {
      // Fetch Champions for guessing pool
      const champs = await fetchChampions();
      setChampions(champs);

      // Fetch Items to get Icons
      const items = await fetchItems();
      const map: Record<string, string> = {};
      items.forEach((i) => {
        map[i.id] = i.icon;
      });
      setItemMap(map);

      // Pick random champion from our builds list
      const buildKeys = Object.keys(championBuilds);
      if (buildKeys.length > 0 && champs.length > 0) {
        pickNewGame(buildKeys, champs);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const startNewGame = () => {
    const buildKeys = Object.keys(championBuilds);
    if (buildKeys.length > 0 && champions.length > 0) {
      pickNewGame(buildKeys, champions);
    }
  };

  const handleGuess = (guess: Champion) => {
    if (!targetChampion) return;

    if (guesses.some((g) => g.champion.id === guess.id)) return;

    const feedback = compareChampions(targetChampion, guess);
    setGuesses([feedback, ...guesses]);

    if (guess.id === targetChampion.id) {
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

  if (loading || !targetChampion)
    return <div className="p-4 text-center">Loading Data...</div>;

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        Guess the Champion by Build
      </h1>

      {/* Build Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 bg-gray-600 p-3 sm:p-4 rounded-lg shadow-inner">
        {targetBuild.map((itemId, index) => (
          <div
            key={index}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 rounded border border-gray-500 overflow-hidden relative"
          >
            {itemMap[itemId] ? (
              <img
                src={itemMap[itemId]}
                alt="Item"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                ?
              </div>
            )}
          </div>
        ))}
      </div>

      {!isVictory && (
        <SearchBar
          data={champions}
          onSelect={handleGuess}
          getKey={(c) => c.name}
          filter={(c, q) =>
            c.name.toLowerCase().includes(q.toLowerCase()) &&
            !guesses.some((g) => g.champion.id === c.id)
          }
          placeholder="Who builds this?..."
        />
      )}

      {/* Feedback Table (Reused from ChampionGame) */}
      <div className="overflow-x-auto w-full max-w-6xl">
        <table className="min-w-[760px] sm:min-w-full text-center text-xs sm:text-sm shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700">
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
          <tbody className="bg-white">
            {guesses.map((g, i) => (
              <tr key={i} className="border-b">
                <td className="p-2 flex flex-col items-center min-w-[120px]">
                  <img
                    src={g.champion.icon}
                    alt={g.champion.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-1 object-cover"
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

      <VictoryModal
        isOpen={isVictory}
        onPlayAgain={startNewGame}
        onClose={() => setIsVictory(false)}
        targetName={targetChampion.name}
        targetIcon={targetChampion.icon}
      />
    </div>
  );
}
