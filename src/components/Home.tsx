interface HomeProps {
  onSelectMode: (
    mode: "champion" | "item" | "splash" | "ability" | "ultimate",
  ) => void;
}

export function Home({ onSelectMode }: HomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-blue-900 text-center">
        League of Legends Guesser
      </h1>
      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4 sm:gap-6 w-full max-w-5xl">
        <button
          onClick={() => onSelectMode("champion")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg text-lg sm:text-xl transition-transform transform hover:scale-105 w-full sm:w-auto"
        >
          Guess Champion
        </button>
        <button
          onClick={() => onSelectMode("item")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg text-lg sm:text-xl transition-transform transform hover:scale-105 w-full sm:w-auto"
        >
          Guess Build
        </button>
        <button
          onClick={() => onSelectMode("splash")}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg text-lg sm:text-xl transition-transform transform hover:scale-105 w-full sm:w-auto"
        >
          Guess Splash
        </button>
        <button
          onClick={() => onSelectMode("ability")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg text-lg sm:text-xl transition-transform transform hover:scale-105 w-full sm:w-auto"
        >
          Guess Ability
        </button>
        <button
          onClick={() => onSelectMode("ultimate")}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg text-lg sm:text-xl transition-transform transform hover:scale-105 w-full sm:w-auto"
        >
          Guess Ultimate
        </button>
      </div>
    </div>
  );
}
