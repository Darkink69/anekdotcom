import { useRef, useEffect, useState } from "react";
import H5AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import type { TrackWithSource } from "../types/track";
import { TrackInfo } from "./TrackInfo";

interface Props {
  track: TrackWithSource | null;
  onEnded: () => void;
  onPlayClick: () => void;
  onTimeUpdate: (current: number, duration: number) => void;
  currentTime: number;
  duration: number;
}

export function AudioPlayer({
  track,
  onEnded,
  onPlayClick,
  onTimeUpdate,
  currentTime,
  duration,
}: Props) {
  const playerRef = useRef<H5AudioPlayer>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Сбрасываем состояние загрузки при смене трека
  useEffect(() => {
    if (track) setIsLoading(true);
  }, [track?.uidTrack]);

  useEffect(() => {
    const audio = playerRef.current?.audio.current;
    if (!audio) return;

    const onTime = () => {
      onTimeUpdate(audio.currentTime, audio.duration || track?.duration || 0);
    };
    const onLoaded = () => {
      setIsLoading(false);
      onTimeUpdate(audio.currentTime, audio.duration || track?.duration || 0);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => setIsLoading(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("playing", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("playing", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, [track, onTimeUpdate]);

  if (!track) {
    return <div className="text-gray-400 text-sm">Загрузка…</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <H5AudioPlayer
          ref={playerRef}
          src={track.audiofile}
          autoPlayAfterSrcChange
          onEnded={onEnded}
          onPlay={onPlayClick}
          customControlsSection={[RHAP_UI.MAIN_CONTROLS]}
          showSkipControls={false}
          showJumpControls={false}
          // showFiller={false}
          className={
            isLoading ? "opacity-60 transition-opacity" : "transition-opacity"
          }
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {!isLoading ? (
        <TrackInfo
          currentTime={currentTime}
          duration={duration || track.duration}
          uploadUnix={track.timeUploadTrack}
        />
      ) : (
        <div className="text-center mt-2 text-sm text-gray-400">
          Загрузка трека…
        </div>
      )}
    </div>
  );
}
