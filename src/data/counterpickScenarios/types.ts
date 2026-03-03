export type CounterpickLane = "Top" | "Jungle" | "Mid" | "Bot" | "Support";

export interface CounterpickEnemyMember {
  champion: string;
  role: CounterpickLane;
}

export interface CounterpickScenario {
  id: string;
  lane: CounterpickLane;
  enemyComp: [
    CounterpickEnemyMember,
    CounterpickEnemyMember,
    CounterpickEnemyMember,
    CounterpickEnemyMember,
    CounterpickEnemyMember,
  ];
  options: [string, string, string, string];
  correct: string;
  reasons: [string, string, string] | [string, string, string, ...string[]];
}
