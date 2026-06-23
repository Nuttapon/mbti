import { profiles, questions } from './quiz-data.js';
import { calculateScores, getType } from './quiz-engine.js';
import { createQuizSession } from './quiz-session.js';
import { renderChoiceIllustration } from './choice-illustrations.js';

const byId = (id) => document.getElementById(id);
const session = createQuizSession();
const screens = ['intro-screen', 'quiz-screen', 'result-screen'];
let currentIndex = 0;
let currentProfile;

const showScreen = (screenId) => {
  screens.forEach((id) => { byId(id).hidden = id !== screenId; });
};

const renderQuestion = () => {
  const question = questions[currentIndex];
  byId('question-count').textContent = `ข้อ ${currentIndex + 1} / ${questions.length}`;
  byId('progress-bar').style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  byId('axis-label').textContent = 'เลือกตามใจ ไม่ต้องคิดเยอะ';
  byId('question-text').textContent = question.text;
  byId('back-button').disabled = currentIndex === 0;

  const cards = question.choices.map((choice) => {
    const card = document.createElement('button');
    const art = document.createElement('span');
    const label = document.createElement('span');
    card.type = 'button';
    card.className = 'choice-card';
    card.dataset.art = choice.art;
    card.setAttribute('aria-label', choice.label);
    art.className = 'choice-art';
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML = renderChoiceIllustration(choice.art);
    label.textContent = choice.label;
    card.append(art, label);
    if (session.selectedAt(currentIndex)?.value === choice.value) card.classList.add('is-selected');
    card.addEventListener('click', () => selectAnswer(question, choice));
    return card;
  });

  byId('choices').replaceChildren(...cards);
};

const selectAnswer = (question, choice) => {
  session.choose(currentIndex, { axis: question.axis, value: choice.value });
  if (currentIndex === questions.length - 1) {
    renderResult();
    return;
  }
  currentIndex += 1;
  renderQuestion();
};

const renderResult = () => {
  const type = getType(calculateScores(session.answers()));
  currentProfile = profiles[type];
  byId('result-title').textContent = currentProfile.name;
  byId('result-blurb').textContent = currentProfile.blurb;
  ['power', 'drain', 'party', 'warning'].forEach((key) => { byId(`result-${key}`).textContent = currentProfile[key]; });
  showScreen('result-screen');
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
  context.font = '900 86px Tahoma';
  let bottom = drawWrappedText(context, currentProfile.name, 120, 470, 820, 106);
  context.fillStyle = '#243347';
  context.font = '600 46px Tahoma';
  bottom = drawWrappedText(context, currentProfile.blurb, 120, bottom + 106, 780, 68);
  const rows = [['สกิลเด่น', currentProfile.power], ['พลังหมดเมื่อ', currentProfile.drain], ['สกิลปาร์ตี้', currentProfile.party], ['คำเตือน', currentProfile.warning]];
  rows.forEach(([label, value], index) => {
    const y = bottom + 120 + (index * 170);
    context.fillStyle = '#243347'; context.font = '800 35px Tahoma'; context.fillText(label, 120, y);
    context.font = '600 42px Tahoma'; drawWrappedText(context, value, 120, y + 58, 760, 54);
  });
  context.font = '700 36px Tahoma'; context.fillText('ผลลัพธ์เพื่อความบันเทิงเท่านั้น', 240, 1815);
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

const shareResult = async () => {
  const blob = await createShareBlob();
  if (!blob) return;
  const file = new File([blob], 'mbti-result.png', { type: 'image/png' });
  const shareData = { title: currentProfile.name, text: currentProfile.blurb, files: [file] };
  if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
    try { await navigator.share(shareData); return; } catch (error) { if (error.name !== 'AbortError') downloadBlob(blob); return; }
  }
  downloadBlob(blob);
};

byId('start-button').addEventListener('click', () => { currentIndex = 0; session.clear(); showScreen('quiz-screen'); renderQuestion(); });
byId('back-button').addEventListener('click', () => { if (currentIndex > 0) { currentIndex -= 1; renderQuestion(); } });
byId('restart-button').addEventListener('click', () => { currentIndex = 0; session.clear(); showScreen('intro-screen'); });
byId('share-button').addEventListener('click', shareResult);
byId('download-button').addEventListener('click', async () => { const blob = await createShareBlob(); if (blob) downloadBlob(blob); });
