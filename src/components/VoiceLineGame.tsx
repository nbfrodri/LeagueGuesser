import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { Champion } from "../types";
import {
  fetchChampionVoiceClips,
  fetchChampions,
  type ChampionVoiceClip,
} from "../services/riotApi";
import { SearchBar } from "./SearchBar";
import { VictoryModal } from "./VictoryModal";

type VoiceClipType = "choose" | "ban";

interface VoiceClipOption {
  url: string;
  type: VoiceClipType;
}

interface VoiceRound {
  champion: Champion;
  clips: VoiceClipOption[];
}

function shuffle<T>(arr: T[]): T[] {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function clipTypeLabel(type: VoiceClipType): string {
  if (type === "choose") return "Champion Select";
  return "Ban";
}

export function VoiceLineGame() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [champions, setChampions] = useState<Champion[]>([]);
  const [voiceClips, setVoiceClips] = useState<ChampionVoiceClip[]>([]);
  const [round, setRound] = useState<VoiceRound | null>(null);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  const [guessedChampionIds, setGuessedChampionIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVictory, setIsVictory] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);

  const championsByName = useMemo(
    () => new Map(champions.map((champion) => [champion.name, champion])),
    [champions],
  );

  const availableRounds = useMemo(() => {
    if (championsByName.size === 0 || voiceClips.length === 0) {
      return [] as VoiceRound[];
    }

    return voiceClips
      .map((clip) => {
        const champion = championsByName.get(clip.championName);
        if (!champion) return null;

        const clips = shuffle<VoiceClipOption>([
          { url: clip.chooseAudioUrl, type: "choose" },
          { url: clip.banAudioUrl, type: "ban" },
        ]);

        return {
          champion,
          clips,
        } as VoiceRound;
      })
      .filter((candidate): candidate is VoiceRound => !!candidate);
  }, [championsByName, voiceClips]);

  const startNewRound = (pool: VoiceRound[] = availableRounds) => {
    if (pool.length === 0) {
      setRound(null);
      return;
    }

    const nextRound = pool[Math.floor(Math.random() * pool.length)];
    setRound(nextRound);
    setActiveClipIndex(0);

    setGuessedChampionIds([]);
    setFeedback(null);
    setIsVictory(false);

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [championData, voiceClipData] = await Promise.all([
        fetchChampions(),
        fetchChampionVoiceClips(),
      ]);

      setChampions(championData);
      setVoiceClips(voiceClipData);
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (!loading) {
      startNewRound(availableRounds);
    }
  }, [loading, availableRounds]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !round) return;

    const clip = round.clips[activeClipIndex];
    audio.pause();
    audio.src = clip.url;
    audio.load();

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [round, activeClipIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume]);

  const handleGuess = (guess: Champion) => {
    if (!round || guessedChampionIds.includes(guess.id)) return;

    if (guess.id === round.champion.id) {
      setIsVictory(true);
      setFeedback(null);
      return;
    }

    setGuessedChampionIds((current) => [guess.id, ...current]);
    setFeedback("Not that one. Listen again and try another champion.");
  };

  const showAnswer = () => {
    if (!round) return;
    setIsVictory(true);
    setFeedback(null);
  };

  const handleAudioError = () => {
    if (!round) return;

    if (activeClipIndex < round.clips.length - 1) {
      setActiveClipIndex((current) => current + 1);
      setFeedback(
        "Voice clip unavailable. Switched to an alternate clip automatically.",
      );
      return;
    }

    setFeedback("Audio unavailable right now. Start a new audio round.");
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setFeedback("Playback was blocked. Tap play again to retry.");
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const restartPlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setFeedback("Could not restart audio. Tap play to continue.");
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Number(event.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const activeClip = round?.clips[activeClipIndex];

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-300">
        Loading Voice Line...
      </div>
    );
  }

  if (!round || !activeClip) {
    return (
      <div className="p-4 text-center text-slate-300">
        Unable to load Voice Line data from API.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 w-full">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-slate-100">
          Voice Line Audio Mode
        </h1>
        <p className="text-center text-slate-300 mb-5 text-sm sm:text-base">
          Play the short voice clip and guess the champion.
        </p>

        <div className="rounded-xl border border-indigo-400/30 bg-indigo-600/10 p-4 sm:p-5 mb-6">
          <p className="text-indigo-200 text-xs sm:text-sm mb-3 text-center">
            Current clip type: {clipTypeLabel(activeClip.type)}
          </p>

          <audio
            ref={audioRef}
            preload="none"
            onError={handleAudioError}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration || 0);
            }}
            onTimeUpdate={(event) => {
              setCurrentTime(event.currentTarget.currentTime || 0);
            }}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          >
            <source src={activeClip.url} type="audio/ogg" />
          </audio>

          <div className="rounded-lg border border-indigo-400/25 bg-slate-900/70 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3">
              <button
                onClick={togglePlayback}
                className={`rounded-lg text-white font-semibold px-4 py-2 transition shadow-lg ${
                  isPlaying
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={restartPlayback}
                className="rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 transition"
              >
                Replay
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-slate-300 text-xs">🔊</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 sm:w-24 accent-indigo-500"
                  title={`Volume: ${volume}%`}
                />
                <span className="text-slate-300 text-xs w-7 tabular-nums">
                  {volume}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                step={0.1}
                value={Math.min(currentTime, Math.max(duration, 1))}
                onChange={handleSeek}
                className="w-full accent-indigo-500"
              />
              <span className="text-xs text-slate-300 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {!isVictory && (
          <>
            <SearchBar
              data={champions}
              onSelect={handleGuess}
              getKey={(champion) => champion.name}
              filter={(champion, query) =>
                champion.name.toLowerCase().includes(query.toLowerCase()) &&
                !guessedChampionIds.includes(champion.id)
              }
              placeholder="Which champion says this voice line?"
            />
            <div className="flex justify-center mt-3">
              <button
                onClick={showAnswer}
                className="px-4 py-2 rounded-lg bg-yellow-600/80 hover:bg-yellow-500 text-white font-semibold text-sm transition-colors"
              >
                Show Answer
              </button>
            </div>
          </>
        )}

        {feedback && (
          <div className="mt-2 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-red-200 text-sm sm:text-base">
            {feedback}
          </div>
        )}

        {guessedChampionIds.length >= 2 && !isVictory && (
          <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-amber-200 text-sm sm:text-base">
            Hint: Primary role is{" "}
            <span className="font-semibold">{round.champion.positions[0]}</span>
            .
          </div>
        )}

        {guessedChampionIds.length > 0 && (
          <p className="text-slate-400 text-sm mt-4 text-center">
            Guesses used: {guessedChampionIds.length}
          </p>
        )}

        <div className="mt-5 flex justify-center">
          <button
            onClick={() => startNewRound()}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2.5 transition"
          >
            New Audio Round
          </button>
        </div>
      </div>

      <VictoryModal
        isOpen={isVictory}
        onPlayAgain={() => startNewRound()}
        onClose={() => setIsVictory(false)}
        targetName={round.champion.name}
        targetIcon={round.champion.icon}
      />
    </div>
  );
}
