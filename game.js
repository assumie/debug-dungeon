(() => {
  'use strict';

  const rooms = [
    {
      title: 'The Logic Gate', eyebrow: 'ROOM 01 / THE ENTRANCE', type: 'LOGIC · EASY', emblem: '◇', file: 'gate.js',
      story: 'The door only opens for someone who reads the condition carefully. What happens when this code runs?',
      code: `const keys = 2;\nconst shield = false;\n\nif (keys >= 2 && !shield) {\n  gate.open();\n} else {\n  gate.stayClosed();\n}`,
      question: 'What will the gate do?',
      choices: ['Open—the condition is true', 'Stay closed—shield is false', 'Crash—keys should be a string'],
      answer: 0,
      hint: '!shield means “not shield.” What is the opposite of false?',
      success: 'Correct. You have two keys, and !false is true. The gate opens.'
    },
    {
      title: 'Broken Corridor', eyebrow: 'ROOM 02 / THE LAYOUT', type: 'CSS · INTERMEDIATE', emblem: '▤', file: 'corridor.css',
      story: 'The corridor looks fine on a desktop, but its three columns crush together on a phone. Choose the patch.',
      code: `.corridor {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n\n@media (max-width: 600px) {\n  .corridor {\n    /* add one rule here */\n  }\n}`,
      question: 'Which rule gives each room space on a small screen?',
      choices: ['display: none;', 'grid-template-columns: 1fr;', 'gap: 0;'],
      answer: 1,
      hint: 'The problem is how many columns there are. On a narrow screen, make it one.',
      success: 'Nice. A single grid column lets the rooms stack on small screens.'
    },
    {
      title: 'The Final Boss', eyebrow: 'ROOM 03 / THE REAL BUG', type: 'JAVASCRIPT · BOSS', emblem: '✳', file: 'clutch-lab/app.js',
      story: 'This one happened while I built Clutch Lab. The session form would not open. The helper expects an ID, but it was given a CSS selector.',
      code: `const $ = (id) =>\n  document.getElementById(id);\n\nfunction openLog() {\n  // This returned null, then crashed:\n  $('reason-options input').checked = true;\n  dialog.showModal();\n}`,
      question: 'Which line finds the input and fixes the crash?',
      choices: [
        `$('#reason-options input').checked = true;`,
        `document.getElementById('reason-options input').checked = true;`,
        `document.querySelector('#reason-options input').checked = true;`
      ],
      answer: 2,
      hint: 'getElementById takes only an element ID. querySelector understands #id and descendant selectors.',
      success: 'Boss defeated. querySelector finds the input inside #reason-options. That was the actual Clutch Lab fix.'
    }
  ];

  const $ = id => document.getElementById(id);
  const screens = [$('intro-screen'), $('room-screen'), $('win-screen')];
  let current = -1;
  let cleared = false;
  let hintUsed = false;
  let hints = 0;
  let startTime = 0;
  let elapsed = 0;
  let clockTimer = null;

  function format(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function readBest() {
    try { const n = Number(localStorage.getItem('debug-dungeon.best-seconds.v1')); return n > 0 ? n : null; }
    catch { return null; }
  }
  function storeBest(seconds) {
    const best = readBest();
    if (best !== null && best <= seconds) return best;
    try { localStorage.setItem('debug-dungeon.best-seconds.v1', String(seconds)); }
    catch { /* Playing still works if storage is blocked. */ }
    return seconds;
  }
  function show(screen) { screens.forEach(item => item.classList.toggle('hidden', item !== screen)); }
  function updateMap() {
    document.querySelectorAll('.map-step').forEach((step, index) => {
      const done = index < current || (index === current && cleared) || current >= rooms.length;
      step.classList.toggle('done', done);
      step.classList.toggle('current', index === current && !cleared);
      step.querySelector('i').textContent = done ? '✦' : '◇';
      step.setAttribute('aria-label', `${rooms[index].title}: ${done ? 'complete' : index === current ? 'current' : 'locked'}`);
    });
    $('shard-count').textContent = `${Math.max(0, Math.min(rooms.length, current + (cleared ? 1 : 0)))} / ${rooms.length}`;
  }
  function tick() {
    elapsed = Math.max(0, Math.floor((performance.now() - startTime) / 1000));
    $('clock').textContent = format(elapsed);
  }
  function start() {
    clearInterval(clockTimer);
    current = 0; cleared = false; hintUsed = false; hints = 0; elapsed = 0;
    startTime = performance.now();
    $('clock').textContent = '00:00';
    clockTimer = setInterval(tick, 250);
    renderRoom();
  }
  function renderRoom() {
    const room = rooms[current];
    cleared = false; hintUsed = false;
    show($('room-screen'));
    $('chapter-label').textContent = room.eyebrow;
    $('room-eyebrow').textContent = room.eyebrow;
    $('room-type').textContent = room.type;
    $('room-title').textContent = room.title;
    $('room-story').textContent = room.story;
    $('room-emblem').textContent = room.emblem;
    $('file-name').textContent = room.file;
    $('code-block').textContent = room.code;
    $('question').textContent = room.question;
    $('hint-text').textContent = room.hint;
    $('hint-text').classList.add('hidden');
    $('hint-button').disabled = false;
    $('hint-button').textContent = '✦ REVEAL HINT';
    $('feedback').textContent = '';
    $('feedback').classList.remove('success');
    $('next-button').classList.add('hidden');
    $('next-button').innerHTML = current === rooms.length - 1 ? 'ESCAPE THE DUNGEON <span>↗</span>' : 'NEXT ROOM <span>↗</span>';
    const choices = $('choices');
    choices.replaceChildren();
    room.choices.forEach((label, index) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.type = 'button';
      const number = document.createElement('b'); number.textContent = String(index + 1).padStart(2, '0');
      const text = document.createElement('span'); text.textContent = label;
      button.append(number, text);
      button.addEventListener('click', () => choose(index, button));
      choices.append(button);
    });
    updateMap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $('room-title').setAttribute('tabindex', '-1');
    $('room-title').focus({ preventScroll: true });
  }
  function choose(index, button) {
    if (cleared) return;
    const room = rooms[current];
    if (index !== room.answer) {
      button.classList.add('wrong');
      $('feedback').textContent = 'Not quite. Trace the code once more, then try another patch.';
      return;
    }
    cleared = true;
    button.classList.add('correct');
    document.querySelectorAll('.choice').forEach(item => { item.disabled = true; });
    $('feedback').textContent = room.success;
    $('feedback').classList.add('success');
    $('next-button').classList.remove('hidden');
    updateMap();
    $('next-button').focus();
  }
  function advance() {
    if (!cleared) return;
    current++;
    if (current < rooms.length) { renderRoom(); return; }
    clearInterval(clockTimer);
    tick();
    const best = storeBest(Math.max(1, elapsed));
    $('chapter-label').textContent = 'QUEST COMPLETE / THE EXIT';
    $('final-time').textContent = format(elapsed);
    $('final-hints').textContent = String(hints);
    $('best-time').textContent = format(best);
    show($('win-screen'));
    updateMap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $('win-title').setAttribute('tabindex', '-1');
    $('win-title').focus({ preventScroll: true });
  }
  $('start-button').addEventListener('click', start);
  $('again-button').addEventListener('click', start);
  $('next-button').addEventListener('click', advance);
  $('hint-button').addEventListener('click', () => {
    if (hintUsed || cleared) return;
    hintUsed = true; hints++;
    $('hint-text').classList.remove('hidden');
    $('hint-button').textContent = 'HINT REVEALED';
    $('hint-button').disabled = true;
  });
  document.addEventListener('keydown', event => {
    if (current < 0 || current >= rooms.length || cleared || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!/^[1-3]$/.test(event.key)) return;
    const button = $('choices').children[Number(event.key) - 1];
    if (button) { event.preventDefault(); button.click(); button.focus(); }
  });
  updateMap();
})();
