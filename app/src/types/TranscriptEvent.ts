// https://docs.aws.amazon.com/transcribe/latest/dg/streaming-med.html
export interface Item {
  Confidence?: number;
  Content: string;
  EndTime: number;
  StartTime: number;
  Type: string;
}

export interface Alternative {
  Items: Item[];
  Transcript: string;
}

export interface Result {
  Alternatives: Alternative[];
  EndTime: number;
  IsPartial: boolean;
  ResultId: string;
  StartTime: number;
}

export interface Transcript {
  Results: Result[];
}

export interface TranscriptEvent {
  Transcript: Transcript;
}
