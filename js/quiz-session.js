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
    entries() {
      return [...selectedAnswers.entries()];
    },
    restore(entries) {
      selectedAnswers.clear();
      entries.forEach(([index, answer]) => selectedAnswers.set(Number(index), answer));
    },
    size() {
      return selectedAnswers.size;
    },
  };
};
