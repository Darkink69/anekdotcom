export interface Track {
  uidTrack: number;
  audiofile: string;
  duration: number;
  timeUploadTrack: number;
  tags: string[];
}

export interface TrackWithSource extends Track {
  source: TrackSource;
}

export type TrackSource =
  | "anekdot"
  | "comedy_club"
  | "comedy_standup"
  | "comedy_woman";
