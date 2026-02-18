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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Victory!</h2>

        {targetIcon && (
          <div className="flex justify-center mb-4">
            <img
              src={targetIcon}
              alt={targetName}
              className="w-24 h-24 rounded-full border-4 border-green-500 object-cover"
            />
          </div>
        )}

        <p className="text-lg mb-6 text-gray-800">
          You correctly guessed{" "}
          <span className="font-bold text-blue-600">{targetName}</span>!
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onPlayAgain}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
          >
            Play Again
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
