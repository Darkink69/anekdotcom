import { formatUploadDate } from "../utils/date";

interface Props {
  currentTime: number;
  duration: number;
  uploadUnix: number | null;
}

export function TrackInfo({ currentTime, duration, uploadUnix }: Props) {
  const remaining = Math.max(0, Math.floor(duration - currentTime));
  const total = Math.floor(duration);
  return (
    <div className="text-center mt-2">
      <div className="text-sm text-gray-700 tabular-nums">
        {remaining}/{total} секунд
      </div>
      {uploadUnix !== null && (
        <div className="text-xs text-gray-500 mt-1">
          {formatUploadDate(uploadUnix)}
        </div>
      )}
    </div>
  );
}
