import { fetchItems } from "../src/services/riotApi";

async function main() {
  console.log("--- Debugging API ---");
  try {
    const items = await fetchItems();
    console.log(`Fetched ${items.length} items.`);

    // Check for "Navori" and "Swiftness"
    const others = items.filter(
      (i) => i.name.includes("Navori") || i.name.includes("Swiftness"),
    );
    console.log(
      "Found Navori/Swiftness items:",
      others.map((h) => h.name),
    );

    console.log("--- End Debug ---");
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
