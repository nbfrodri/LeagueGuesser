export function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-6 text-center text-sm mt-auto">
      <div className="container mx-auto px-4">
        <p className="mb-2">
          This is a fan-made game based on{" "}
          <a
            href="https://loldle.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 hover:text-white underline"
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
