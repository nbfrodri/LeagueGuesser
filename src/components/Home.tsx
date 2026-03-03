interface HomeProps {
  onSelectMode: (
    mode: "champion" | "item" | "splash" | "ability" | "ultimate",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
          <button
            onClick={() => onSelectMode("champion")}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
          >
            Guess Champion
          </button>
          <button
            onClick={() => onSelectMode("item")}
            className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
          >
            Guess Build
          </button>
          <button
            onClick={() => onSelectMode("splash")}
            className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
          >
            Guess Splash
          </button>
          <button
            onClick={() => onSelectMode("ability")}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
          >
            Guess Ability
          </button>
          <button
            onClick={() => onSelectMode("ultimate")}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3.5 px-5 text-base sm:text-lg transition-transform hover:scale-[1.02]"
          >
            Guess Ultimate
          </button>
        </div>
      </div>
    </div>
  );
}
