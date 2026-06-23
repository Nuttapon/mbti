import { questions } from './quiz-data.js';

const pictograms = {
  megaphone: '📣', chat: '💬', pillow: '🛏️', cave: '🕳️', basket: '🛒', wave: '👋', cap: '🥷', sneak: '🙈',
  map: '🗺️', grill: '🍲', cat: '🐈', moon: '🌙', mic: '🎤', note: '🎵', pass: '🤲', tree: '🌳',
  fire: '🔥', noodle: '🍜', book: '📖', bell: '🔕', stage: '🎙️', badge: '🎮', flag: '🚩', door: '🚪',
  clock: '🕘', star: '✨', plane: '✈️', rain: '🌧️', shirt: '👕', cosmos: '🌌', dragon: '🐉', pin: '📍',
  list: '📋', heart: '💗', film: '🎬', mug: '☕', ticket: '🎟️', box: '🎁', key: '🔑', recipe: '🥣',
  menu: '📜', sparkle: '🌟', rocket: '🚀', tool: '🛠️', search: '🔎', scroll: '📜', bulb: '💡', chart: '📊',
  check: '✅', hug: '🫂', music: '🎧', file: '📄', rule: '⚖️', smile: '😊', tea: '🫖', receipt: '🧾',
  phone: '📱', camera: '📷', cookie: '🍪', wrench: '🔧', grid: '▦', cloud: '☁️', truth: '🗣️', scale: '⚖️',
  flower: '🌷', cake: '🍰', target: '🎯', folder: '📁', ear: '👂', sun: '☀️', case: '🧳', bag: '🎒',
  socks: '🧦', toothbrush: '🪥', label: '🏷️', desk: '🖥️', pile: '📚', wind: '💨', calendar: '🗓️', wallet: '👛',
  thumb: '👍', sleep: '😴', kanban: '🗂️', date: '📅', bolt: '⚡', comet: '☄️', plan: '📝', fridge: '🧊',
  app: '📲', coin: '🪙', queue: '⏳', shield: '🛡️', jump: '🦘', tabs: '🗂️', app: '📲', cap: '🥷',
};

const artKeys = [...new Set(questions.flatMap(({ choices }) => choices.map(({ art }) => art)))];
export const illustrations = Object.fromEntries(artKeys.map((art) => [art, pictograms[art] ?? '✦']));

export const renderChoiceIllustration = (art) => `
  <svg viewBox="0 0 120 90" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" data-art="${art}">
    <rect x="8" y="8" width="104" height="74" rx="24" fill="#fffdf7" stroke="#243347" stroke-width="4" />
    <text x="60" y="63" text-anchor="middle" font-size="47">${illustrations[art]}</text>
    <path d="M24 72h72" stroke="#243347" stroke-width="3" stroke-linecap="round" opacity=".18" />
  </svg>`;
