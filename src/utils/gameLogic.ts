import type {
  Champion,
  Item,
  ComparisonResult,
  ChampionGuessFeedback,
  ItemGuessFeedback,
} from "../types";

// Helper to determine array partial/exact match
export function compareArrays(
  target: string[],
  guess: string[],
): ComparisonResult {
  const targetSet = new Set(target);
  const guessSet = new Set(guess);

  // Exact match: sets are identical
  if (
    targetSet.size === guessSet.size &&
    [...targetSet].every((x) => guessSet.has(x))
  ) {
    return "correct";
  }

  // Partial match: guess shares at least one element with target
  const hasIntersection = [...guessSet].some((x) => targetSet.has(x));
  if (hasIntersection) {
    return "partial";
  }

  return "incorrect";
}

export function compareChampions(
  target: Champion,
  guess: Champion,
): ChampionGuessFeedback {
  return {
    champion: guess,
    gender: target.gender === guess.gender ? "correct" : "incorrect",
    position: compareArrays(target.positions, guess.positions),
    species: target.species === guess.species ? "correct" : "incorrect",
    resource: target.resource === guess.resource ? "correct" : "incorrect",
    rangeType: target.rangeType === guess.rangeType ? "correct" : "incorrect",
    region: compareArrays(target.regions, guess.regions),
    releaseYear:
      target.releaseYear === guess.releaseYear
        ? "correct"
        : target.releaseYear > guess.releaseYear
          ? "higher"
          : "lower",
  };
}

export function compareItems(target: Item, guess: Item): ItemGuessFeedback {
  return {
    item: guess,
    type: compareArrays(target.types, guess.types),
    stats: compareArrays(target.stats, guess.stats),
    cost:
      target.cost === guess.cost
        ? "correct"
        : target.cost > guess.cost
          ? "higher"
          : "lower",
    effects: compareArrays(target.effects, guess.effects),
    components: compareArrays(target.components, guess.components),
  };
}
