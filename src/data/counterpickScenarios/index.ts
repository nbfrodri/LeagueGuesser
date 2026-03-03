import { botCounterpickScenarios } from "./bot";
import { jungleCounterpickScenarios } from "./jungle";
import { midCounterpickScenarios } from "./mid";
import { supportCounterpickScenarios } from "./support";
import { topCounterpickScenarios } from "./top";
import type { CounterpickScenario } from "./types";

export type { CounterpickScenario, CounterpickLane } from "./types";

export const counterpickScenariosByLane = {
  Top: topCounterpickScenarios,
  Jungle: jungleCounterpickScenarios,
  Mid: midCounterpickScenarios,
  Bot: botCounterpickScenarios,
  Support: supportCounterpickScenarios,
} as const;

export const counterpickScenarios: CounterpickScenario[] = [
  ...counterpickScenariosByLane.Top,
  ...counterpickScenariosByLane.Jungle,
  ...counterpickScenariosByLane.Mid,
  ...counterpickScenariosByLane.Bot,
  ...counterpickScenariosByLane.Support,
];

const seenIds = new Set<string>();
for (const scenario of counterpickScenarios) {
  if (seenIds.has(scenario.id)) {
    throw new Error(
      `Duplicate counterpick scenario id detected: ${scenario.id}`,
    );
  }
  seenIds.add(scenario.id);
}
