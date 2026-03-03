import type { Item, Champion } from "../types";
import { championDetails } from "../data/championDetails";

const CDRAGON_ROOT_URL =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default";
const CDRAGON_BASE_URL = `${CDRAGON_ROOT_URL}/v1`;
const CDRAGON_CHAMPION_SUMMARY_URL = `${CDRAGON_BASE_URL}/champion-summary.json`;
const CDRAGON_ITEMS_URL = `${CDRAGON_BASE_URL}/items.json`;

const CHAMPION_ID_ALIASES: Record<string, string> = {
  monkeyking: "wukong",
};

function normalizeChampionId(id: string): string {
  const lowered = id.toLowerCase();
  return CHAMPION_ID_ALIASES[lowered] ?? lowered;
}

function toCommunityDragonAssetUrl(path: string | undefined): string {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const withoutPrefix = path.replace(/^\/lol-game-data\/assets\//i, "");
  const normalized = (
    withoutPrefix.startsWith("/") ? withoutPrefix.slice(1) : withoutPrefix
  ).toLowerCase();

  return `${CDRAGON_ROOT_URL}/${normalized}`;
}

interface CommunityDragonItem {
  id: number;
  name: string;
  description: string;
  active?: boolean;
  price?: number;
  priceTotal?: number;
  categories?: string[];
  from?: number[];
  iconPath?: string;
  stats?: Record<string, number>;
}

interface CDragonChampionSummary {
  id: number;
  alias: string;
  name: string;
  squarePortraitPath?: string;
}

function isExcludedChampionSummary(champion: CDragonChampionSummary): boolean {
  const alias = champion.alias.toLowerCase();
  const name = champion.name.toLowerCase();

  return alias.startsWith("ruby_") || name.startsWith("doom bot");
}

interface CommunityDragonChampionSpell {
  spellKey?: string;
  name?: string;
  description?: string;
  abilityIconPath?: string;
}

interface CommunityDragonChampionDetail {
  id?: number;
  alias?: string;
  name?: string;
  title?: string;
  shortBio?: string;
  skins?: {
    id: number | string;
    name: string;
    chromas?: boolean;
    splashPath?: string;
    uncenteredSplashPath?: string;
  }[];
  passive?: {
    name?: string;
    description?: string;
    abilityIconPath?: string;
  };
  spells?: CommunityDragonChampionSpell[];
}

export interface ChampionVoiceClip {
  championName: string;
  chooseAudioUrl: string;
  banAudioUrl: string;
}

export async function fetchItems(): Promise<Item[]> {
  try {
    const response = await fetch(CDRAGON_ITEMS_URL);
    if (!response.ok) throw new Error("Failed to fetch items");

    const items = (await response.json()) as CommunityDragonItem[];

    return items
      .filter((item) => !!item.name && item.id > 0)
      .map((item) => {
        const statLabels = Object.keys(item.stats ?? {}).map((key) =>
          key
            .replace(/Flat|Percent|Mod/g, "")
            .replace(/([A-Z])/g, " $1")
            .trim(),
        );

        const effects = [item.description, ...(item.categories ?? [])].filter(
          Boolean,
        );

        return {
          id: String(item.id),
          name: item.name,
          types: item.categories ?? [],
          stats: statLabels,
          cost: item.priceTotal ?? item.price ?? 0,
          effects,
          components: (item.from ?? []).map(String),
          icon:
            toCommunityDragonAssetUrl(item.iconPath) ||
            `${CDRAGON_BASE_URL}/item-icons/${item.id}.png`,
        };
      });
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

export async function fetchChampions(): Promise<Champion[]> {
  try {
    const response = await fetch(CDRAGON_CHAMPION_SUMMARY_URL);
    if (!response.ok) throw new Error("Failed to fetch champions");

    const rawChampions = (await response.json()) as CDragonChampionSummary[];

    const champions: Champion[] = [];

    const processedIds = new Set<string>();

    for (const champ of rawChampions.filter(
      (entry) => entry.id > 0 && !isExcludedChampionSummary(entry),
    )) {
      const normalizedId = normalizeChampionId(champ.alias);
      const details = championDetails[normalizedId];
      processedIds.add(normalizedId);

      if (details) {
        champions.push({
          id: normalizedId,
          apiId: champ.alias,
          name: champ.name,
          icon:
            toCommunityDragonAssetUrl(champ.squarePortraitPath) ||
            `${CDRAGON_BASE_URL}/champion-icons/${champ.id}.png`,
          ...details,
        });
      } else {
        champions.push({
          id: normalizedId,
          apiId: champ.alias,
          name: champ.name,
          icon:
            toCommunityDragonAssetUrl(champ.squarePortraitPath) ||
            `${CDRAGON_BASE_URL}/champion-icons/${champ.id}.png`,
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

    for (const [id, details] of Object.entries(championDetails)) {
      if (!processedIds.has(id)) {
        const name = id.charAt(0).toUpperCase() + id.slice(1);
        champions.push({
          id: id,
          apiId: name,
          name: name,
          icon: `${CDRAGON_BASE_URL}/champion-icons/-1.png`,
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

export async function fetchChampionVoiceClips(): Promise<ChampionVoiceClip[]> {
  try {
    const summaryUrl =
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json";
    const baseUrl =
      "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1";

    const response = await fetch(summaryUrl);
    if (!response.ok) throw new Error("Failed to fetch champion summary");

    const summary = (await response.json()) as CDragonChampionSummary[];

    return summary
      .filter(
        (champion) => champion.id > 0 && !isExcludedChampionSummary(champion),
      )
      .map((champion) => ({
        championName: champion.name,
        chooseAudioUrl: `${baseUrl}/champion-choose-vo/${champion.id}.ogg`,
        banAudioUrl: `${baseUrl}/champion-ban-vo/${champion.id}.ogg`,
      }));
  } catch (error) {
    console.error("Error fetching champion voice clips:", error);
    return [];
  }
}

export interface ChampionDetail {
  id: string;
  name: string;
  title: string;
  lore: string;
  skins: {
    id: string;
    num: number;
    name: string;
    chromas: boolean;
    splashPath?: string;
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

let championIdByAliasCache: Record<string, number> | null = null;

async function getChampionIdByAlias(): Promise<Record<string, number>> {
  if (championIdByAliasCache) {
    return championIdByAliasCache;
  }

  const response = await fetch(CDRAGON_CHAMPION_SUMMARY_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch champion summary");
  }

  const summary = (await response.json()) as CDragonChampionSummary[];
  championIdByAliasCache = Object.fromEntries(
    summary
      .filter(
        (champion) => champion.id > 0 && !isExcludedChampionSummary(champion),
      )
      .map((champion) => [champion.alias.toLowerCase(), champion.id]),
  );

  return championIdByAliasCache;
}

export async function fetchChampionDetail(
  apiId: string,
): Promise<ChampionDetail | null> {
  try {
    const idByAlias = await getChampionIdByAlias();
    const championId = idByAlias[apiId.toLowerCase()];
    if (!championId) {
      throw new Error(`No CommunityDragon champion id found for ${apiId}`);
    }

    const url = `${CDRAGON_BASE_URL}/champions/${championId}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch champion detail");

    const champData = (await response.json()) as CommunityDragonChampionDetail;

    return {
      id: String(champData.id ?? championId),
      name: champData.name ?? apiId,
      title: champData.title ?? "",
      lore: champData.shortBio ?? "",
      skins: (champData.skins ?? []).map((skin, index) => ({
        id: String(skin.id ?? index),
        num: index,
        name: skin.name,
        chromas: Boolean(skin.chromas),
        splashPath: toCommunityDragonAssetUrl(
          skin.splashPath ?? skin.uncenteredSplashPath,
        ),
      })),
      passive: {
        name: champData.passive?.name ?? "",
        description: champData.passive?.description ?? "",
        image: {
          full: toCommunityDragonAssetUrl(champData.passive?.abilityIconPath),
        },
      },
      spells: (champData.spells ?? []).map((spell, index) => ({
        id: spell.spellKey ?? String(index),
        name: spell.name ?? "",
        description: spell.description ?? "",
        image: { full: toCommunityDragonAssetUrl(spell.abilityIconPath) },
      })),
    };
  } catch (e) {
    console.error("Error fetching detail for", apiId, e);
    return null;
  }
}

/**
 * Fetches champion build from CommunityDragon API.
 * Returns an array of item IDs (as strings) for the recommended build.
 * Returns empty array if no build data is available or on error.
 */
export async function fetchChampionBuild(apiId: string): Promise<string[]> {
  try {
    const idByAlias = await getChampionIdByAlias();
    const championId = idByAlias[apiId.toLowerCase()];
    if (!championId) {
      console.warn(`No CommunityDragon champion id found for ${apiId}`);
      return [];
    }

    const url = `${CDRAGON_BASE_URL}/champions/${championId}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch champion detail for ${apiId}`);
      return [];
    }

    const champData = await response.json();

    // Try to extract recommended items from the champion data
    // CommunityDragon may have recommendedItemDefaults or other build data
    const recommendedItems = champData.recommendedItemDefaults;

    if (Array.isArray(recommendedItems) && recommendedItems.length > 0) {
      // Extract item IDs and convert to strings
      const itemIds = recommendedItems
        .filter((item: any) => item && typeof item === "number")
        .map((id: number) => String(id));

      return itemIds;
    }

    // If no recommended items found, return empty array
    return [];
  } catch (e) {
    console.warn("Error fetching build for", apiId, e);
    return [];
  }
}

export interface ChampionRunePage {
  keystoneId: string;
  primaryRunes: string[]; // Array of rune IDs
  secondaryRunes: string[]; // Array of rune IDs
}

/**
 * Fetches champion rune data from CommunityDragon API.
 * Returns rune IDs if available, empty object if not.
 */
export async function fetchChampionRunes(
  apiId: string,
): Promise<ChampionRunePage | null> {
  try {
    const idByAlias = await getChampionIdByAlias();
    const championId = idByAlias[apiId.toLowerCase()];
    if (!championId) {
      console.warn(`No CommunityDragon champion id found for ${apiId}`);
      return null;
    }

    const url = `${CDRAGON_BASE_URL}/champions/${championId}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch champion detail for ${apiId}`);
      return null;
    }

    const champData = await response.json();

    // Try to extract recommended runes from the champion data
    // CommunityDragon may have recommendedRuneSetup or similar
    const runeSetup = champData.recommendedRuneSetup;

    if (runeSetup) {
      return {
        keystoneId: String(runeSetup.keystoneId || ""),
        primaryRunes: (runeSetup.primaryRunes || []).map((id: number) =>
          String(id),
        ),
        secondaryRunes: (runeSetup.secondaryRunes || []).map((id: number) =>
          String(id),
        ),
      };
    }

    // If no recommended runes found, return null
    return null;
  } catch (e) {
    console.warn("Error fetching runes for", apiId, e);
    return null;
  }
}
