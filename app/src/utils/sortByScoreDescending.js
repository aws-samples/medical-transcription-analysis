export const sortByScoreDescending = (concepts) =>
  [...concepts].sort((concept1, concept2) => concept2.Score - concept1.Score);
