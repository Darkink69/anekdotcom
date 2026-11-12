import { useEffect, useState } from "react";
import type { Track, TrackSource, TrackWithSource } from "../types/track";

const SOURCES: TrackSource[] = [
  "anekdot",
  "comedy_club",
  "comedy_standup",
  "comedy_woman",
];

export function useTracks() {
  const [tracksBySource, setTracksBySource] = useState<
    Record<TrackSource, Track[]>
  >({
    anekdot: [],
    comedy_club: [],
    comedy_standup: [],
    comedy_woman: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const results = await Promise.all(
          SOURCES.map(async (src) => {
            const res = await fetch(`/json/${src}.json`);
            if (!res.ok) throw new Error(`Failed to load ${src}.json`);
            const data: Track[] = await res.json();
            return [src, data] as const;
          }),
        );
        if (cancelled) return;
        const map = Object.fromEntries(results) as Record<TrackSource, Track[]>;
        setTracksBySource(map);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTracks: TrackWithSource[] = SOURCES.flatMap((src) =>
    tracksBySource[src].map((t) => ({ ...t, source: src })),
  );

  return { tracksBySource, allTracks, loading, error };
}
