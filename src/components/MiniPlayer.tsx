import { useEffect, useRef, useState } from "react";
import type { TrackWithSource } from "../types/track";

interface Props {
  track: TrackWithSource | null;
  autoplay?: boolean;
  onEnded: () => void;
  onNext: () => void;
}

export function MiniPlayer({ track, autoplay, onEnded, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // При смене трека — перезагружаем и (опционально) стартуем
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.load();
    if (autoplay) {
      audio.play().catch(() => {
        /* браузер может заблокировать — просто ждём клика */
      });
    }
  }, [track?.uidTrack, autoplay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  if (!track) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-6 w-full">
      <audio
        ref={audioRef}
        src={track.audiofile}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded();
        }}
      />

      {/* Play / Pause */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
        className="w-16 h-16 rounded-full bg-gray-900 hover:bg-gray-700 text-white flex items-center justify-center shadow-md transition active:scale-95"
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 ml-0.5"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Следующий */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Следующий"
        className="w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center shadow-md transition active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
          aria-hidden="true"
        >
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>
  );
}
