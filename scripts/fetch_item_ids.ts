import fs from "fs";

const VERSIONS_URL = "https://ddragon.leagueoflegends.com/api/versions.json";

async function main() {
  try {
    const vResp = await fetch(VERSIONS_URL);
    const versions = await vResp.json();
    const version = versions[0];
    console.log("Latest Version:", version);

    const ITEM_URL = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`;
    const iResp = await fetch(ITEM_URL);
    const data = await iResp.json();
    const items = data.data;

    const targetItems = [
      "Profane Hydra",
      "Sundered Sky",
      "Death's Dance",
      "Spear of Shojin",
      "Eclipse",
      "Sterak's Gage",
      "Randuin's Omen",
      "Kaenic Rookern",
      "Plated Steelcaps",
      "Mercury's Treads",
      "Malignance",
      "Sorcerer's Shoes",
      "Stormsurge",
      "Shadowflame",
      "Luden's Companion",
      "Rabadon's Deathcap",
      "Zhonya's Hourglass",
      "Cryptbloom",
      "Void Staff",
      "Horizon Focus",
      "Trinity Force",
      "Dead Man's Plate",
      "Spirit Visage",
      "Manamune",
      "Muramana",
      "Essence Reaver",
      "Navori Quickblades",
      "Serylda's Grudge",
      "Guardian Angel",
      "Ionian Boots of Lucidity",
      "Stridebreaker",
      "Mortal Reminder",
      "Infinity Edge",
      "Experimental Hexplate",
      "Hexplate",
      "Blade of the Ruined King",
      "Guinsoo's Rageblade",
      "Kraken Slayer",
      "Wit's End",
      "Immortal Shieldbow",
      "Berserker's Greaves",
      "Youmuu's Ghostblade",
      "The Collector",
      "Edge of Night",
      "Opportunity",
      "Lord Dominik's Regards",
      "Voltaic Cyclosword",
      "Axiom Arc",
    ];

    const mapping: Record<string, string> = {};

    for (const [id, item] of Object.entries(items)) {
      if (targetItems.includes((item as any).name)) {
        mapping[(item as any).name] = id;
      }
    }

    fs.writeFileSync("temp_ids.json", JSON.stringify(mapping, null, 2));
    console.log("Wrote mapping to temp_ids.json");
  } catch (e) {
    console.error(e);
  }
}

main();
