import { compatibility, profiles, questions, rarity, rarityTier, resultExtras } from './quiz-data.js';
import { calculateScores, getAxisStats, getType } from './quiz-engine.js';
import { createQuizSession } from './quiz-session.js';
import { renderChoiceIllustration } from './choice-illustrations.js';
import { burstConfetti } from './confetti.js';

const byId = (id) => document.getElementById(id);
const session = createQuizSession();
const screens = ['intro-screen', 'quiz-screen', 'result-screen'];
const SHARE_URL = 'https://nuttapon.github.io/mbti/';
const STORAGE_KEY = 'mbti-progress';
const VALID_TYPES = new Set(Object.keys(profiles));
let currentIndex = 0;
let currentProfile;
let currentType;
let currentStats = [];
let currentExtras;

const axisLabels = {
  EI: 'พลังสังคม',
  SN: 'วิธีรับข้อมูล',
  TF: 'วิธีตัดสินใจ',
  JP: 'วิธีใช้ชีวิต',
};

const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Shuffle once per question so choice order is stable across back/forward,
// but no longer leaks the fixed strongest-to-weakest scoring order.
const choiceOrders = questions.map((question) => shuffle(question.choices));

const saveProgress = () => {
  try {
    if (!session.size()) { localStorage.removeItem(STORAGE_KEY); return; }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: currentIndex, entries: session.entries() }));
  } catch { /* storage blocked (private mode) — degrade silently */ }
};

const clearProgress = () => {
  session.clear();
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};

const loadProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved?.entries?.length) return null;
    session.restore(saved.entries);
    return Math.min(Math.max(saved.index ?? 0, 0), questions.length - 1);
  } catch { return null; }
};

// Synthesize plausible signed scores from a 4-letter type so a shared
// ?type=XXXX link can render a result card without the original answers.
const scoresFromType = (type) => {
  const positive = { E: 'EI', S: 'SN', T: 'TF', J: 'JP' };
  const negative = { I: 'EI', N: 'SN', F: 'TF', P: 'JP' };
  const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  [...type].forEach((letter) => {
    const magnitude = 6 + (letter.charCodeAt(0) % 6); // 6–11, deterministic per letter
    if (positive[letter]) scores[positive[letter]] = magnitude;
    else if (negative[letter]) scores[negative[letter]] = -magnitude;
  });
  return scores;
};

const showScreen = (screenId) => {
  screens.forEach((id) => { byId(id).hidden = id !== screenId; });
};

const focusChoiceByOffset = (cards, current, offset) => {
  const next = (current + offset + cards.length) % cards.length;
  cards[next].focus();
};

const renderQuestion = () => {
  const question = questions[currentIndex];
  byId('question-count').textContent = `ข้อ ${currentIndex + 1} / ${questions.length}`;
  byId('progress-bar').style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  byId('axis-label').textContent = axisLabels[question.axis];
  byId('question-text').textContent = question.text;
  byId('back-button').hidden = currentIndex === 0;

  const choicesEl = byId('choices');
  choicesEl.setAttribute('role', 'radiogroup');
  choicesEl.setAttribute('aria-label', question.text);

  const selected = session.selectedAt(currentIndex);
  const cards = choiceOrders[currentIndex].map((choice, position) => {
    const card = document.createElement('button');
    const art = document.createElement('span');
    const label = document.createElement('span');
    card.type = 'button';
    card.className = 'choice-card';
    card.dataset.art = choice.art;
    card.setAttribute('role', 'radio');
    const isSelected = selected?.value === choice.value;
    card.setAttribute('aria-checked', String(isSelected));
    card.setAttribute('aria-label', `ตัวเลือกที่ ${position + 1}: ${choice.label}`);
    art.className = 'choice-art';
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML = renderChoiceIllustration(choice.art);
    label.textContent = choice.label;
    card.append(art, label);
    if (isSelected) card.classList.add('is-selected');
    card.addEventListener('click', () => selectAnswer(question, choice));
    return card;
  });

  cards.forEach((card, position) => {
    card.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        focusChoiceByOffset(cards, position, 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusChoiceByOffset(cards, position, -1);
      }
    });
  });

  choicesEl.replaceChildren(...cards);

  // Re-trigger the enter animation on every question change.
  byId('quiz-screen').classList.remove('is-entering');
  void byId('quiz-screen').offsetWidth;
  byId('quiz-screen').classList.add('is-entering');

  (cards.find((card) => card.classList.contains('is-selected')) || cards[0])?.focus();
};

const selectAnswer = (question, choice) => {
  session.choose(currentIndex, { axis: question.axis, value: choice.value });
  if (currentIndex === questions.length - 1) {
    finishQuiz();
    return;
  }
  currentIndex += 1;
  saveProgress();
  renderQuestion();
};

// Number keys 1–4 pick a choice on the active quiz screen.
document.addEventListener('keydown', (event) => {
  if (byId('quiz-screen').hidden) return;
  const slot = Number(event.key);
  if (!Number.isInteger(slot) || slot < 1 || slot > 4) return;
  const card = byId('choices').children[slot - 1];
  if (card) { event.preventDefault(); card.click(); }
});

const radarPoint = (index, percent) => {
  const angle = ((index * 90) - 90) * (Math.PI / 180);
  const radius = 18 + (percent / 100) * 40;
  return {
    x: 60 + Math.cos(angle) * radius,
    y: 60 + Math.sin(angle) * radius,
  };
};

const renderRadar = (stats) => {
  const points = stats.map(({ percent }, index) => radarPoint(index, percent));
  const polygon = points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const axes = stats.map(({ letter }, index) => {
    const edge = radarPoint(index, 100);
    return `<line x1="60" y1="60" x2="${edge.x.toFixed(1)}" y2="${edge.y.toFixed(1)}"></line><text x="${edge.x.toFixed(1)}" y="${edge.y.toFixed(1)}">${letter}</text>`;
  }).join('');

  return `<svg viewBox="0 0 120 120" role="img" aria-label="กราฟเรดาร์บุคลิก">
    <polygon class="radar-web" points="60,20 100,60 60,100 20,60"></polygon>
    <polygon class="radar-web radar-web-mid" points="60,36 84,60 60,84 36,60"></polygon>
    ${axes}
    <polygon class="radar-shape" points="${polygon}"></polygon>
    ${points.map(({ x, y }) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6"></circle>`).join('')}
  </svg>`;
};

const renderStats = (stats) => {
  const chips = stats.map(({ letter, label, percent }) => {
    const chip = document.createElement('div');
    chip.className = 'stat-chip';
    chip.innerHTML = `<strong>${letter}</strong><span>${label}</span><meter min="0" max="100" value="${percent}"></meter><em>${percent}%</em>`;
    return chip;
  });
  byId('result-stats').replaceChildren(...chips);
};

const renderPowerMeters = ({ meters }) => {
  const cards = meters.map(({ label, value }) => {
    const card = document.createElement('div');
    card.className = 'power-meter';
    card.innerHTML = `<span>${label}</span><strong>${value}%</strong><meter min="0" max="100" value="${value}"></meter>`;
    return card;
  });
  byId('result-power-meters').replaceChildren(...cards);
};

const renderMatches = (type) => {
  const matches = compatibility[type].map(({ type: matchType, role, reason }, index) => {
    const match = document.createElement('li');
    const name = profiles[matchType].name.replace(` (${matchType})`, '');
    match.innerHTML = `<strong>#${index + 1} ${matchType}</strong><span>${role} · ${name}</span><p>${reason}</p>`;
    return match;
  });
  byId('result-matches').replaceChildren(...matches);
};

const renderRarity = (type) => {
  const percent = rarity[type];
  const { label, icon } = rarityTier(percent);
  byId('result-rarity').textContent = `${icon} ${label} · มีแค่ราว ${percent}% ของคนทั้งโลก`;
};

const renderResult = (scores, { celebrate = true } = {}) => {
  const type = getType(scores);
  const stats = getAxisStats(scores);
  currentType = type;
  currentStats = stats;
  currentProfile = profiles[type];
  currentExtras = resultExtras[type];
  byId('result-title').textContent = currentProfile.name;
  byId('result-hook').textContent = currentExtras.hook;
  renderRarity(type);
  byId('result-blurb').textContent = currentProfile.blurb;
  renderPowerMeters(currentExtras);
  byId('result-radar').innerHTML = renderRadar(stats);
  renderStats(stats);
  renderMatches(type);
  ['power', 'drain', 'party', 'warning'].forEach((key) => { byId(`result-${key}`).textContent = currentProfile[key]; });
  document.title = `${currentProfile.name} · MBTI ไม่แม่น แต่แซวแม่น`;
  showScreen('result-screen');
  if (celebrate) {
    byId('result-title').focus?.();
    burstConfetti();
  }
};

const finishQuiz = () => {
  renderResult(calculateScores(session.answers()), { celebrate: true });
  clearProgress();
};

const drawWrappedText = (context, text, x, y, width, lineHeight) => {
  const words = [...text];
  let line = '';
  let cursorY = y;
  words.forEach((character) => {
    if (context.measureText(line + character).width > width && line) {
      context.fillText(line, x, cursorY);
      line = character;
      cursorY += lineHeight;
    } else line += character;
  });
  context.fillText(line, x, cursorY);
  return cursorY;
};

const drawShareRadar = (context, stats, centerX, centerY, radius) => {
  const radar = stats.map(({ percent }, index) => {
    const angle = ((index * 90) - 90) * (Math.PI / 180);
    const pointRadius = radius * (.45 + (percent / 100) * .55);
    return {
      x: centerX + Math.cos(angle) * pointRadius,
      y: centerY + Math.sin(angle) * pointRadius,
    };
  });
  const web = [
    { x: centerX, y: centerY - radius },
    { x: centerX + radius, y: centerY },
    { x: centerX, y: centerY + radius },
    { x: centerX - radius, y: centerY },
  ];

  context.save();
  context.strokeStyle = '#243347';
  context.lineWidth = 8;
  context.lineJoin = 'round';
  context.globalAlpha = .42;
  context.beginPath();
  web.forEach(({ x, y }, index) => { if (index === 0) context.moveTo(x, y); else context.lineTo(x, y); });
  context.closePath();
  context.stroke();
  web.forEach(({ x, y }) => {
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x, y);
    context.stroke();
  });
  context.globalAlpha = 1;
  context.fillStyle = 'rgb(255 141 117 / 0.5)';
  context.beginPath();
  radar.forEach(({ x, y }, index) => { if (index === 0) context.moveTo(x, y); else context.lineTo(x, y); });
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = '#ff8d75';
  radar.forEach(({ x, y }) => {
    context.beginPath();
    context.arc(x, y, 14, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  });
  context.fillStyle = '#243347';
  context.font = '900 38px Tahoma';
  stats.forEach(({ letter }, index) => {
    const { x, y } = web[index];
    context.fillText(letter, x - 12, y + 13);
  });
  context.restore();
};

const createShareBlob = () => new Promise((resolve) => {
  const canvas = byId('share-canvas');
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff7e6';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#8de5f4';
  context.beginPath(); context.arc(920, 180, 180, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#ffd65a';
  context.beginPath(); context.arc(130, 1670, 250, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#243347'; context.lineWidth = 18;
  context.strokeRect(74, 292, 932, 1270);
  context.fillStyle = '#243347';
  context.font = '800 48px Tahoma';
  context.fillText('MBTI ไม่แม่น แต่แซวแม่น', 92, 130);
  context.fillStyle = '#ff8d75';
  context.font = '900 78px Tahoma';
  let bottom = drawWrappedText(context, currentProfile.name, 120, 410, 820, 94);
  context.fillStyle = '#243347';
  context.font = '700 42px Tahoma';
  bottom = drawWrappedText(context, currentExtras.hook, 120, bottom + 76, 780, 58);
  drawShareRadar(context, currentStats, 274, bottom + 245, 142);
  currentExtras.meters.forEach(({ label, value }, index) => {
    const y = bottom + 105 + (index * 92);
    context.fillStyle = '#243347';
    context.font = '800 34px Tahoma';
    context.fillText(label, 500, y);
    context.fillText(`${value}%`, 850, y);
    context.strokeStyle = '#243347';
    context.lineWidth = 8;
    context.strokeRect(500, y + 24, 360, 22);
    context.fillStyle = '#ff8d75';
    context.fillRect(506, y + 30, (348 * value) / 100, 10);
  });
  const matchY = bottom + 475;
  context.fillStyle = '#243347';
  context.font = '900 40px Tahoma';
  context.fillText('คู่ที่อยู่ด้วยแล้วเวิร์ก', 120, matchY);
  compatibility[currentType].forEach(({ type, role, reason }, index) => {
    const y = matchY + 68 + (index * 128);
    context.fillStyle = '#d9ff56';
    context.fillRect(120, y - 42, 780, 98);
    context.strokeStyle = '#243347';
    context.lineWidth = 7;
    context.strokeRect(120, y - 42, 780, 98);
    context.fillStyle = '#243347';
    context.font = '900 34px Tahoma';
    context.fillText(`#${index + 1} ${type} ${role}`, 145, y);
    context.font = '700 28px Tahoma';
    drawWrappedText(context, reason, 145, y + 35, 710, 36);
  });
  context.font = '800 34px Tahoma';
  context.fillText(SHARE_URL, 315, 1815);
  canvas.toBlob(resolve, 'image/png');
});

const downloadBlob = (blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mbti-result.png';
  link.click();
  URL.revokeObjectURL(url);
};

const shareUrlForType = () => `${SHARE_URL}?type=${currentType}`;

// Image-file sharing only behaves on mobile native share sheets. On desktop,
// Chrome dumps the PNG into a temp WebShare/ dir and the target concatenates
// the local file path onto the URL — so desktop shares the link only.
const isLikelyMobile = () =>
  navigator.maxTouchPoints > 1 && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const showToast = (message) => {
  let toast = byId('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
};

const copyLink = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    showToast('คัดลอกลิงก์แล้ว วางแชร์ได้เลย 🔗');
  } catch {
    showToast('คัดลอกลิงก์ไม่ได้ ลองกดบันทึกรูปแทนนะ');
  }
};

const shareResult = async () => {
  const url = shareUrlForType();
  const linkShareData = { title: currentProfile.name, text: currentProfile.blurb, url };

  // Mobile: share the rendered card image through the native sheet.
  if (isLikelyMobile() && navigator.share) {
    const blob = await createShareBlob();
    if (blob) {
      const file = new File([blob], 'mbti-result.png', { type: 'image/png' });
      const fileShareData = { ...linkShareData, files: [file] };
      if (!navigator.canShare || navigator.canShare(fileShareData)) {
        try { await navigator.share(fileShareData); return; } catch (error) { if (error.name === 'AbortError') return; }
      }
    }
  }

  // Desktop (or no file support): share the deep link only — it unfurls via OG image.
  if (navigator.share && (!navigator.canShare || navigator.canShare(linkShareData))) {
    try { await navigator.share(linkShareData); return; } catch (error) { if (error.name === 'AbortError') return; }
  }

  // Last resort: copy the link to the clipboard.
  await copyLink(url);
};

const resetUrlAndTitle = () => {
  document.title = 'MBTI ไม่แม่น แต่แซวแม่น';
  if (location.search) history.replaceState(null, '', location.pathname);
};

const startFresh = () => { currentIndex = 0; clearProgress(); resetUrlAndTitle(); showScreen('quiz-screen'); renderQuestion(); };

byId('start-button').addEventListener('click', startFresh);
byId('back-button').addEventListener('click', () => { if (currentIndex > 0) { currentIndex -= 1; renderQuestion(); } });
byId('restart-button').addEventListener('click', () => { currentIndex = 0; clearProgress(); resetUrlAndTitle(); showScreen('intro-screen'); });
byId('share-button').addEventListener('click', shareResult);
byId('download-button').addEventListener('click', async () => { const blob = await createShareBlob(); if (blob) downloadBlob(blob); });

const init = () => {
  // 1) Shared deep link (?type=INFP) renders the result card straight away.
  const sharedType = new URLSearchParams(location.search).get('type')?.toUpperCase();
  if (sharedType && VALID_TYPES.has(sharedType)) {
    renderResult(scoresFromType(sharedType), { celebrate: false });
    return;
  }
  // 2) Saved progress resumes the quiz where it was left off.
  const resumeIndex = loadProgress();
  if (resumeIndex !== null) {
    currentIndex = resumeIndex;
    showScreen('quiz-screen');
    renderQuestion();
    return;
  }
  // 3) Otherwise start at the intro screen (default markup state).
};

init();
