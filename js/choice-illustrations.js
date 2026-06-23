import { questions } from './quiz-data.js';

const social = new Set(['megaphone', 'chat', 'wave', 'mic', 'note', 'pass', 'fire', 'stage', 'badge', 'flag', 'phone', 'hug', 'smile', 'ear', 'thumb']);
const food = new Set(['basket', 'grill', 'noodle', 'mug', 'recipe', 'menu', 'tea', 'cookie', 'cake', 'fridge']);
const plan = new Set(['map', 'clock', 'pin', 'list', 'ticket', 'key', 'tool', 'search', 'chart', 'check', 'file', 'rule', 'receipt', 'wrench', 'grid', 'scale', 'target', 'folder', 'case', 'bag', 'label', 'desk', 'calendar', 'wallet', 'kanban', 'date', 'plan', 'queue', 'shield', 'tabs']);
const dream = new Set(['cave', 'cap', 'sneak', 'cat', 'moon', 'tree', 'bell', 'door', 'star', 'plane', 'rain', 'shirt', 'cosmos', 'dragon', 'heart', 'film', 'box', 'sparkle', 'rocket', 'scroll', 'bulb', 'music', 'camera', 'cloud', 'truth', 'flower', 'sun', 'socks', 'toothbrush', 'pile', 'wind', 'sleep', 'bolt', 'comet', 'app', 'coin', 'jump']);

export const illustrations = Object.fromEntries(
  [...new Set(questions.flatMap(({ choices }) => choices.map(({ art }) => art)))].map((art) => [art, art]),
);

const svg = (content) => `<svg viewBox="0 0 120 90" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
const ink = '#243347';

export const renderChoiceIllustration = (art) => {
  if (social.has(art)) return svg(`<circle cx="48" cy="29" r="13" fill="#fffdf7" stroke="${ink}" stroke-width="4"/><path d="M24 78c4-22 44-22 48 0M76 38l23-10-2 27-21-8Z" fill="#ff8d75" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/><path d="M102 28l10-8M105 43l12 1" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`);
  if (food.has(art)) return svg(`<path d="M23 35h74v37H23z" fill="#fffdf7" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/><path d="M35 35c0-19 50-19 50 0" fill="#ffd65a" stroke="${ink}" stroke-width="4"/><circle cx="49" cy="54" r="7" fill="#ff8d75"/><circle cx="70" cy="60" r="7" fill="#8de5f4"/><path d="M34 79l-8 7m63-7 8 7" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`);
  if (plan.has(art)) return svg(`<rect x="26" y="12" width="68" height="66" rx="8" fill="#fffdf7" stroke="${ink}" stroke-width="4"/><path d="M26 31h68M40 12v13m40-13v13" stroke="${ink}" stroke-width="4" stroke-linecap="round"/><path d="M40 45h16m8 0h16M40 59h16m8 0h16" stroke="${ink}" stroke-width="5" stroke-linecap="round"/><circle cx="85" cy="68" r="15" fill="#d9ff56" stroke="${ink}" stroke-width="4"/><path d="m80 68 4 4 8-10" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
  if (dream.has(art)) return svg(`<path d="M20 70c5-31 23-48 41-48 18 0 28 13 39 48z" fill="#8de5f4" stroke="${ink}" stroke-width="4" stroke-linejoin="round"/><circle cx="52" cy="44" r="5" fill="#ffd65a"/><path d="m79 15 4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#ff8d75" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M28 74h65" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`);
  return svg(`<rect x="22" y="18" width="76" height="55" rx="18" fill="#fffdf7" stroke="${ink}" stroke-width="4"/><circle cx="48" cy="45" r="8" fill="#ffd65a"/><circle cx="73" cy="45" r="8" fill="#ff8d75"/>`);
};
