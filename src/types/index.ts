export type Gender = "Male" | "Female" | "Other" | "Unknown";
export type Position = "Top" | "Jungle" | "Mid" | "Bot" | "Support" | "Unknown";
export type Species =
  | "Human"
  | "Yordle"
  | "Vastaya"
  | "Undead"
  | "God"
  | "Demon"
  | "Void-born"
  | "Darkin"
  | "Other"
  | "Unknown";
export type Resource =
  | "Mana"
  | "Energy"
  | "Manaless"
  | "Health"
  | "Flow"
  | "Other"
  | "Unknown";
export type RangeType = "Melee" | "Ranged" | "Unknown";
export type Region =
  | "Demacia"
  | "Noxus"
  | "Ionia"
  | "Freljord"
  | "Piltover"
  | "Zaun"
  | "Ixtal"
  | "Shadow Isles"
  | "Bilgewater"
  | "Shurima"
  | "Targon"
  | "Void"
  | "Bandle City"
  | "Runeterra"
  | "Unknown";

export interface Champion {
  id: string;
  apiId: string;
  name: string;
  gender: Gender;
  positions: Position[];
  species: Species;
  resource: Resource;
  rangeType: RangeType;
  regions: Region[];
  releaseYear: number;
  icon: string; // URL or placeholder
}

export interface Item {
  id: string;
  name: string;
  types: string[]; // e.g., "Damage", "Crit"
  stats: string[]; // e.g., "AD", "Health"
  cost: number;
  effects: string[]; // e.g., "Lifeline", "Spellblade" (Names or summaries)
  components: string[]; // IDs of components
  icon: string;
}

export type ComparisonResult =
  | "correct"
  | "partial"
  | "incorrect"
  | "higher"
  | "lower";

export interface ChampionGuessFeedback {
  champion: Champion;
  gender: ComparisonResult;
  position: ComparisonResult;
  species: ComparisonResult;
  resource: ComparisonResult;
  rangeType: ComparisonResult;
  region: ComparisonResult;
  releaseYear: ComparisonResult;
}

export interface ItemGuessFeedback {
  item: Item;
  type: ComparisonResult;
  stats: ComparisonResult;
  cost: ComparisonResult;
  effects: ComparisonResult;
  components: ComparisonResult;
}
