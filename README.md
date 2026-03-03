# 🎮 League Guesser

A fan-made League of Legends guessing game inspired by [Loldle](https://loldle.net/). Built for fun and personal use — this project is not affiliated with or endorsed by Riot Games.

🎮 **[Play Now](https://leagueguesser.vercel.app/)**

---

## 🕹️ What Is It?

League Guesser is a browser-based trivia game where you test your knowledge of League of Legends champions, abilities, items, runes, lore, voice lines, and drafting. It pulls live data primarily from the **Community Dragon API (CDragon)**, which provides champion, item, media, and metadata endpoints used across the game modes.

The app includes a modern dark UI, mobile-responsive layouts, and polished game cards/tables for a better experience on desktop and phones.

### Game Modes

| Mode                      | Description                                                                                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Guess Champion**        | Given clues about a champion's attributes (role, region, resource, range type, release year), guess who it is. Each wrong guess reveals how close you are.                                                 |
| **Guess Splash Art**      | A zoomed-in, cropped splash art is shown. Guess the champion — wrong guesses zoom out to reveal more. Includes all skins!                                                                                  |
| **Guess Ability**         | An ability icon is shown in **grayscale and rotated**. Guess the champion, then identify which ability slot (P, Q, W, E, R) it belongs to. Wrong guesses progressively fix the rotation and restore color. |
| **Guess Ultimate**        | The **name** of an Ultimate (R) ability is displayed alongside a **very blurry** image of the icon. Guess which champion it belongs to — each wrong guess makes the image clearer.                         |
| **Guess Build**           | Given a set of items (a "build"), guess which champion typically uses them.                                                                                                                                |
| **Ability Order Mode**    | Guess a champion from their ability upgrade order and skill progression pattern.                                                                                                                           |
| **Lore Quote Mode**       | Identify the champion from a lore quote excerpt.                                                                                                                                                           |
| **Voice Line Audio Mode** | Listen to champion voice audio and guess who it belongs to. Includes **volume control** to adjust audio levels.                                                                                            |
| **Color Palette Mode**    | Guess the champion from a reduced color-palette representation of their splash art.                                                                                                                        |
| **Region/Faction Mode**   | Guess using region and faction identity clues tied to Runeterra lore.                                                                                                                                      |
| **Counterpick Mode**      | Review a full enemy comp and choose the best counterpick option for the target lane scenario.                                                                                                              |

---

## 🛠️ Tech Stack

| Technology               | Purpose                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| **React**                | UI framework for building interactive components                                             |
| **TypeScript**           | Static typing for safer, more maintainable code                                              |
| **Vite**                 | Lightning-fast dev server and build tool                                                     |
| **Tailwind CSS**         | Utility-first CSS framework for rapid styling                                                |
| **Community Dragon API** | Primary live data source for champions, items, icons, splash/ability assets, and voice media |
| **Riot Data Dragon API** | Legacy source previously used before migrating to Community Dragon                           |

### API Update

- The project has been updated to use **Community Dragon (CDragon)** as the main runtime data source.
- This replaces the earlier **Data Dragon-first** approach for most champion/item/media fetching.
- Existing local static datasets are still used where needed for gameplay logic and fallback values.

---

## 🤖 Built with AI

This project was developed with AI-assisted coding workflows for implementation support, refactoring, and debugging — while all creative decisions and game design were guided by a human developer.

---

## ⚠️ Maintenance & Deprecation Notice

This project was built for **fun and personal use**. As such:

- **New champions** released by Riot Games may not be added immediately (or at all).
- **Game data changes** (item reworks, ability updates, splash art changes) may cause some content to become outdated.
- **Community Dragon (or Riot-backed data formats)** can change in future patches, which might break image loading or data fetching.
- **No guaranteed updates.** Since this is a hobby project, there is no commitment to keeping it up-to-date with every League of Legends patch.

If something breaks after a new patch, it's likely because Riot updated their API or data structure. Feel free to fork and fix!

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/nbfrodri/LeagueGuesser.git

# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

### Available Scripts

- `npm run dev`: Start the Vite development server.
- `npm run build`: Validate counterpick scenarios, run TypeScript build, then build production assets.
- `npm run validate:counterpick`: Validate Counterpick Mode scenario integrity (ids, lanes, champions, options).
- `npm run lint`: Run ESLint.
- `npm run preview`: Preview the production build locally.

---

## 📜 Disclaimer

This is a **fan-made project** inspired by [Loldle](https://loldle.net/). It is **not** endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. **Riot Games**, **League of Legends**, and all associated properties are trademarks or registered trademarks of **Riot Games, Inc.**
