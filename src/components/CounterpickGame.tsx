import { useEffect, useMemo, useState } from "react";
import type { Champion } from "../types";
import { fetchChampions } from "../services/riotApi";
import {
  counterpickScenarios,
  type CounterpickLane,
  type CounterpickScenario,
} from "../data/counterpickScenarios";

interface ResolvedScenario {
  scenario: CounterpickScenario;
  enemyTeam: Array<{ champion: Champion; role: CounterpickLane }>;
  choices: Champion[];
  correct: Champion;
}

const laneDisplayOrder: Record<CounterpickLane, number> = {
  Top: 0,
  Jungle: 1,
  Mid: 2,
  Bot: 3,
  Support: 4,
};

function getDisplayedRole(role: CounterpickLane): string {
  return role === "Bot" ? "ADC" : role;
}

function shuffleChoices(choices: Champion[]): Champion[] {
  const shuffled = [...choices];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function CounterpickGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [currentRound, setCurrentRound] = useState<ResolvedScenario | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(
    null,
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [scenarioDeck, setScenarioDeck] = useState<ResolvedScenario[]>([]);

  const championByName = useMemo(() => {
    return new Map(champions.map((champion) => [champion.name, champion]));
  }, [champions]);

  const availableRounds = useMemo(() => {
    if (championByName.size === 0) return [];

    return counterpickScenarios
      .map((scenario) => {
        const enemyTeam = scenario.enemyComp
          .map((enemy) => {
            const champion = championByName.get(enemy.champion);
            if (!champion) {
              return null;
            }

            return {
              champion,
              role: enemy.role,
            };
          })
          .filter(
            (enemy): enemy is { champion: Champion; role: CounterpickLane } =>
              !!enemy,
          );

        const choices = scenario.options
          .map((name) => championByName.get(name))
          .filter((champion): champion is Champion => !!champion);

        const correct = championByName.get(scenario.correct);

        if (
          enemyTeam.length !== scenario.enemyComp.length ||
          choices.length !== 4 ||
          !correct
        ) {
          return null;
        }

        const orderedEnemyTeam = [...enemyTeam].sort(
          (left, right) =>
            laneDisplayOrder[left.role] - laneDisplayOrder[right.role],
        );

        return {
          scenario,
          enemyTeam: orderedEnemyTeam,
          choices,
          correct,
        } as ResolvedScenario;
      })
      .filter((round): round is ResolvedScenario => !!round);
  }, [championByName]);

  const pickNewRound = (rounds: ResolvedScenario[] = availableRounds) => {
    if (rounds.length === 0) {
      setCurrentRound(null);
      return;
    }

    let newDeck = scenarioDeck;

    // If deck is empty or nearly depleted, reshuffle
    if (newDeck.length === 0) {
      newDeck = [...rounds].sort(() => Math.random() - 0.5);
    }

    // Take first scenario from deck
    const randomRound = newDeck[0];
    const updatedDeck = newDeck.slice(1);

    setScenarioDeck(updatedDeck);
    setCurrentRound({
      ...randomRound,
      choices: shuffleChoices(randomRound.choices),
    });
    setSelectedChampionId(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchChampions();
      setChampions(data);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Initialize deck with shuffled scenarios
      const initialDeck = [...availableRounds].sort(() => Math.random() - 0.5);
      setScenarioDeck(initialDeck.slice(1));
      setCurrentRound({
        ...initialDeck[0],
        choices: shuffleChoices(initialDeck[0].choices),
      });
      setSelectedChampionId(null);
      setIsCorrect(null);
    }
  }, [loading, availableRounds]);

  const handlePick = (champion: Champion) => {
    if (!currentRound || selectedChampionId !== null) return;

    setSelectedChampionId(champion.id);
    setIsCorrect(champion.id === currentRound.correct.id);
  };

  const showAnswer = () => {
    if (!currentRound) return;
    setSelectedChampionId(currentRound.correct.id);
    setIsCorrect(true);
  };

  const hasAnswered = selectedChampionId !== null;

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-300">Loading Data...</div>
    );
  }

  if (!currentRound) {
    return (
      <div className="p-4 text-center text-slate-300">
        Unable to load Counterpick Mode data.
      </div>
    );
  }

  const getButtonStyle = (champion: Champion) => {
    if (!hasAnswered) {
      return "border-slate-700/70 bg-slate-900 hover:bg-slate-800";
    }

    if (champion.id === currentRound.correct.id) {
      return "border-emerald-400/80 bg-emerald-600/25";
    }

    if (champion.id === selectedChampionId && isCorrect === false) {
      return "border-red-400/80 bg-red-600/20";
    }

    return "border-slate-700/70 bg-slate-900/70";
  };

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 w-full">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-slate-100">
          Counterpick Mode
        </h1>

        <div className="flex items-center justify-center mb-5">
          <span className="px-3 py-1.5 rounded-full bg-indigo-600/25 border border-indigo-400/40 text-indigo-200 text-sm sm:text-base font-semibold">
            Enemy Lane: {currentRound.scenario.lane}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-slate-200 font-semibold mb-2 text-center sm:text-left">
            Enemy Composition
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {currentRound.enemyTeam.map((enemy) => (
              <div
                key={`${enemy.role}-${enemy.champion.id}`}
                className="rounded-lg border border-slate-700/70 bg-slate-900/85 p-2 flex items-center gap-2"
              >
                <img
                  src={enemy.champion.icon}
                  alt={enemy.champion.name}
                  className="w-10 h-10 rounded-md object-cover border border-slate-600"
                />
                <div className="min-w-0">
                  <p className="text-sm text-slate-100 font-medium truncate">
                    {enemy.champion.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {getDisplayedRole(enemy.role)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 text-center text-slate-300 text-sm sm:text-base">
          Pick the best counter from these 4 champions:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentRound.choices.map((champion) => (
            <button
              key={champion.id}
              onClick={() => handlePick(champion)}
              className={`rounded-xl border p-3 text-left transition ${getButtonStyle(champion)} ${hasAnswered ? "cursor-default" : ""}`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={champion.icon}
                  alt={champion.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-600"
                />
                <div>
                  <p className="text-slate-100 font-semibold">
                    {champion.name}
                  </p>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    {champion.positions.join(" • ")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {hasAnswered && (
          <div
            className={`mt-5 rounded-lg p-4 border ${
              isCorrect
                ? "border-emerald-400/40 bg-emerald-500/10"
                : "border-red-400/30 bg-red-500/10"
            }`}
          >
            <p
              className={`font-semibold mb-2 ${
                isCorrect ? "text-emerald-200" : "text-red-200"
              }`}
            >
              {isCorrect
                ? `Correct! ${currentRound.correct.name} is the best counter here.`
                : `Not quite. You had one attempt — the best counter is ${currentRound.correct.name}.`}
            </p>
            <ul className="list-disc pl-5 text-slate-200 text-sm sm:text-base space-y-1">
              {currentRound.scenario.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          {!hasAnswered ? (
            <button
              onClick={showAnswer}
              className="rounded-lg bg-yellow-600/80 hover:bg-yellow-500 text-white font-semibold px-5 py-2.5 transition"
            >
              Show Answer
            </button>
          ) : (
            <button
              onClick={() => pickNewRound()}
              className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2.5 transition"
            >
              Next Round
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
