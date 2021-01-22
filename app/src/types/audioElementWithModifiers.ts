import { RecordedResponse } from './RecordedResponse';

export interface AudioElementWithBoost extends HTMLAudioElement {
  __boost?: number;
  __responses?: RecordedResponse[];
}
