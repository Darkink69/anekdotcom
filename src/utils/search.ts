import type { TrackWithSource } from "../types/track";

/**
 * Ищет по тегам с поддержкой частичного совпадения (подстрока).
 * Возвращает треки, в которых хотя бы один тег содержит запрос.
 */
export function searchByTags(
  tracks: TrackWithSource[],
  query: string,
): TrackWithSource[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return tracks.filter((t) =>
    t.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}
