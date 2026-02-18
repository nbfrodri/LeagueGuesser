interface HomeProps {
  onSelectMode: (
    mode: "champion" | "item" | "splash" | "ability" | "ultimate",
  ) => void;
}

export function Home({ onSelectMode }: HomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-900">
        League of Legends Guesser
      </h1>
      <div className="flex flex-col sm:flex-row gap-6">
        <button
          onClick={() => onSelectMode("champion")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-xl transition-transform transform hover:scale-105"
        >
          Guess Champion
        </button>
        <button
          onClick={() => onSelectMode("item")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-xl transition-transform transform hover:scale-105"
        >
          Guess Build
        </button>
        <button
          onClick={() => onSelectMode("splash")}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-xl transition-transform transform hover:scale-105"
        >
          Guess Splash
        </button>
        <button
          onClick={() => onSelectMode("ability")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-xl transition-transform transform hover:scale-105"
        >
          Guess Ability
        </button>
        <button
          onClick={() => onSelectMode("ultimate")}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-xl transition-transform transform hover:scale-105"
        >
          Guess Ultimate
        </button>
      </div>
    </div>
  );
}
