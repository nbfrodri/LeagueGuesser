import { useEffect, useMemo, useState, type DragEvent } from "react";
import type { Champion } from "../types";
import { fetchChampionDetail, fetchChampions } from "../services/riotApi";
import { VictoryModal } from "./VictoryModal";

type AbilitySlot = "Q" | "W" | "E" | "R";

interface AbilityCard {
  id: string;
  slot: AbilitySlot;
  name: string;
}

interface RoundData {
  champion: Champion;
  cards: AbilityCard[];
}

const ALL_SLOTS: AbilitySlot[] = ["Q", "W", "E", "R"];

function shuffle<T>(arr: T[]): T[] {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function getRandomSlots(count: number): AbilitySlot[] {
  return shuffle(ALL_SLOTS).slice(0, count);
}

export function AbilityOrderGame() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [round, setRound] = useState<RoundData | null>(null);
  const [placements, setPlacements] = useState<
    Partial<Record<AbilitySlot, string>>
  >({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVictory, setIsVictory] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const cardsById = useMemo(() => {
    return new Map((round?.cards ?? []).map((card) => [card.id, card]));
  }, [round]);

  const usedCardIds = useMemo(() => {
    return new Set(
      Object.values(placements).filter((id): id is string => !!id),
    );
  }, [placements]);

  const unplacedCards = useMemo(() => {
    return (round?.cards ?? []).filter((card) => !usedCardIds.has(card.id));
  }, [round, usedCardIds]);

  const startNewRound = async (pool: Champion[] = champions) => {
    if (pool.length === 0) return;

    setLoading(true);
    setFeedback(null);
    setPlacements({});
    setIsVictory(false);
    setSelectedCardId(null);

    let nextRound: RoundData | null = null;

    for (let tries = 0; tries < 25; tries += 1) {
      const champion = pool[Math.floor(Math.random() * pool.length)];
      const detail = await fetchChampionDetail(champion.apiId);

      if (!detail || detail.spells.length < 4) {
        continue;
      }

      const spellBySlot: Record<AbilitySlot, string> = {
        Q: detail.spells[0].name,
        W: detail.spells[1].name,
        E: detail.spells[2].name,
        R: detail.spells[3].name,
      };

      const selectedSlots = getRandomSlots(3);
      const cards = shuffle(
        selectedSlots.map((slot) => ({
          id: `${slot}-${spellBySlot[slot]}`,
          slot,
          name: spellBySlot[slot],
        })),
      );

      nextRound = { champion, cards };
      break;
    }

    setRound(nextRound);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchChampions();
      setChampions(data);
      await startNewRound(data);
    };

    init();
  }, []);

  const assignCardToSlot = (cardId: string, targetSlot: AbilitySlot) => {
    setPlacements((current) => {
      const next: Partial<Record<AbilitySlot, string>> = { ...current };

      for (const slot of ALL_SLOTS) {
        if (next[slot] === cardId) {
          delete next[slot];
        }
      }

      next[targetSlot] = cardId;
      return next;
    });
    setFeedback(null);
  };

  const detachCard = (cardId: string) => {
    setPlacements((current) => {
      const next: Partial<Record<AbilitySlot, string>> = { ...current };
      for (const slot of ALL_SLOTS) {
        if (next[slot] === cardId) {
          delete next[slot];
        }
      }
      return next;
    });
  };

  const handleCardTap = (cardId: string) => {
    setSelectedCardId((current) => (current === cardId ? null : cardId));
    setFeedback(null);
  };

  const handleSlotTap = (slot: AbilitySlot) => {
    if (!selectedCardId || !cardsById.has(selectedCardId)) return;
    assignCardToSlot(selectedCardId, slot);
    setSelectedCardId(null);
  };

  const handleDropOnSlot = (
    event: DragEvent<HTMLDivElement>,
    slot: AbilitySlot,
  ) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain");
    if (!cardId || !cardsById.has(cardId)) return;
    assignCardToSlot(cardId, slot);
    setSelectedCardId(null);
  };

  const handleDropOnPool = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain");
    if (!cardId || !cardsById.has(cardId)) return;

    detachCard(cardId);
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    }
    setFeedback(null);
  };

  const handlePoolTap = () => {
    if (!selectedCardId || !cardsById.has(selectedCardId)) return;
    detachCard(selectedCardId);
    setSelectedCardId(null);
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (!round) return;

    const placedCards = Object.values(placements).filter(
      (id): id is string => !!id,
    );
    if (placedCards.length !== round.cards.length) {
      setFeedback("Place all 3 abilities into their slots before checking.");
      return;
    }

    const isCorrect = round.cards.every(
      (card) => placements[card.slot] === card.id,
    );
    if (isCorrect) {
      setIsVictory(true);
      setFeedback(null);
      return;
    }

    setFeedback("Not quite right. Adjust the placements and try again.");
  };

  const resetPlacements = () => {
    setPlacements({});
    setSelectedCardId(null);
    setFeedback(null);
  };

  const showAnswer = () => {
    if (!round) return;
    // Set correct placements
    const correctPlacements: Partial<Record<AbilitySlot, string>> = {};
    round.cards.forEach((card) => {
      correctPlacements[card.slot] = card.id;
    });
    setPlacements(correctPlacements);
    setIsVictory(true);
    setFeedback(null);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-300">
        Loading Ability Order...
      </div>
    );
  }

  if (!round) {
    return (
      <div className="p-4 text-center text-slate-300">
        Unable to load Ability Order data.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 w-full">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-slate-100">
          Ability Order Mode
        </h1>
        <p className="text-center text-slate-300 mb-6 text-sm sm:text-base">
          <span className="sm:hidden">
            Select/touch/click the 3 ability names and place them into the
            correct Q/W/E/R slots for
          </span>
          <span className="hidden sm:inline">
            Drag or click the 3 ability names into the correct Q/W/E/R slots for
          </span>
          <span className="font-semibold text-cyan-300">
            {" "}
            {round.champion.name}
          </span>
          .
        </p>

        <div
          className="rounded-xl border border-slate-700/70 bg-slate-900/90 p-4 mb-6"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropOnPool}
          onClick={handlePoolTap}
        >
          <p className="text-slate-300 text-sm mb-3">
            <span className="sm:hidden">Ability Cards (select/touch here)</span>
            <span className="hidden sm:inline">
              Ability Cards (drag or click from here)
            </span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {unplacedCards.map((card) => (
              <div
                key={card.id}
                draggable
                onClick={() => handleCardTap(card.id)}
                onDragStart={(event) =>
                  event.dataTransfer.setData("text/plain", card.id)
                }
                className={`cursor-grab active:cursor-grabbing rounded-lg border p-3 text-slate-100 font-medium ${
                  selectedCardId === card.id
                    ? "border-cyan-300 bg-cyan-500/30"
                    : "border-cyan-400/40 bg-cyan-600/15"
                }`}
              >
                {card.name}
              </div>
            ))}
            {unplacedCards.length === 0 && (
              <p className="text-slate-400 text-sm sm:col-span-3">
                All ability cards placed.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ALL_SLOTS.map((slot) => {
            const placedCardId = placements[slot];
            const placedCard = placedCardId
              ? cardsById.get(placedCardId)
              : undefined;

            return (
              <div
                key={slot}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDropOnSlot(event, slot)}
                onClick={() => handleSlotTap(slot)}
                className="rounded-xl border border-slate-700/80 bg-slate-900 p-3 min-h-28"
              >
                <p className="text-cyan-300 font-bold mb-2">{slot}</p>
                {placedCard ? (
                  <div
                    draggable
                    onClick={() => handleCardTap(placedCard.id)}
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", placedCard.id)
                    }
                    className={`cursor-grab active:cursor-grabbing rounded-lg border p-3 text-slate-100 font-medium ${
                      selectedCardId === placedCard.id
                        ? "border-cyan-300 bg-cyan-500/30"
                        : "border-emerald-400/40 bg-emerald-600/20"
                    }`}
                  >
                    {placedCard.name}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-600 p-3 text-slate-500 text-sm">
                    Drop ability here
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {feedback && (
          <div className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-red-200 text-sm sm:text-base">
            {feedback}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={showAnswer}
            className="rounded-lg bg-yellow-600/80 hover:bg-yellow-500 text-white font-semibold px-5 py-2.5 transition"
          >
            Show Answer
          </button>
          <button
            onClick={checkAnswer}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 transition"
          >
            Check Order
          </button>
          <button
            onClick={resetPlacements}
            className="rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 transition"
          >
            Reset
          </button>
          <button
            onClick={() => startNewRound()}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2.5 transition"
          >
            New Round
          </button>
        </div>
      </div>

      <VictoryModal
        isOpen={isVictory}
        onPlayAgain={() => startNewRound()}
        onClose={() => setIsVictory(false)}
        targetName={`${round.champion.name} Ability Order`}
        targetIcon={round.champion.icon}
      />
    </div>
  );
}
