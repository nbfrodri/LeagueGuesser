interface HomeProps {
  onSelectMode: (
    mode:
      | "champion"
      | "item"
      | "splash"
      | "ability"
      | "ability-order"
      | "lore-quote"
      | "voice-line"
      | "color-palette"
      | "region-faction"
      | "ultimate"
      | "counterpick",
  ) => void;
}

export function Home({ onSelectMode }: HomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-5 sm:p-8">
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-300/80 mb-2">
            LeagueGuesser
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-50">
            Choose Your Challenge
          </h1>
          <p className="text-slate-300 mt-3 text-sm sm:text-base">
            Test your League knowledge with multiple game modes.
          </p>
        </div>

        {/* EASY DIFFICULTY */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-emerald-500/50"></div>
            <span className="px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
              EASY
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-emerald-500/50"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
            <button
              onClick={() => onSelectMode("champion")}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Guess Champion
            </button>
            <button
              onClick={() => onSelectMode("ultimate")}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Guess Ultimate
            </button>
            <button
              onClick={() => onSelectMode("splash")}
              className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Guess Splash
            </button>
          </div>
        </div>

        {/* MEDIUM DIFFICULTY */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/50"></div>
            <span className="px-3 py-1 rounded-full bg-yellow-600/20 border border-yellow-500/40 text-yellow-300 font-bold text-sm">
              MEDIUM
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/50"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
            <button
              onClick={() => onSelectMode("item")}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Guess Build
            </button>
            <button
              onClick={() => onSelectMode("ability")}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Guess Ability
            </button>
            <button
              onClick={() => onSelectMode("color-palette")}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Color Palette Mode
            </button>
            <button
              onClick={() => onSelectMode("region-faction")}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Region/Faction Mode
            </button>
          </div>
        </div>

        {/* HARD DIFFICULTY */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-rose-500/50"></div>
            <span className="px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-sm">
              HARD
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-rose-500/50"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
            <button
              onClick={() => onSelectMode("ability-order")}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Ability Order Mode
            </button>
            <button
              onClick={() => onSelectMode("lore-quote")}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Lore Quote Mode
            </button>
            <button
              onClick={() => onSelectMode("voice-line")}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Voice Line Audio Mode
            </button>
            <button
              onClick={() => onSelectMode("counterpick")}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
            >
              Counterpick Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
