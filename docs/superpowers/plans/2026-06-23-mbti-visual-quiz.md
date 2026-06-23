# MBTI Visual Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Thai visual personality quiz that maps 24 playful answers to one of 16 MBTI-labelled entertainment profiles and exports a vertical share card.

**Architecture:** A static ES-module web app keeps quiz content in `js/quiz-data.js`, deterministic score calculation in `js/quiz-engine.js`, and DOM/state/share-card rendering in `js/app.js`. The HTML supplies semantic screen containers; CSS owns the responsive sticker-collage visual system and card illustrations.

**Tech Stack:** HTML5, CSS3, browser Canvas API, Web Share API, ES modules, Node built-in test runner.

## Global Constraints

- Use plain HTML, CSS, and JavaScript with no runtime dependency or build step.
- Use 24 questions: six per E/I, S/N, T/F, and J/P axis.
- Render four visually distinct choice buttons per question in a responsive 2 by 2 grid.
- Keep every answer only in page memory; do not add login, storage, analytics, or requests.
- Write all user-facing copy in Thai and frame the quiz as entertainment rather than assessment.
- Use native sharing when available and PNG download otherwise.
- Support keyboard interaction, visible focus, readable contrast, and `prefers-reduced-motion`.

---

## File Structure

- `package.json` — declares the Node test command only.
- `index.html` — semantic intro, quiz, and result screens plus the offscreen share canvas.
- `style.css` — mobile-first layout, palette, CSS illustrations, and accessible animation rules.
- `js/quiz-data.js` — immutable question bank and the 16 Thai result profiles.
- `js/quiz-engine.js` — pure score, answer-replacement, and type-selection functions.
- `js/app.js` — screen state, DOM rendering, interaction handling, and share-card creation.
- `tests/quiz-engine.test.js` — deterministic unit coverage for all types and answer changes.

### Task 1: Set up a testable deterministic scoring core

**Files:**
- Create: `package.json`
- Create: `js/quiz-engine.js`
- Create: `tests/quiz-engine.test.js`

**Interfaces:**
- Produces: `emptyScores()`, `applyAnswer(scores, answer)`, `getType(scores)`, and `calculateScores(answers)` from `js/quiz-engine.js`.
- Consumes: an answer shaped as `{ axis: 'EI' | 'SN' | 'TF' | 'JP', value: number }`, where positive values choose the first letter of the axis and negative values choose the second.
- Later consumers: `js/app.js` imports `calculateScores` and `getType`; tests import all four exports.

- [ ] **Step 1: Write the failing tests for an initial score, all type combinations, and answer replacement**

```js
// tests/quiz-engine.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAnswer, calculateScores, emptyScores, getType } from '../js/quiz-engine.js';

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

test('calculateScores replaces a changed answer instead of double-counting it', () => {
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
```

- [ ] **Step 2: Run the test to verify it fails before the module exists**

Run: `rtk npm test`

Expected: FAIL because `js/quiz-engine.js` does not exist.

- [ ] **Step 3: Implement the pure scoring module**

```js
// js/quiz-engine.js
export const emptyScores = () => ({ EI: 0, SN: 0, TF: 0, JP: 0 });

export const applyAnswer = (scores, answer) => ({
  ...scores,
  [answer.axis]: scores[answer.axis] + answer.value,
});

export const calculateScores = (answers) =>
  answers.reduce((scores, answer) => applyAnswer(scores, answer), emptyScores());

export const getType = ({ EI, SN, TF, JP }) =>
  `${EI >= 0 ? 'E' : 'I'}${SN >= 0 ? 'S' : 'N'}${TF >= 0 ? 'T' : 'F'}${JP >= 0 ? 'J' : 'P'}`;
```

- [ ] **Step 4: Add the Node test command and run the tests**

```json
{
  "name": "mbti-visual-quiz",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test" }
}
```

Run: `rtk npm test`

Expected: PASS with four passing subtests.

- [ ] **Step 5: Commit the scoring foundation**

```bash
rtk git add package.json js/quiz-engine.js tests/quiz-engine.test.js
rtk git commit -m "feat: add quiz scoring engine"
```

### Task 2: Add the question bank and all outcome copy

**Files:**
- Create: `js/quiz-data.js`
- Test: `tests/quiz-engine.test.js`

**Interfaces:**
- Produces: `questions` and `profiles` from `js/quiz-data.js`.
- Consumes: the `axis` and `value` fields defined in Task 1.
- Later consumers: `js/app.js` reads `questions[index]` and `profiles[getType(scores)]`.

- [ ] **Step 1: Extend the test with data-integrity assertions**

```js
import { questions, profiles } from '../js/quiz-data.js';

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
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `rtk npm test`

Expected: FAIL because `js/quiz-data.js` does not exist.

- [ ] **Step 3: Define the complete data contract and populate all 24 prompts**

Use this exact structure for every prompt; each axis appears exactly six times and each choice has one of the values `2`, `1`, `-1`, or `-2`:

```js
// js/quiz-data.js
const scale = [2, 1, -1, -2];
const prompt = (id, axis, text, choices) => ({
  id,
  axis,
  text,
  choices: choices.map((choice, index) => ({ ...choice, value: scale[index] })),
});

export const questions = [
  prompt('ei-1', 'EI', 'เพื่อนนัด 9 โมง คุณเริ่ม…', [{ label: 'ตั้งปลุกแล้วโทรปลุกทุกคน', art: 'megaphone' }, { label: 'ส่งสติกเกอร์เช็กชื่อ', art: 'chat' }, { label: 'ลุกเมื่อมีคนโทรมา', art: 'pillow' }, { label: 'อ่านแล้วขอกลับไปจำศีล', art: 'cave' }]),
  prompt('ei-2', 'EI', 'เจอคนรู้จักในร้านสะดวกซื้อ คุณ…', [{ label: 'ชวนคุยถึงโปรโมชัน', art: 'basket' }, { label: 'ยิ้มแล้วทักหนึ่งประโยค', art: 'wave' }, { label: 'พยักหน้าแบบนินจา', art: 'cap' }, { label: 'เลี้ยวเข้าช่องขนมทันที', art: 'sneak' }]),
  prompt('ei-3', 'EI', 'วันหยุดในฝันคือ…', [{ label: 'คาเฟ่ฮอปสามจังหวัด', art: 'map' }, { label: 'นัดเพื่อนกินหมูกระทะ', art: 'grill' }, { label: 'ดูซีรีส์กับแมว', art: 'cat' }, { label: 'ปิดแจ้งเตือนทั้งโลก', art: 'moon' }]),
  prompt('ei-4', 'EI', 'ไมค์คาราโอเกะถูกยื่นมา คุณ…', [{ label: 'เปิดเพลงที่สองรอไว้แล้ว', art: 'mic' }, { label: 'ร้องท่อนฮุกพอเป็นพิธี', art: 'note' }, { label: 'ส่งต่อแบบสุภาพ', art: 'pass' }, { label: 'หายตัวหลังต้นไม้', art: 'tree' }]),
  prompt('ei-5', 'EI', 'กรุ๊ปแชตเงียบไปนาน คุณ…', [{ label: 'โยนมีมจุดไฟ', art: 'fire' }, { label: 'ถามว่าเย็นนี้กินอะไร', art: 'noodle' }, { label: 'อ่านเงียบ ๆ อย่างสง่างาม', art: 'book' }, { label: 'mute ไว้ตั้งแต่ต้น', art: 'bell' }]),
  prompt('ei-6', 'EI', 'งานอีเวนต์มีเกมละลายพฤติกรรม คุณ…', [{ label: 'อาสาเป็นพิธีกร', art: 'stage' }, { label: 'เล่นตามเกมอย่างตั้งใจ', art: 'badge' }, { label: 'เชียร์จากริมวง', art: 'flag' }, { label: 'หาห้องน้ำวนไป', art: 'door' }]),
  prompt('sn-1', 'SN', 'ได้โจทย์ไปเที่ยว คุณหา…', [{ label: 'รีวิวอาหารกับแผนที่ละเอียด', art: 'map' }, { label: 'เวลาเปิดปิดร้าน', art: 'clock' }, { label: 'ฟีดที่บอกว่าเมืองนี้มีพลังลึกลับ', art: 'star' }, { label: 'ตั๋วเที่ยวเดียวแล้วค่อยว่ากัน', art: 'plane' }]),
  prompt('sn-2', 'SN', 'เห็นเมฆเป็นรูปสัตว์ คุณคิดว่า…', [{ label: 'ฝนจะตกใน 20 นาที', art: 'rain' }, { label: 'ควรตากผ้าเข้าบ้าน', art: 'shirt' }, { label: 'จักรวาลกำลังส่งสัญญาณ', art: 'cosmos' }, { label: 'มันคือมังกรกำลังหางาน', art: 'dragon' }]),
  prompt('sn-3', 'SN', 'เมื่อมีคนเล่าเรื่องยาว คุณจำ…', [{ label: 'เวลา สถานที่ และชื่อร้าน', art: 'pin' }, { label: 'ลำดับเหตุการณ์', art: 'list' }, { label: 'อารมณ์ที่ซ่อนในน้ำเสียง', art: 'heart' }, { label: 'พล็อตภาคต่อในหัว', art: 'film' }]),
  prompt('sn-4', 'SN', 'ของขวัญที่ถูกใจที่สุดคือ…', [{ label: 'ของที่ใช้ได้ทุกวัน', art: 'mug' }, { label: 'คูปองร้านโปรด', art: 'ticket' }, { label: 'กล่องสุ่มธีมจักรวาล', art: 'box' }, { label: 'จดหมายคำใบ้ไปหาขุมทรัพย์', art: 'key' }]),
  prompt('sn-5', 'SN', 'เมนูใหม่ที่ไม่เคยกิน คุณ…', [{ label: 'ดูส่วนผสมก่อน', art: 'recipe' }, { label: 'ถามรสชาติจากพนักงาน', art: 'menu' }, { label: 'เลือกเพราะชื่อมงคล', art: 'sparkle' }, { label: 'สั่งเพราะอยากรู้ว่ามันจะพาไปไหน', art: 'rocket' }]),
  prompt('sn-6', 'SN', 'ปัญหาบ้าน ๆ ถูกยื่นให้ คุณ…', [{ label: 'หยิบเครื่องมือมาแก้เลย', art: 'tool' }, { label: 'ถามอาการให้ครบ', art: 'search' }, { label: 'ตั้งชื่อปัญหาให้ดูมีตำนาน', art: 'scroll' }, { label: 'คิดว่าถ้าทำใหม่ทั้งระบบจะเป็นยังไง', art: 'bulb' }]),
  prompt('tf-1', 'TF', 'เพื่อนขอคำแนะนำหลังอกหัก คุณ…', [{ label: 'สรุปทางเลือกพร้อมข้อดีข้อเสีย', art: 'chart' }, { label: 'ถามว่าอยากให้ช่วยอะไรเป็นอันดับแรก', art: 'check' }, { label: 'กอดและสั่งของอร่อย', art: 'hug' }, { label: 'ส่งเพลย์ลิสต์เศร้าให้ร้องจนพอ', art: 'music' }]),
  prompt('tf-2', 'TF', 'ทีมถกเถียงเรื่องยาก คุณให้ความสำคัญกับ…', [{ label: 'หลักฐานที่ตรวจสอบได้', art: 'file' }, { label: 'กติกาที่ทุกคนตกลง', art: 'rule' }, { label: 'ความรู้สึกของคนในห้อง', art: 'smile' }, { label: 'บรรยากาศที่ทำให้ทุกคนยังอยากคุยกัน', art: 'tea' }]),
  prompt('tf-3', 'TF', 'ร้านส่งอาหารผิดเมนู คุณ…', [{ label: 'แจ้งปัญหาตามหลักฐานทันที', art: 'receipt' }, { label: 'ขอแก้ไขแบบชัดเจนสุภาพ', art: 'phone' }, { label: 'ถ่ายรูปก่อนเพราะสงสารไรเดอร์', art: 'camera' }, { label: 'กินไปก่อนแล้วค่อยปลอบใจตัวเอง', art: 'cookie' }]),
  prompt('tf-4', 'TF', 'คำชมที่คุณชอบคือ…', [{ label: 'คุณแก้ปัญหาเก่งมาก', art: 'wrench' }, { label: 'คุณคิดเป็นระบบมาก', art: 'grid' }, { label: 'อยู่ด้วยแล้วสบายใจ', art: 'cloud' }, { label: 'คุณเข้าใจฉันโดยไม่ต้องพูดเยอะ', art: 'heart' }]),
  prompt('tf-5', 'TF', 'ในหนังกลุ่มเพื่อนทะเลาะกัน คุณเชียร์…', [{ label: 'คนที่พูดความจริงแม้ไม่เพราะ', art: 'truth' }, { label: 'คนที่ยอมรับผิดตามเหตุผล', art: 'scale' }, { label: 'คนที่ไปง้อก่อน', art: 'flower' }, { label: 'คนที่ทำขนมมาคืนดี', art: 'cake' }]),
  prompt('tf-6', 'TF', 'คุณเลือกหัวหน้าทีมจาก…', [{ label: 'ตัดสินใจชัดและเก่งงาน', art: 'target' }, { label: 'บริหารทรัพยากรเป็น', art: 'folder' }, { label: 'ฟังคนเก่งและใจดี', art: 'ear' }, { label: 'ทำให้วันจันทร์น่าอยู่ขึ้น', art: 'sun' }]),
  prompt('jp-1', 'JP', 'กระเป๋าเดินทางของคุณก่อนทริป…', [{ label: 'จัดครบตาม checklist', art: 'case' }, { label: 'แพ็กคืนก่อนเดินทาง', art: 'bag' }, { label: 'หยิบของตามฟีลตอนเช้า', art: 'socks' }, { label: 'มีแปรงสีฟันก็ถือว่าพร้อม', art: 'toothbrush' }]),
  prompt('jp-2', 'JP', 'โต๊ะทำงานที่สบายใจคือ…', [{ label: 'ทุกอย่างติดป้าย', art: 'label' }, { label: 'มีโซนชัดแต่ไม่เป๊ะ', art: 'desk' }, { label: 'กองของที่รู้ตำแหน่งด้วยใจ', art: 'pile' }, { label: 'โต๊ะว่างเพราะของอยู่ทั่วบ้าน', art: 'wind' }]),
  prompt('jp-3', 'JP', 'เพื่อนชวนเที่ยวพรุ่งนี้ คุณ…', [{ label: 'ส่งกำหนดการภายใน 10 นาที', art: 'calendar' }, { label: 'ถามเวลานัดและงบก่อน', art: 'wallet' }, { label: 'ตอบว่าไป แล้วค่อยดูทีหลัง', art: 'thumb' }, { label: 'ถามว่ามีที่นอนมั้ยก่อน', art: 'sleep' }]),
  prompt('jp-4', 'JP', 'งานที่มี deadline อีกสองสัปดาห์ คุณ…', [{ label: 'แตกเป็นงานย่อยทันที', art: 'kanban' }, { label: 'จองเวลาในปฏิทิน', art: 'date' }, { label: 'รอไฟมาแล้วลุยยาว', art: 'bolt' }, { label: 'ทำคืนสุดท้ายเพราะตำนานต้องมี', art: 'comet' }]),
  prompt('jp-5', 'JP', 'เลือกอาหารเย็น คุณ…', [{ label: 'วางเมนูรายสัปดาห์', art: 'plan' }, { label: 'เลือกจากของในตู้เย็น', art: 'fridge' }, { label: 'เปิดแอปแล้วเลื่อนจนหิวกว่าเดิม', art: 'app' }, { label: 'ให้เหรียญตัดสินชะตา', art: 'coin' }]),
  prompt('jp-6', 'JP', 'มีไอเดียใหม่ระหว่างทำงาน คุณ…', [{ label: 'จดเข้าคิวหลังงานปัจจุบัน', art: 'queue' }, { label: 'เช็กผลกระทบก่อน', art: 'shield' }, { label: 'สลับไปทำทันทีเพราะตื่นเต้น', art: 'jump' }, { label: 'เปิดแท็บใหม่อีก 12 แท็บ', art: 'tabs' }]),
];
```

Add `profiles` with all sixteen codes, each containing the exact keys `name`, `blurb`, `power`, `drain`, `party`, and `warning`. The names must be unique Thai archetypes, include the code in `name`, and must not claim a diagnosis. Use a short data object rather than result-specific rendering branches:

```js
export const profiles = {
  ESTJ: { name: 'ผู้บัญชาการตารางนัด (ESTJ)', blurb: 'โลกสงบขึ้นทันทีเมื่อมีตารางของคุณ', power: 'จัดการเรื่องยุ่งให้เป็นคิว', drain: 'คนที่ตอบว่า “เดี๋ยวค่อยดู”', party: 'รับบทตั้งกติกาเกม', warning: 'อาจเผลอทำ agenda ให้ปาร์ตี้' },
  ESFJ: { name: 'แม่งานหัวใจฟู (ESFJ)', blurb: 'จำได้ว่าใครแพ้อะไรและใครยังไม่ได้กิน', power: 'ทำให้ทุกคนรู้สึกมีส่วนร่วม', drain: 'แชตที่อ่านแล้วไม่มีใครตอบ', party: 'เดินแจกของกิน', warning: 'พักบ้าง โลกไม่พังถ้าไม่จัดโต๊ะ' },
  ENTJ: { name: 'นักวางแผนสายป่วน (ENTJ)', blurb: 'เห็นเป้าหมายแล้วสมองเปิดโหมดแผนห้าชั้น', power: 'พาทีมไปถึงเส้นชัย', drain: 'การประชุมไร้ข้อสรุป', party: 'เปิดโปรเจกต์ใหม่ตอนตีหนึ่ง', warning: 'เพื่อนอาจยังไม่ได้สมัครเป็นลูกทีม' },
  ENFJ: { name: 'ผู้จัดการพลังใจ (ENFJ)', blurb: 'เก่งเรื่องชวนคนธรรมดาให้เชื่อว่าทำได้', power: 'ปลุกไฟทั้งห้อง', drain: 'ความเย็นชาที่ไม่ยอมคุยกัน', party: 'ถ่ายรูปหมู่ให้ทุกคนสวย', warning: 'อย่าแบกอารมณ์ทุกคนไว้คนเดียว' },
  ESTP: { name: 'สายลุยไม่อ่านคู่มือ (ESTP)', blurb: 'เจอสถานการณ์จริงแล้วเครื่องติด', power: 'แก้เกมเฉพาะหน้า', drain: 'สไลด์ยาวเกินสามหน้า', party: 'ชวนเล่นเกมก่อนใคร', warning: 'คู่มือมีไว้ช่วย ไม่ได้มีไว้แพ้' },
  ESFP: { name: 'ดาวเด่นหน้าร้านขนม (ESFP)', blurb: 'คุณทำให้วันธรรมดามีฉากไฮไลต์', power: 'เติมสีให้บรรยากาศ', drain: 'กฎที่ยาวกว่ารายการอาหาร', party: 'เปิดเพลงและเริ่มเต้น', warning: 'กระเป๋าตังค์อาจเหนื่อยตามความสนุก' },
  ENTP: { name: 'นักทดลองไอเดียติดจรวด (ENTP)', blurb: 'ทุกประโยคคือประตูไปสู่ความเป็นไปได้ใหม่', power: 'เห็นทางเลือกที่คนอื่นไม่เห็น', drain: 'ประโยค “ทำตามเดิมก็พอ”', party: 'ตั้งคำถามที่ทำวงสนทนาแตกแขนง', warning: 'จบงานก่อนเปิดจักรวาลใหม่' },
  ENFP: { name: 'นักผจญภัยหัวใจวิ้ง (ENFP)', blurb: 'คุณเจอความหมายพิเศษได้ในป้ายลดราคา', power: 'เชื่อมคนและความฝัน', drain: 'รูทีนที่ไม่มีสีสัน', party: 'ทำความรู้จักทุกคนภายในชั่วโมงเดียว', warning: 'ไอเดียดีขึ้นมากเมื่อมี deadline' },
  ISTJ: { name: 'ผู้พิทักษ์เช็กลิสต์ (ISTJ)', blurb: 'คุณคือเหตุผลที่ทริปนี้ยังมีที่ชาร์จโทรศัพท์', power: 'ทำสิ่งสำคัญให้ครบ', drain: 'แผนที่เปลี่ยนทุกห้านาที', party: 'ถือของสำรองที่ทุกคนลืม', warning: 'ปล่อยให้แผนนอกตารางชนะบ้างก็ได้' },
  ISFJ: { name: 'ผู้ดูแลสายเนียน (ISFJ)', blurb: 'ดูเหมือนไม่พูดมาก แต่จำรายละเอียดได้หมด', power: 'ใส่ใจโดยไม่ต้องประกาศ', drain: 'การถูกเร่งให้ตอบทันที', party: 'เตรียมทิชชูและยาดม', warning: 'ความต้องการของคุณก็สำคัญเท่ากัน' },
  INTJ: { name: 'สถาปนิกแผนลับ (INTJ)', blurb: 'ภายนิ่ง ๆ แต่ในหัวมีแผนสำรองสามฤดูกาล', power: 'มองภาพระยะยาว', drain: 'เหตุผลที่ว่า “ก็ทำ ๆ ไปก่อน”', party: 'นั่งมุมดีแล้วสังเกตทุกอย่าง', warning: 'ลองเล่าแผนให้โลกฟังบ้าง' },
  INFJ: { name: 'นักอ่านใจแห่งจักรวาล (INFJ)', blurb: 'คุณจับอารมณ์ของเรื่องได้ก่อนที่เรื่องจะพูด', power: 'มองเห็นความหมายระหว่างบรรทัด', drain: 'ความสัมพันธ์ที่ไร้ความจริงใจ', party: 'คุยลึกกับคนเดียวจนลืมกลับบ้าน', warning: 'ไม่ต้องตีความทุกสติกเกอร์' },
  ISTP: { name: 'ช่างเทคนิคสายชิล (ISTP)', blurb: 'ปัญหายิ่งแปลก ยิ่งอยากลองแก้', power: 'จับของจริงแล้วเข้าใจเร็ว', drain: 'คำอธิบายที่ไม่ยอมเข้าประเด็น', party: 'ซ่อมของที่พังโดยไม่มีใครขอ', warning: 'บอกความรู้สึกเป็นคำพูดบ้าง' },
  ISFP: { name: 'ศิลปินโหมดละมุน (ISFP)', blurb: 'คุณเลือกสิ่งที่ใช่ด้วยเรดาร์ส่วนตัวที่แม่นยำ', power: 'ทำเรื่องเล็กให้มีความสวย', drain: 'การถูกสั่งให้เป็นเหมือนคนอื่น', party: 'เลือกเพลงที่ทุกคนจำได้ไปอีกนาน', warning: 'โลกอยากเห็นงานของคุณมากกว่าที่คิด' },
  INTP: { name: 'นักวิจัยห้องลับ (INTP)', blurb: 'คำถามเดียวของคุณอาจเปิดแท็บใหม่ทั้งคืน', power: 'แยกเรื่องซับซ้อนเป็นชิ้นที่เข้าใจได้', drain: 'กฎที่ไม่มีเหตุผลรองรับ', party: 'อธิบายเรื่องแปลกที่น่าสนใจมาก', warning: 'พักสมองก่อนมันเปิดโหมดเครื่องบิน' },
  INFP: { name: 'กวีผู้มีแมวเป็นที่ปรึกษา (INFP)', blurb: 'คุณเก็บความหมายดี ๆ ไว้ในที่ที่คนอื่นมองข้าม', power: 'จินตนาการและความเข้าอกเข้าใจ', drain: 'ความจริงที่พูดโดยไม่ถนอมใจ', party: 'คุยเรื่องฝันจนคนฟังใจฟู', warning: 'เขียนไอเดียออกมา โลกอาจต้องการมัน' },
};
```

- [ ] **Step 4: Run data tests**

Run: `rtk npm test`

Expected: PASS with six passing subtests.

- [ ] **Step 5: Commit quiz content**

```bash
rtk git add js/quiz-data.js tests/quiz-engine.test.js
rtk git commit -m "feat: add visual quiz content"
```

### Task 3: Build semantic screens and the mobile-first sticker interface

**Files:**
- Create: `index.html`
- Create: `style.css`

**Interfaces:**
- Produces: elements with IDs `intro-screen`, `quiz-screen`, `result-screen`, `start-button`, `back-button`, `choices`, `progress-bar`, `question-count`, `question-text`, `result-card`, `share-button`, `download-button`, `restart-button`, and `share-canvas`.
- Later consumers: `js/app.js` queries these exact IDs; no other selectors are required for application state.

- [ ] **Step 1: Write the semantic page skeleton and module entry point**

```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#fff7e6" />
    <title>MBTI ไม่แม่น แต่แซวแม่น</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="app-shell">
      <section id="intro-screen" class="screen is-active" aria-labelledby="intro-title">
        <p class="eyebrow">24 คำถาม • 16 คาแรกเตอร์</p><h1 id="intro-title">MBTI ไม่แม่น<br />แต่แซวแม่น</h1>
        <p>เลือกภาพที่ใกล้คุณที่สุด ไม่มีข้อถูกผิด และไม่มีใครเอาคำตอบไปเก็บ</p>
        <button id="start-button" class="primary-button" type="button">เริ่มแซวตัวเอง</button>
      </section>
      <section id="quiz-screen" class="screen" aria-live="polite" hidden>
        <header class="quiz-header"><button id="back-button" type="button">ย้อนกลับ</button><span id="question-count"></span></header>
        <div class="progress-track" aria-hidden="true"><span id="progress-bar"></span></div>
        <p id="axis-label" class="eyebrow"></p><h2 id="question-text"></h2><div id="choices" class="choices-grid"></div>
      </section>
      <section id="result-screen" class="screen" hidden aria-labelledby="result-title">
        <article id="result-card" class="result-card"><p class="eyebrow">ผลที่ได้จากจักรวาลจำลอง</p><h2 id="result-title"></h2><p id="result-blurb"></p><dl><div><dt>สกิลเด่น</dt><dd id="result-power"></dd></div><div><dt>พลังหมดเมื่อ</dt><dd id="result-drain"></dd></div><div><dt>สกิลปาร์ตี้</dt><dd id="result-party"></dd></div><div><dt>คำเตือน</dt><dd id="result-warning"></dd></div></dl></article>
        <div class="result-actions"><button id="share-button" class="primary-button" type="button">แชร์การ์ดนี้</button><button id="download-button" type="button">บันทึกเป็นรูป</button><button id="restart-button" type="button">เล่นใหม่</button></div>
      </section>
    </main>
    <canvas id="share-canvas" width="1080" height="1920" aria-hidden="true"></canvas>
    <script type="module" src="js/app.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Implement the CSS system and choice-card illustration contract**

Use CSS variables `--cream: #fff7e6`, `--ink: #213042`, `--lime: #d9ff56`, `--coral: #ff856d`, `--sea: #8de5f4`, `--yellow: #ffd65a`, and `--shadow: 5px 5px 0 var(--ink)`. Make the shell max-width 680px, use a two-column grid at all usable phone widths, and give cards a minimum block size of 148px. Every choice button receives `data-art` from quiz data; render its visual using `::before`, `::after`, coloured shapes, and a named class rather than image URLs.

```css
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; color: var(--ink); background: var(--cream); font-family: "Noto Sans Thai", "Tahoma", sans-serif; }
.screen { min-height: 100dvh; padding: 24px 18px 40px; }
.screen[hidden] { display: none; }
.choices-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.choice-card { min-height: 148px; border: 3px solid var(--ink); border-radius: 24px; box-shadow: var(--shadow); background: var(--card-color); color: var(--ink); font: inherit; font-weight: 700; cursor: pointer; }
.choice-card:focus-visible, button:focus-visible { outline: 4px solid #315efb; outline-offset: 4px; }
.choice-card.is-selected { transform: translate(4px, 4px); box-shadow: 1px 1px 0 var(--ink); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
```

Add a wider-screen breakpoint at 700px that centres the app shell and increases outer padding only; do not change the two-by-two answer model.

- [ ] **Step 3: Manually verify responsive and focus states before wiring behavior**

Run: `rtk npx --yes serve . -l 4173`

Expected: The intro screen opens at `http://localhost:4173`; its primary button and every temporary choice-card prototype show a visible keyboard focus outline.

- [ ] **Step 4: Commit the static visual shell**

```bash
rtk git add index.html style.css
rtk git commit -m "feat: add mobile visual quiz shell"
```

### Task 4: Wire quiz interaction, result rendering, and share fallback

**Files:**
- Create: `js/app.js`
- Modify: `style.css`
- Test: `tests/quiz-engine.test.js`

**Interfaces:**
- Consumes: `questions`, `profiles`, `calculateScores`, and `getType` from prior tasks.
- Produces: a complete user flow from start through result, native share, PNG download, and restart.

- [ ] **Step 1: Add a pure flow test for changing a previous answer**

```js
test('a replacement answer yields the score of the final selection only', () => {
  const selected = new Map([[0, { axis: 'EI', value: 2 }], [1, { axis: 'SN', value: -1 }]]);
  selected.set(0, { axis: 'EI', value: -2 });
  assert.deepEqual(calculateScores([...selected.values()]), { EI: -2, SN: -1, TF: 0, JP: 0 });
});
```

- [ ] **Step 2: Run the test before interaction wiring**

Run: `rtk npm test`

Expected: PASS; the test protects the Map-based replacement strategy the UI will use.

- [ ] **Step 3: Implement one render path for each screen and a single answer handler**

```js
// js/app.js
import { questions, profiles } from './quiz-data.js';
import { calculateScores, getType } from './quiz-engine.js';

const selectedAnswers = new Map();
let currentIndex = 0;
const byId = (id) => document.getElementById(id);
const screens = ['intro-screen', 'quiz-screen', 'result-screen'];

function showScreen(id) {
  screens.forEach((screenId) => { byId(screenId).hidden = screenId !== id; });
}

function renderQuestion() {
  const question = questions[currentIndex];
  byId('question-count').textContent = `ข้อ ${currentIndex + 1} / ${questions.length}`;
  byId('progress-bar').style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  byId('axis-label').textContent = 'เลือกตามใจ ไม่ต้องคิดเยอะ';
  byId('question-text').textContent = question.text;
  byId('back-button').disabled = currentIndex === 0;
  byId('choices').replaceChildren(...question.choices.map((choice) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'choice-card'; button.dataset.art = choice.art;
    button.setAttribute('aria-label', choice.label); button.innerHTML = `<span aria-hidden="true" class="choice-art"></span><span>${choice.label}</span>`;
    if (selectedAnswers.get(currentIndex)?.value === choice.value) button.classList.add('is-selected');
    button.addEventListener('click', () => chooseAnswer(question, choice));
    return button;
  }));
}

function chooseAnswer(question, choice) {
  selectedAnswers.set(currentIndex, { axis: question.axis, value: choice.value });
  if (currentIndex === questions.length - 1) renderResult();
  else { currentIndex += 1; renderQuestion(); }
}

function renderResult() {
  const type = getType(calculateScores([...selectedAnswers.values()]));
  const profile = profiles[type];
  byId('result-title').textContent = profile.name; byId('result-blurb').textContent = profile.blurb;
  ['power', 'drain', 'party', 'warning'].forEach((key) => { byId(`result-${key}`).textContent = profile[key]; });
  showScreen('result-screen');
}
```

Wire `start-button` to reset `currentIndex` and show/render the quiz; wire `back-button` to decrement and render; wire `restart-button` to clear `selectedAnswers` and show the intro. Do not call a network API.

- [ ] **Step 4: Add share-card generation and feature-detected sharing**

Render the selected profile into `#share-canvas` at 1080 by 1920 using the same cream, lime, coral, sea, yellow, and ink palette. Include title, MBTI code, blurb, and the footer `MBTI ไม่แม่น แต่แซวแม่น`. Convert the canvas with `canvas.toBlob`; create `new File([blob], 'mbti-result.png', { type: 'image/png' })`; call `navigator.share({ title: profile.name, files: [file] })` only if both `navigator.share` and `navigator.canShare?.({ files: [file] })` return usable support. Otherwise call the same PNG download routine used by `download-button`.

- [ ] **Step 5: Run automated tests and browser acceptance checks**

Run: `rtk npm test`

Expected: PASS with seven passing subtests.

Browser checks:

1. Complete all 24 questions; a result screen appears with a Thai archetype and MBTI code.
2. Go back, change an answer, finish, and confirm no score is duplicated.
3. Tab through controls; focus always remains visible.
4. On a browser without native file sharing, clicking Share downloads `mbti-result.png`.
5. Emulate a 360px wide screen and a desktop width; no text or choice card overflows.

- [ ] **Step 6: Commit the complete experience**

```bash
rtk git add js/app.js style.css tests/quiz-engine.test.js
rtk git commit -m "feat: complete interactive MBTI quiz"
```

### Task 5: Final content and accessibility verification

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `js/quiz-data.js`

**Interfaces:**
- Consumes: the complete static app from Tasks 1–4.
- Produces: an acceptance-tested handoff with no scope expansion.

- [ ] **Step 1: Check every requirement against the final page**

Verify 24 questions, exactly four choices per question, all 16 profiles, responsive 2 by 2 layout, entertainment disclaimer, no network requests, native-share fallback, restart, keyboard focus, contrast, and reduced-motion behavior.

- [ ] **Step 2: Correct only failures found in the checklist**

Examples of permitted fixes: replace low-contrast card text, add a missing Thai `aria-label`, correct an omitted profile key, or remove a transition that still runs under `prefers-reduced-motion`. Do not add accounts, persistence, analytics, additional quiz modes, or external assets.

- [ ] **Step 3: Run the final automated check**

Run: `rtk npm test`

Expected: PASS with all scoring and data-integrity tests passing.

- [ ] **Step 4: Commit final verification fixes if any were required**

```bash
rtk git add index.html style.css js/quiz-data.js
rtk git commit -m "fix: polish quiz accessibility"
```

If the checklist finds no defect, do not create an empty commit.
