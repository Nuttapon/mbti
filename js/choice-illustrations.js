import { questions } from './quiz-data.js';

const artKeys = [...new Set(questions.flatMap(({ choices }) => choices.map(({ art }) => art)))];

export const illustrations = Object.fromEntries(artKeys.map((art) => [art, art]));

const escapeAttribute = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

const hashArt = (art) => {
  let hash = 2166136261;
  for (const char of art) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const point = (seed, index, min, max) => min + (((seed >>> ((index % 4) * 8)) & 255) / 255) * (max - min);
const bend = (seed, index) => point(seed, index, -7, 7).toFixed(1);
const nudge = (value, seed, index) => (value + point(seed, index, -4, 4)).toFixed(1);

const doodles = [
  (seed) => [
    `M${nudge(28, seed, 1)} ${nudge(64, seed, 2)} C${nudge(34, seed, 3)} ${nudge(31, seed, 4)} ${nudge(78, seed, 5)} ${nudge(26, seed, 6)} ${nudge(90, seed, 7)} ${nudge(56, seed, 8)} C${nudge(100, seed, 9)} ${nudge(86, seed, 10)} ${nudge(58, seed, 11)} ${nudge(98, seed, 12)} ${nudge(35, seed, 13)} ${nudge(79, seed, 14)}`,
    `M45 ${78 + bend(seed, 15)} C54 ${90 + bend(seed, 16)} 72 ${88 + bend(seed, 17)} 80 ${74 + bend(seed, 18)}`,
    `M43 ${54 + bend(seed, 19)} l.1 .1 M76 ${52 + bend(seed, 20)} l.1 .1`,
  ],
  (seed) => [
    `M${nudge(31, seed, 1)} ${nudge(82, seed, 2)} C${nudge(44, seed, 3)} ${nudge(48, seed, 4)} ${nudge(61, seed, 5)} ${nudge(32, seed, 6)} ${nudge(89, seed, 7)} ${nudge(28, seed, 8)}`,
    `M${nudge(32, seed, 9)} ${nudge(83, seed, 10)} C${nudge(57, seed, 11)} ${nudge(80, seed, 12)} ${nudge(76, seed, 13)} ${nudge(67, seed, 14)} ${nudge(90, seed, 15)} ${nudge(29, seed, 16)}`,
    `M58 ${38 + bend(seed, 17)} C61 ${58 + bend(seed, 18)} 58 ${75 + bend(seed, 19)} 50 ${91 + bend(seed, 20)}`,
  ],
  (seed) => [
    `M${nudge(28, seed, 1)} ${nudge(45, seed, 2)} C${nudge(42, seed, 3)} ${nudge(27, seed, 4)} ${nudge(79, seed, 5)} ${nudge(26, seed, 6)} ${nudge(91, seed, 7)} ${nudge(45, seed, 8)} C${nudge(101, seed, 9)} ${nudge(63, seed, 10)} ${nudge(88, seed, 11)} ${nudge(82, seed, 12)} ${nudge(64, seed, 13)} ${nudge(81, seed, 14)} L${nudge(42, seed, 15)} ${nudge(94, seed, 16)} L${nudge(48, seed, 17)} ${nudge(78, seed, 18)} C${nudge(31, seed, 19)} ${nudge(72, seed, 20)} ${nudge(19, seed, 21)} ${nudge(61, seed, 22)} ${nudge(28, seed, 23)} ${nudge(45, seed, 24)}`,
    `M41 ${48 + bend(seed, 25)} C51 ${42 + bend(seed, 26)} 69 ${43 + bend(seed, 27)} 82 ${50 + bend(seed, 28)}`,
    `M41 ${62 + bend(seed, 29)} C54 ${68 + bend(seed, 30)} 70 ${68 + bend(seed, 31)} 82 ${61 + bend(seed, 32)}`,
  ],
  (seed) => [
    `M${nudge(37, seed, 1)} ${nudge(32, seed, 2)} L${nudge(84, seed, 3)} ${nudge(28, seed, 4)} L${nudge(91, seed, 5)} ${nudge(80, seed, 6)} L${nudge(32, seed, 7)} ${nudge(88, seed, 8)} Z`,
    `M${nudge(37, seed, 9)} ${nudge(32, seed, 10)} L${nudge(61, seed, 11)} ${nudge(55, seed, 12)} L${nudge(84, seed, 13)} ${nudge(28, seed, 14)}`,
    `M${nudge(33, seed, 15)} ${nudge(87, seed, 16)} L${nudge(61, seed, 17)} ${nudge(55, seed, 18)} L${nudge(91, seed, 19)} ${nudge(80, seed, 20)}`,
  ],
  (seed) => [
    `M${nudge(60, seed, 1)} ${nudge(24, seed, 2)} L${nudge(68, seed, 3)} ${nudge(49, seed, 4)} L${nudge(94, seed, 5)} ${nudge(50, seed, 6)} L${nudge(73, seed, 7)} ${nudge(64, seed, 8)} L${nudge(80, seed, 9)} ${nudge(89, seed, 10)} L${nudge(60, seed, 11)} ${nudge(74, seed, 12)} L${nudge(39, seed, 13)} ${nudge(90, seed, 14)} L${nudge(47, seed, 15)} ${nudge(64, seed, 16)} L${nudge(26, seed, 17)} ${nudge(50, seed, 18)} L${nudge(52, seed, 19)} ${nudge(49, seed, 20)} Z`,
    `M45 ${61 + bend(seed, 21)} C55 ${56 + bend(seed, 22)} 66 ${56 + bend(seed, 23)} 76 ${62 + bend(seed, 24)}`,
  ],
  (seed) => [
    `M${nudge(29, seed, 1)} ${nudge(78, seed, 2)} C${nudge(38, seed, 3)} ${nudge(61, seed, 4)} ${nudge(49, seed, 5)} ${nudge(51, seed, 6)} ${nudge(62, seed, 7)} ${nudge(69, seed, 8)} C${nudge(72, seed, 9)} ${nudge(84, seed, 10)} ${nudge(89, seed, 11)} ${nudge(75, seed, 12)} ${nudge(94, seed, 13)} ${nudge(56, seed, 14)}`,
    `M36 ${92 + bend(seed, 15)} C52 ${100 + bend(seed, 16)} 78 ${99 + bend(seed, 17)} 93 ${86 + bend(seed, 18)}`,
    `M31 ${44 + bend(seed, 19)} C46 ${36 + bend(seed, 20)} 74 ${35 + bend(seed, 21)} 91 ${43 + bend(seed, 22)}`,
  ],
  (seed) => [
    `M${nudge(34, seed, 1)} ${nudge(83, seed, 2)} C${nudge(42, seed, 3)} ${nudge(40, seed, 4)} ${nudge(72, seed, 5)} ${nudge(26, seed, 6)} ${nudge(89, seed, 7)} ${nudge(49, seed, 8)} C${nudge(105, seed, 9)} ${nudge(72, seed, 10)} ${nudge(72, seed, 11)} ${nudge(101, seed, 12)} ${nudge(43, seed, 13)} ${nudge(87, seed, 14)}`,
    `M49 ${58 + bend(seed, 15)} C56 ${50 + bend(seed, 16)} 69 ${50 + bend(seed, 17)} 76 ${58 + bend(seed, 18)}`,
    `M49 ${69 + bend(seed, 19)} C58 ${77 + bend(seed, 20)} 69 ${77 + bend(seed, 21)} 78 ${69 + bend(seed, 22)}`,
  ],
  (seed) => [
    `M${nudge(42, seed, 1)} ${nudge(95, seed, 2)} C${nudge(36, seed, 3)} ${nudge(75, seed, 4)} ${nudge(37, seed, 5)} ${nudge(48, seed, 6)} ${nudge(57, seed, 7)} ${nudge(40, seed, 8)} C${nudge(78, seed, 9)} ${nudge(31, seed, 10)} ${nudge(93, seed, 11)} ${nudge(49, seed, 12)} ${nudge(85, seed, 13)} ${nudge(67, seed, 14)} C${nudge(77, seed, 15)} ${nudge(85, seed, 16)} ${nudge(51, seed, 17)} ${nudge(83, seed, 18)} ${nudge(51, seed, 19)} ${nudge(60, seed, 20)} C${nudge(51, seed, 21)} ${nudge(47, seed, 22)} ${nudge(66, seed, 23)} ${nudge(47, seed, 24)} ${nudge(70, seed, 25)} ${nudge(58, seed, 26)}`,
    `M48 ${93 + bend(seed, 27)} C58 ${101 + bend(seed, 28)} 75 ${98 + bend(seed, 29)} 83 ${88 + bend(seed, 30)}`,
  ],
];

const renderPaths = (art) => {
  const seed = hashArt(art);
  const paths = doodles[seed % doodles.length](seed);
  return paths.map((d, index) => `<path d="${d}" fill="none" stroke-width="${index === 0 ? 7 : 5}" />`).join('');
};

export const renderChoiceIllustration = (art) => `<svg class="choice-doodle" data-art="${escapeAttribute(art)}" aria-hidden="true" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${renderPaths(art)}</svg>`;
