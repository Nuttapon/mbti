export const emptyScores = () => ({ EI: 0, SN: 0, TF: 0, JP: 0 });

export const applyAnswer = (scores, answer) => ({
  ...scores,
  [answer.axis]: scores[answer.axis] + answer.value,
});

export const calculateScores = (answers) =>
  answers.reduce((scores, answer) => applyAnswer(scores, answer), emptyScores());

export const getType = ({ EI, SN, TF, JP }) =>
  `${EI >= 0 ? 'E' : 'I'}${SN >= 0 ? 'S' : 'N'}${TF >= 0 ? 'T' : 'F'}${JP >= 0 ? 'J' : 'P'}`;

const axisTraits = [
  { axis: 'EI', positive: ['E', 'พลังเปิดวง'], negative: ['I', 'พลังชาร์จเงียบ'] },
  { axis: 'SN', positive: ['S', 'จับรายละเอียด'], negative: ['N', 'จับสัญญาณ'] },
  { axis: 'TF', positive: ['T', 'โหมดเหตุผล'], negative: ['F', 'โหมดหัวใจ'] },
  { axis: 'JP', positive: ['J', 'จัดคิวชีวิต'], negative: ['P', 'ไหลลื่นตามฟีล'] },
];

export const getAxisStats = (scores) => axisTraits.map(({ axis, positive, negative }) => {
  const value = scores[axis];
  const [letter, label] = value >= 0 ? positive : negative;
  return {
    axis,
    letter,
    label,
    percent: Math.round(50 + (Math.min(Math.abs(value), 12) / 12) * 50),
    value,
  };
});
