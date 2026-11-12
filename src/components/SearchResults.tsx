import type { TrackWithSource } from "../types/track";
// import { MAX_RESULTS } from '../constants'
import { SmileyIcon } from "./SmileyIcon";

interface Props {
  results: TrackWithSource[];
  visible: number;
  currentUid: number | null;
  onSelect: (track: TrackWithSource) => void;
  onShowMore: () => void;
}

export function SearchResults({
  results,
  visible,
  currentUid,
  onSelect,
  onShowMore,
}: Props) {
  if (results.length === 0) return null;

  const shown = results.slice(0, visible);
  const hasMore = results.length > visible;

  return (
    <div className="w-full max-w-3xl mx-auto mt-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {shown.map((track, i) => (
          <SmileyIcon
            key={`${track.source}-${track.uidTrack}-${i}`}
            index={i}
            active={track.uidTrack === currentUid}
            title={track.tags.join(", ")}
            onClick={() => onSelect(track)}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={onShowMore}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Показать ещё
          </button>
        </div>
      )}
    </div>
  );
}
