// State variables used in a few places, mostly in communication between App and Header,
// To keep track of which screen we're on.
export const STAGE_HOME = 0;
export const STAGE_TRANSCRIBING = 1;
export const STAGE_TRANSCRIBED = 2;
export const STAGE_SOAP_REVIEW = 3;
export const STAGE_EXPORT = 4;
export const STAGE_SEARCH = 5;
export const STAGE_SEARCH_EXPORT = 6;

// Confidence threshold for highlighting entities with low confidence on the Analysis Pane
export const CONFIDENCE_THRESHOLD = 0.5;
