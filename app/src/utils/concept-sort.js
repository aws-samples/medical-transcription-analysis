export const conceptScoreSort = (conceptArray) =>
  [...conceptArray].sort((concept1, concept2) => concept2.Score - concept1.Score);
