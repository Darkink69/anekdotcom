import type { Track, TrackSource, TrackWithSource } from "../types/track";
import { SOURCE_WEIGHTS } from "../constants";

export function pickRandomSource(): TrackSource {
  const r = Math.random();
  let acc = 0;
  for (const [source, weight] of Object.entries(SOURCE_WEIGHTS) as [
    TrackSource,
    number,
  ][]) {
    acc += weight;
    if (r < acc) return source;
  }
  return "anekdot";
}

export function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Выбирает случайный трек с приоритетом anekdot:
 * 1. Случайно выбирает источник по весам.
 * 2. Случайно выбирает трек внутри источника.
 */
export function pickRandomTrack(
  tracksBySource: Record<TrackSource, Track[]>,
): TrackWithSource | null {
  const source = pickRandomSource();
  const list = tracksBySource[source] ?? [];
  const track = pickRandom(list);
  if (!track) {
    // fallback — если вдруг пусто, ищем в любом непустом источнике
    for (const [s, arr] of Object.entries(tracksBySource) as [
      TrackSource,
      Track[],
    ][]) {
      const t = pickRandom(arr);
      if (t) return { ...t, source: s };
    }
    return null;
  }
  return { ...track, source };
}
