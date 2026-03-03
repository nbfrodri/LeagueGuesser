import { counterpickScenarios } from "../src/data/counterpickScenarios";
import { fetchChampions } from "../src/services/riotApi";

const ALL_ROLES = ["Top", "Jungle", "Mid", "Bot", "Support"] as const;

async function main() {
  const champions = await fetchChampions();
  const championNames = new Set(champions.map((champion) => champion.name));

  const errors: string[] = [];
  const ids = new Set<string>();
  const laneCounts: Record<string, number> = {
    Top: 0,
    Jungle: 0,
    Mid: 0,
    Bot: 0,
    Support: 0,
  };

  for (const scenario of counterpickScenarios) {
    laneCounts[scenario.lane] = (laneCounts[scenario.lane] ?? 0) + 1;

    if (ids.has(scenario.id)) {
      errors.push(`[${scenario.id}] Duplicate scenario id.`);
    }
    ids.add(scenario.id);

    if (scenario.enemyComp.length !== 5) {
      errors.push(
        `[${scenario.id}] Enemy comp must contain exactly 5 members, got ${scenario.enemyComp.length}.`,
      );
    }

    const rolesInEnemyComp = scenario.enemyComp.map((enemy) => enemy.role);
    const uniqueRoles = new Set(rolesInEnemyComp);
    if (uniqueRoles.size !== 5) {
      errors.push(
        `[${scenario.id}] Enemy comp roles must be unique (Top/Jungle/Mid/Bot/Support).`,
      );
    }

    for (const role of ALL_ROLES) {
      if (!uniqueRoles.has(role)) {
        errors.push(`[${scenario.id}] Enemy comp is missing role ${role}.`);
      }
    }

    const enemyChampionNames = scenario.enemyComp.map(
      (enemy) => enemy.champion,
    );
    const uniqueEnemyChamps = new Set(enemyChampionNames);
    if (uniqueEnemyChamps.size !== enemyChampionNames.length) {
      errors.push(`[${scenario.id}] Enemy comp contains duplicate champions.`);
    }

    for (const enemyName of enemyChampionNames) {
      if (!championNames.has(enemyName)) {
        errors.push(
          `[${scenario.id}] Enemy champion \"${enemyName}\" not found in champion dataset.`,
        );
      }
    }

    if (scenario.options.length !== 4) {
      errors.push(
        `[${scenario.id}] Options must contain exactly 4 champions, got ${scenario.options.length}.`,
      );
    }

    const uniqueOptions = new Set(scenario.options);
    if (uniqueOptions.size !== scenario.options.length) {
      errors.push(`[${scenario.id}] Options contain duplicate champions.`);
    }

    if (!scenario.options.includes(scenario.correct)) {
      errors.push(
        `[${scenario.id}] Correct champion \"${scenario.correct}\" is not present in options.`,
      );
    }

    for (const optionName of scenario.options) {
      if (!championNames.has(optionName)) {
        errors.push(
          `[${scenario.id}] Option champion \"${optionName}\" not found in champion dataset.`,
        );
      }
    }

    if (scenario.reasons.length < 3) {
      errors.push(
        `[${scenario.id}] Reasons must contain at least 3 explanations.`,
      );
    }
  }

  if (errors.length > 0) {
    console.error("\nCounterpick validation failed:\n");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("\nCounterpick validation passed.");
  console.log(`Scenarios: ${counterpickScenarios.length}`);
  console.log(
    `By lane -> Top: ${laneCounts.Top}, Jungle: ${laneCounts.Jungle}, Mid: ${laneCounts.Mid}, Bot: ${laneCounts.Bot}, Support: ${laneCounts.Support}`,
  );
}

main().catch((error) => {
  console.error("Counterpick validation crashed:", error);
  process.exit(1);
});
