export const createQuizSession = () => {
  const selectedAnswers = new Map();

  return {
    choose(index, answer) {
      selectedAnswers.set(index, answer);
    },
    answers() {
      return [...selectedAnswers.values()];
    },
    clear() {
      selectedAnswers.clear();
    },
    selectedAt(index) {
      return selectedAnswers.get(index);
    },
  };
};
