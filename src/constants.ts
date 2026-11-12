import type { TrackSource } from "./types/track";

/**
 * Пропорции выбора случайного файла при первом заходе и повторном play.
 * Сумма = 1.0. Первый файл (anekdot) получает 85%.
 */
export const SOURCE_WEIGHTS: Record<TrackSource, number> = {
  anekdot: 0.85,
  comedy_club: 0.05,
  comedy_standup: 0.05,
  comedy_woman: 0.05,
};

export const MAX_RESULTS = 50;
