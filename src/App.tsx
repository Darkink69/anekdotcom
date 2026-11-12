import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTracks } from "./hooks/useTracks";
import { pickRandomTrack } from "./utils/random";
import { searchByTags } from "./utils/search";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./components/SearchResults";
import { AudioPlayer } from "./components/AudioPlayer";
import { MAX_RESULTS } from "./constants";
import type { TrackWithSource } from "./types/track";

export default function App() {
  const { tracksBySource, allTracks, loading, error } = useTracks();

  const [current, setCurrent] = useState<TrackWithSource | null>(null);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ended, setEnded] = useState(false);
  const initializedRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(MAX_RESULTS);

  // Первичная инициализация — случайный трек с приоритетом anekdot
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

  // Поиск
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchByTags(allTracks, query);
  }, [query, allTracks]);

  const handleQueryChange = (v: string) => {
    setQuery(v);
    setShowResults(v.trim().length > 0);
    setVisibleCount(MAX_RESULTS); // сброс только при новом вводе
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

  const handlePlayNext = () => {
    // Случайный трек с приоритетом anekdot
    const t = pickRandomTrack(tracksBySource);
    if (t) {
      setCurrent(t);
      setCurrentTime(0);
      setDuration(t.duration);
      setEnded(false);
    }
  };

  const handleEnded = useCallback(() => {
    setEnded(true);
  }, []);

  const handlePlayClick = useCallback(() => {
    if (ended) {
      // При нажатии play после окончания — новый случайный трек
      setEnded(false);
      handlePlayNext();
    }
  }, [ended]);

  const handleTimeUpdate = useCallback((cur: number, dur: number) => {
    setCurrentTime(cur);
    if (dur && !Number.isNaN(dur) && dur !== Infinity) setDuration(dur);
  }, []);

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
          <AudioPlayer
            track={current}
            onEnded={handleEnded}
            onPlayClick={handlePlayClick}
            onTimeUpdate={handleTimeUpdate}
            currentTime={currentTime}
            duration={duration}
          />
          <button
            type="button"
            onClick={handlePlayNext}
            className="mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition"
          >
            Следующий →
          </button>
        </div>
      </div>
    </div>
  );
}
