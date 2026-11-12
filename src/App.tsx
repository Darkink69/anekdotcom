import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTracks } from "./hooks/useTracks";
import { pickRandomTrack } from "./utils/random";
import { searchByTags } from "./utils/search";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./components/SearchResults";
import { AudioPlayer } from "./components/AudioPlayer";
import { MiniPlayer } from "./components/MiniPlayer";
import { MAX_RESULTS } from "./constants";
import type { TrackWithSource } from "./types/track";

export default function App() {
  const { tracksBySource, allTracks, loading, error } = useTracks();

  const [current, setCurrent] = useState<TrackWithSource | null>(null);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [visibleCount, setVisibleCount] = useState(MAX_RESULTS);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ended, setEnded] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipError, setPipError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // ---- Первичная инициализация ----
  useEffect(() => {
    if (initializedRef.current) return;
    if (allTracks.length === 0) return;
    initializedRef.current = true;
    const t = pickRandomTrack(tracksBySource);
    if (t) {
      setCurrent(t);
      setCurrentTime(0);
      setDuration(t.duration);
      setEnded(false);
    }
  }, [allTracks.length, tracksBySource]);

  // ---- Поиск ----
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchByTags(allTracks, query);
  }, [query, allTracks]);

  const handleQueryChange = (v: string) => {
    setQuery(v);
    setShowResults(v.trim().length > 0);
    setVisibleCount(MAX_RESULTS);
  };

  const handleClear = () => {
    setQuery("");
    setShowResults(false);
    setVisibleCount(MAX_RESULTS);
  };

  const handleSelectResult = (track: TrackWithSource) => {
    setCurrent(track);
    setCurrentTime(0);
    setDuration(track.duration);
    setEnded(false);
  };

  const handlePlayNext = useCallback(() => {
    const t = pickRandomTrack(tracksBySource);
    if (t) {
      setCurrent(t);
      setCurrentTime(0);
      setDuration(t.duration);
      setEnded(false);
    }
  }, [tracksBySource]);

  const handleEnded = useCallback(() => {
    if (autoNext) {
      handlePlayNext();
    } else {
      setEnded(true);
    }
  }, [autoNext, handlePlayNext]);

  const handlePlayClick = useCallback(() => {
    if (ended) {
      setEnded(false);
      handlePlayNext();
    }
  }, [ended, handlePlayNext]);

  const handleTimeUpdate = useCallback((cur: number, dur: number) => {
    setCurrentTime(cur);
    if (dur && !Number.isNaN(dur) && dur !== Infinity) setDuration(dur);
  }, []);

  // ---- Document Picture-in-Picture ----
  const openMiniPlayer = useCallback(async () => {
    setPipError(null);

    const dpip = window.documentPictureInPicture;
    if (!dpip) {
      setPipError(
        "Ваш браузер не поддерживает мини-плеер (Document PiP). Используйте Chrome/Edge.",
      );
      return;
    }
    if (dpip.window) {
      dpip.window.focus();
      return;
    }

    try {
      const win = await dpip.requestWindow({
        width: 260,
        height: 160,
        disallowReturnToOpener: false,
      });

      // Копируем стили
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const cssRules = Array.from(sheet.cssRules)
            .map((r) => r.cssText)
            .join("\n");
          const styleEl = win.document.createElement("style");
          styleEl.textContent = cssRules;
          win.document.head.appendChild(styleEl);
        } catch {
          if (sheet.href) {
            const link = win.document.createElement("link");
            link.rel = "stylesheet";
            link.href = sheet.href;
            win.document.head.appendChild(link);
          }
        }
      }

      const meta = win.document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0";
      win.document.head.appendChild(meta);
      win.document.title = "Мини-плеер";

      win.document.body.style.margin = "0";
      win.document.body.style.background = "#ffffff";
      win.document.body.style.height = "100%";

      const root = win.document.createElement("div");
      root.id = "pip-root";
      root.style.height = "100%";
      root.style.display = "flex";
      root.style.alignItems = "center";
      root.style.justifyContent = "center";
      root.style.padding = "12px";
      win.document.body.appendChild(root);

      win.addEventListener("pagehide", () => setPipWindow(null));
      setPipWindow(win);
    } catch (e) {
      setPipError((e as Error).message || "Не удалось открыть мини-плеер");
    }
  }, []);

  const closeMiniPlayer = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [pipWindow]);

  // ---- Загрузка / ошибки ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Загрузка…
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Ошибка: {error}
      </div>
    );
  }

  // ---- Основной плеер (полная версия) ----
  const mainPlayerBlock = (
    <div className="w-full">
      <AudioPlayer
        track={current}
        onEnded={handleEnded}
        onPlayClick={handlePlayClick}
        onTimeUpdate={handleTimeUpdate}
        currentTime={currentTime}
        duration={duration}
      />
      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={handlePlayNext}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
        >
          Следующий →
        </button>
        {pipWindow ? (
          <button
            type="button"
            onClick={closeMiniPlayer}
            className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
          >
            Закрыть мини-плеер
          </button>
        ) : (
          <button
            type="button"
            onClick={openMiniPlayer}
            className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
          >
            Открыть мини-плеер
          </button>
        )}
      </div>

      {/* Настройка «Включать следующий» */}
      <label className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={autoNext}
          onChange={(e) => setAutoNext(e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        Включать следующий
      </label>
    </div>
  );

  // ---- Упрощённый плеер (в PiP) ----
  const miniPlayerBlock = (
    <MiniPlayer
      track={current}
      autoplay
      onEnded={handleEnded}
      onNext={handlePlayNext}
    />
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          onClear={handleClear}
        />

        {showResults && (
          <SearchResults
            results={results}
            visible={visibleCount}
            currentUid={current?.uidTrack ?? null}
            onSelect={handleSelectResult}
            onShowMore={() => setVisibleCount((v) => v + MAX_RESULTS)}
          />
        )}

        <div className="mt-10 flex flex-col items-center">
          {pipError && (
            <div className="mb-4 text-sm text-red-600 max-w-md text-center">
              {pipError}
            </div>
          )}

          {pipWindow
            ? (() => {
                const mount = pipWindow.document.getElementById("pip-root");
                if (!mount) return null;
                return createPortal(miniPlayerBlock, mount);
              })()
            : mainPlayerBlock}
        </div>
      </div>
    </div>
  );
}
