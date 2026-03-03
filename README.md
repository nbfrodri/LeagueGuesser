# 🎮 League Guesser

A fan-made League of Legends guessing game inspired by [Loldle](https://loldle.net/). Built for fun and personal use — this project is not affiliated with or endorsed by Riot Games.

---

## 🕹️ What Is It?

League Guesser is a browser-based trivia game where you test your knowledge of League of Legends champions, abilities, items, and splash arts. It pulls live data directly from the **Riot Games Data Dragon API**, so champion icons, ability images, splash arts, and item data are always sourced from the official game assets.

The app includes a modern dark UI, mobile-responsive layouts, and polished game cards/tables for a better experience on desktop and phones.

### Game Modes

| Mode                 | Description                                                                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Guess Champion**   | Given clues about a champion's attributes (role, region, resource, range type, release year), guess who it is. Each wrong guess reveals how close you are.                                                 |
| **Guess Splash Art** | A zoomed-in, cropped splash art is shown. Guess the champion — wrong guesses zoom out to reveal more. Includes all skins!                                                                                  |
| **Guess Ability**    | An ability icon is shown in **grayscale and rotated**. Guess the champion, then identify which ability slot (P, Q, W, E, R) it belongs to. Wrong guesses progressively fix the rotation and restore color. |
| **Guess Ultimate**   | The **name** of an Ultimate (R) ability is displayed alongside a **very blurry** image of the icon. Guess which champion it belongs to — each wrong guess makes the image clearer.                         |
| **Guess Build**      | Given a set of items (a "build"), guess which champion typically uses them.                                                                                                                                |

---

## 🛠️ Tech Stack

| Technology               | Purpose                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| **React**                | UI framework for building interactive components                  |
| **TypeScript**           | Static typing for safer, more maintainable code                   |
| **Vite**                 | Lightning-fast dev server and build tool                          |
| **Tailwind CSS**         | Utility-first CSS framework for rapid styling                     |
| **Riot Data Dragon API** | Official Riot API for champion data, images, abilities, and items |

---

## 🤖 Built with AI

This project was developed with AI-assisted coding workflows for implementation support, refactoring, and debugging — while all creative decisions and game design were guided by a human developer.

---

## ⚠️ Maintenance & Deprecation Notice

This project was built for **fun and personal use**. As such:

- **New champions** released by Riot Games may not be added immediately (or at all).
- **Game data changes** (item reworks, ability updates, splash art changes) may cause some content to become outdated.
- **The Data Dragon API** URLs or structure could change in future patches, which might break image loading or data fetching.
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

---

## 📜 Disclaimer

This is a **fan-made project** inspired by [Loldle](https://loldle.net/). It is **not** endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. **Riot Games**, **League of Legends**, and all associated properties are trademarks or registered trademarks of **Riot Games, Inc.**
