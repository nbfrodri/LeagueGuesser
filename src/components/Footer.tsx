export function Footer() {
  return (
    <footer className="w-full border-t border-slate-600/80 bg-slate-900/95 backdrop-blur text-slate-200 py-5 sm:py-6 text-center text-xs sm:text-sm mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.45)]">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="mb-2 leading-relaxed">
          This is a fan-made game based on{" "}
          <a
            href="https://loldle.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
          >
            Loldle
          </a>
          .
        </p>
        <p className="mb-3 leading-relaxed">
          Made by{" "}
          <a
            href="https://github.com/nbfrodri"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300 hover:text-violet-200 underline underline-offset-2"
          >
            nbfrodri
          </a>
        </p>
        <p className="text-slate-300 leading-relaxed">
          "League Guesser" is not endorsed by Riot Games and does not reflect
          the views or opinions of Riot Games or anyone officially involved in
          producing or managing Riot Games properties. Riot Games, and all
          associated properties are trademarks or registered trademarks of Riot
          Games, Inc.
        </p>
      </div>
    </footer>
  );
}
