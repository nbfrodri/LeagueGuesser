import { useEffect } from "react";

interface VictoryModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
  targetName: string;
  targetIcon?: string;
}

export function VictoryModal({
  isOpen,
  onPlayAgain,
  onClose,
  targetName,
  targetIcon,
}: VictoryModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        // Close modal first, then start new game
        onClose();
        // Small delay to ensure modal closes before new game starts
        setTimeout(() => {
          onPlayAgain();
        }, 50);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900/95 border border-slate-700 p-5 sm:p-6 rounded-2xl shadow-2xl shadow-black/50 text-center max-w-sm w-full mx-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-emerald-400">
          Victory!
        </h2>

        {targetIcon && (
          <div className="flex justify-center mb-4">
            <img
              src={targetIcon}
              alt={targetName}
              className="w-24 h-24 rounded-full border-4 border-emerald-400 object-cover"
            />
          </div>
        )}

        <p className="text-lg mb-4 text-slate-200">
          You correctly guessed{" "}
          <span className="font-bold text-cyan-300">{targetName}</span>!
        </p>

        <p className="text-xs sm:text-sm mb-6 text-slate-400">
          Press{" "}
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-emerald-400 font-semibold">
            R
          </kbd>{" "}
          to play again
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={onPlayAgain}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-500 transition-colors font-semibold shadow-lg shadow-emerald-950/50"
          >
            Play Again
          </button>
          <button
            onClick={onClose}
            className="bg-slate-700 text-slate-100 px-6 py-2.5 rounded-lg hover:bg-slate-600 transition-colors font-semibold shadow-lg shadow-black/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
