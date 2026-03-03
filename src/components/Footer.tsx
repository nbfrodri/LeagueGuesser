export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/80 text-slate-400 py-5 sm:py-6 text-center text-xs sm:text-sm mt-auto">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="mb-2">
          This is a fan-made game based on{" "}
          <a
            href="https://loldle.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 hover:text-cyan-200 underline"
          >
            Loldle
          </a>
          .
        </p>
        <p>
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
