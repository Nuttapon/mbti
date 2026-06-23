import { questions } from './quiz-data.js';

const social = new Set(['megaphone', 'chat', 'wave', 'mic', 'note', 'pass', 'fire', 'stage', 'badge', 'flag', 'phone', 'hug', 'smile', 'ear', 'thumb']);
const food = new Set(['basket', 'grill', 'noodle', 'mug', 'recipe', 'menu', 'tea', 'cookie', 'cake', 'fridge']);
const plan = new Set(['map', 'clock', 'pin', 'list', 'ticket', 'key', 'tool', 'search', 'chart', 'check', 'file', 'rule', 'receipt', 'wrench', 'grid', 'scale', 'target', 'folder', 'case', 'bag', 'label', 'desk', 'calendar', 'wallet', 'kanban', 'date', 'plan', 'queue', 'shield', 'tabs']);

const artKeys = [...new Set(questions.flatMap(({ choices }) => choices.map(({ art }) => art)))];
export const illustrations = Object.fromEntries(artKeys.map((art) => [art, art]));

const iconByArt = Object.fromEntries(artKeys.map((art) => [art, art]));
Object.assign(iconByArt, { chat: 'message-circle', pillow: 'bed-double', cave: 'mountain', basket: 'shopping-basket', wave: 'hand', cap: 'hard-hat', sneak: 'eye-off', grill: 'cooking-pot', note: 'music', pass: 'handshake', tree: 'trees', fire: 'flame', noodle: 'soup', bell: 'bell-off', stage: 'presentation', badge: 'gamepad-2', door: 'door-open', star: 'sparkles', cosmos: 'orbit', dragon: 'drama', film: 'clapperboard', mug: 'coffee', box: 'gift', recipe: 'notebook-tabs', sparkle: 'sparkles', tool: 'wrench', scroll: 'scroll-text', bulb: 'lightbulb', chart: 'chart-no-axes-combined', check: 'circle-check', hug: 'hand-heart', file: 'file-text', rule: 'scale', tea: 'coffee', receipt: 'receipt-text', phone: 'smartphone', cookie: 'cookie', grid: 'table-2', truth: 'quote', flower: 'flower-2', cake: 'cake-slice', case: 'briefcase', bag: 'backpack', label: 'tag', desk: 'monitor', pile: 'panels-top-left', wallet: 'wallet-cards', sleep: 'bed', date: 'calendar-days', bolt: 'zap', comet: 'wand-sparkles', plan: 'notebook-pen', fridge: 'refrigerator', app: 'app-window', coin: 'coins', queue: 'clock-3', shield: 'shield-check', jump: 'rabbit', tabs: 'panels-top-left' });

export const renderChoiceIllustration = (art) => `<span class="choice-icon icon-${iconByArt[art]}" data-art="${art}" aria-hidden="true"></span>`;
