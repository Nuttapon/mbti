export const emptyScores = () => ({ EI: 0, SN: 0, TF: 0, JP: 0 });

export const applyAnswer = (scores, answer) => ({
  ...scores,
  [answer.axis]: scores[answer.axis] + answer.value,
});

export const calculateScores = (answers) =>
  answers.reduce((scores, answer) => applyAnswer(scores, answer), emptyScores());

export const getType = ({ EI, SN, TF, JP }) =>
  `${EI >= 0 ? 'E' : 'I'}${SN >= 0 ? 'S' : 'N'}${TF >= 0 ? 'T' : 'F'}${JP >= 0 ? 'J' : 'P'}`;
