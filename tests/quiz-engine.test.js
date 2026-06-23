import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyAnswer, calculateScores, emptyScores, getType } from '../js/quiz-engine.js';
import { profiles, questions } from '../js/quiz-data.js';
import { createQuizSession } from '../js/quiz-session.js';
import { illustrations, renderChoiceIllustration } from '../js/choice-illustrations.js';

const axes = ['EI', 'SN', 'TF', 'JP'];

test('emptyScores starts every axis at zero', () => {
  assert.deepEqual(emptyScores(), { EI: 0, SN: 0, TF: 0, JP: 0 });
});

test('applyAnswer returns a new score object without mutating the prior score', () => {
  const before = emptyScores();
  const after = applyAnswer(before, { axis: 'EI', value: 2 });

  assert.deepEqual(before, { EI: 0, SN: 0, TF: 0, JP: 0 });
  assert.deepEqual(after, { EI: 2, SN: 0, TF: 0, JP: 0 });
});

test('calculateScores sums the current selected answers', () => {
  const answers = [
    { axis: 'EI', value: 2 },
    { axis: 'EI', value: -2 },
    { axis: 'SN', value: 1 },
  ];

  assert.deepEqual(calculateScores(answers), { EI: 0, SN: 1, TF: 0, JP: 0 });
});

test('getType resolves all 16 MBTI codes and resolves ties to the first axis letter', () => {
  for (const ei of [-1, 1]) for (const sn of [-1, 1]) for (const tf of [-1, 1]) for (const jp of [-1, 1]) {
    const scores = { EI: ei, SN: sn, TF: tf, JP: jp };
    const expected = `${ei >= 0 ? 'E' : 'I'}${sn >= 0 ? 'S' : 'N'}${tf >= 0 ? 'T' : 'F'}${jp >= 0 ? 'J' : 'P'}`;

    assert.equal(getType(scores), expected);
  }

  assert.equal(getType(emptyScores()), 'ESTJ');
});

test('question data has 24 four-choice prompts split evenly across axes', () => {
  assert.equal(questions.length, 24);
  assert.deepEqual(
    Object.fromEntries(axes.map((axis) => [axis, questions.filter((question) => question.axis === axis).length])),
    { EI: 6, SN: 6, TF: 6, JP: 6 },
  );
  assert.ok(questions.every((question) => question.choices.length === 4));
});

test('a Thai profile exists for every MBTI code', () => {
  const codes = ['ESTJ', 'ESFJ', 'ENTJ', 'ENFJ', 'ESTP', 'ESFP', 'ENTP', 'ENFP', 'ISTJ', 'ISFJ', 'INTJ', 'INFJ', 'ISTP', 'ISFP', 'INTP', 'INFP'];

  assert.deepEqual(Object.keys(profiles).sort(), codes.sort());
  assert.ok(Object.values(profiles).every(({ name, blurb, power, drain, party, warning }) =>
    [name, blurb, power, drain, party, warning].every((value) => value.length > 0),
  ));
});

test('the HTML provides every semantic screen and interaction target', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const ids = ['intro-screen', 'quiz-screen', 'result-screen', 'start-button', 'back-button', 'choices', 'progress-bar', 'question-count', 'question-text', 'result-card', 'share-button', 'download-button', 'restart-button', 'share-canvas'];

  ids.forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`)));
  assert.match(html, /<html lang=["']th["']>/);
});

test('a quiz session replaces an earlier choice at the same question index', () => {
  const session = createQuizSession();
  session.choose(0, { axis: 'EI', value: 2 });
  session.choose(1, { axis: 'SN', value: -1 });
  session.choose(0, { axis: 'EI', value: -2 });

  assert.deepEqual(session.answers(), [{ axis: 'EI', value: -2 }, { axis: 'SN', value: -1 }]);
});

test('every question art key has a handwritten inline SVG doodle', () => {
  const artKeys = [...new Set(questions.flatMap(({ choices }) => choices.map(({ art }) => art)))];
  assert.deepEqual(Object.keys(illustrations).sort(), artKeys.sort());
  artKeys.forEach((art) => {
    const scene = renderChoiceIllustration(art);
    assert.match(scene, /^<svg[\s\S]*class="choice-doodle"/);
    assert.match(scene, /data-art="/);
    assert.match(scene, /aria-hidden="true"/);
    assert.match(scene, /stroke-linecap="round"/);
    assert.match(scene, /<path[\s\S]*fill="none"/);
    assert.doesNotMatch(scene, /choice-icon|icon-|lucide|<use[\s>]/);
    assert.doesNotMatch(scene, /<text[\s>]/);
  });
  assert.equal(new Set(artKeys.map(renderChoiceIllustration)).size, artKeys.length);
});
