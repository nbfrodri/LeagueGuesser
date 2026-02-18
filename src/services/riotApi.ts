import type { Item, Champion } from "../types";
import { championDetails } from "../data/championDetails";

const VERSIONS_URL = "https://ddragon.leagueoflegends.com/api/versions.json";

// Default fallback version if fetch fails
let LATEST_VERSION = "14.3.1";

async function getLatestVersion(): Promise<string> {
  try {
    const response = await fetch(VERSIONS_URL);
    if (response.ok) {
      const versions = await response.json();
      LATEST_VERSION = versions[0];
    }
  } catch (e) {
    console.error("Failed to fetch version, using fallback", e);
  }
  return LATEST_VERSION;
}

interface RiotItem {
  id: string; // Key in the JSON is the ID
  name: string;
  description: string;
  plaintext: string;
  group?: string;
  into?: string[];
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  gold: { base: number; purchasable: boolean; total: number; sell: number };
  tags: string[];
  maps: { [key: string]: boolean };
  stats: { [key: string]: number };
  from?: string[]; // Component IDs
}

interface RiotChampion {
  id: string; // "Aatrox" (The key used in DDragon)
  key: string; // "266" (Numeric ID)
  name: string;
  title: string;
  image: { full: string };
  // ... other fields not needed given we use manual details
}

export async function fetchItems(): Promise<Item[]> {
  try {
    const version = await getLatestVersion();
    const BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`;
    const IMG_BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/`;

    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch items");

    const data = await response.json();
    const rawItems: { [key: string]: RiotItem } = data.data;

    return Object.entries(rawItems)
      .filter(([, item]) => {
        // Relaxed filter: Just ensure it has a name.
        // Note: item object from DDragon might not have 'id' property strictly, it's the key.
        return !!item.name;
      })
      .map(([id, item]) => {
        // Transform stats keys to readable format
        const stats = Object.keys(item.stats).map((key) =>
          key
            .replace(/Flat|Percent|Mod/g, "")
            .replace(/([A-Z])/g, " $1")
            .trim(),
        );

        // Simple effect extraction from tags or plaintext for now.
        // Parsing "description" HTML is complex.
        // We will use tags and plaintext.
        const effects = [item.plaintext, ...item.tags].filter(Boolean);

        return {
          id: id,
          name: item.name,
          types: item.tags,
          stats: stats,
          cost: item.gold.total,
          effects: effects, // Simplified
          components: item.from || [],
          icon: `${IMG_BASE_URL}${item.image.full}`,
        };
      });
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

export async function fetchChampions(): Promise<Champion[]> {
  try {
    const version = await getLatestVersion();
    const CHAMPION_URL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;
    const CHAMP_IMG_BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/`;

    const response = await fetch(CHAMPION_URL);
    if (!response.ok) throw new Error("Failed to fetch champions");

    const data = await response.json();
    const rawChampions: { [key: string]: RiotChampion } = data.data;

    const champions: Champion[] = [];

    const processedIds = new Set<string>();

    // Iterate over Riot champions and include ALL of them
    for (const [id, riotChamp] of Object.entries(rawChampions)) {
      // Normalize ID to lowercase to match our manual dictionary keys
      const normalizedId = id.toLowerCase();
      const details = championDetails[normalizedId];
      // Mark as processed
      processedIds.add(normalizedId);

      if (details) {
        champions.push({
          id: normalizedId,
          apiId: id, // Original casing (e.g. "Aatrox")
          name: riotChamp.name, // Use official name
          icon: `${CHAMP_IMG_BASE_URL}${riotChamp.image.full}`, // Use official icon
          ...details, // Spread manual details (gender, region, etc.)
        });
      } else {
        // Fallback for champions not in our manual list
        champions.push({
          id: normalizedId,
          apiId: id,
          name: riotChamp.name,
          icon: `${CHAMP_IMG_BASE_URL}${riotChamp.image.full}`,
          gender: "Unknown",
          positions: ["Unknown"],
          species: "Unknown",
          resource: "Unknown",
          rangeType: "Unknown",
          regions: ["Unknown"],
          releaseYear: 0, // 0 indicates unknown
        });
      }
    }

    // Add champions from championDetails that were NOT in the API (Future/Custom)
    // processedIds is already populated in the loop above

    for (const [id, details] of Object.entries(championDetails)) {
      if (!processedIds.has(id)) {
        // Capitalize first letter for name
        const name = id.charAt(0).toUpperCase() + id.slice(1);
        champions.push({
          id: id,
          apiId: name, // Best guess for future/custom is the name itself (capitalized)
          name: name,
          // Try to guess the icon URL based on the name for potential future inclusions
          // or use the generic fallback if it fails to load (client-side)
          icon: `${CHAMP_IMG_BASE_URL}${name}.png`,
          ...details,
        });
      }
    }

    return champions;
  } catch (error) {
    console.error("Error fetching champions:", error);
    return [];
  }
}

export interface ChampionDetail {
  id: string;
  name: string;
  skins: {
    id: string;
    num: number;
    name: string;
    chromas: boolean;
  }[];
  passive: {
    name: string;
    description: string;
    image: { full: string };
  };
  spells: {
    id: string;
    name: string;
    description: string;
    image: { full: string };
  }[];
}

export async function fetchChampionDetail(
  apiId: string,
): Promise<ChampionDetail | null> {
  try {
    const version = await getLatestVersion();
    const URL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${apiId}.json`;
    const response = await fetch(URL);
    if (!response.ok) throw new Error("Failed to fetch champion detail");

    const data = await response.json();
    const champData = data.data[apiId];

    return {
      id: champData.id,
      name: champData.name,
      skins: champData.skins,
      passive: champData.passive,
      spells: champData.spells,
    };
  } catch (e) {
    console.error("Error fetching detail for", apiId, e);
    return null;
  }
}
