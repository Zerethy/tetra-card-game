import { createMatch, placeCard, scores } from './game.js';
import { chooseAiMove } from './ai.js';
import { renderCard, renderCardBack, renderElementWheel, clashFlashHtml } from './ui.js';

const els = {
  title: document.getElementById('title-overlay'),
  help: document.getElementById('help-overlay'),
  start: document.getElementById('start-btn'),
  newBtn: document.getElementById('new-btn'),
  helpBtn: document.getElementById('help-btn'),
  titleHelp: document.getElementById('title-help-btn'),
  closeHelp: document.getElementById('close-help'),
  board: document.getElementById('board'),
  playerRail: document.getElementById('player-rail'),
  aiRail: document.getElementById('ai-rail'),
  scoreAi: document.getElementById('score-ai'),
  scorePlayer: document.getElementById('score-player'),
  status: document.getElementById('status'),
  hint: document.getElementById('hint'),
  log: document.getElementById('combat-log'),
  result: document.getElementById('result-layer'),
  banner: document.getElementById('result-banner'),
  pip: document.getElementById('turn-pip'),
  side: document.getElementById('side-cards'),
  again: document.getElementById('again-btn'),
  wheel: document.getElementById('hud-wheel'),
  titleDeck: document.getElementById('title-deck'),
};

let match = null;
let selected = null;
let busy = false;
let lastPlaced = null;
let captureCells = new Set();
let clashFlashes = new Map();
let audioCtx = null;

function audio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tone(freq, duration = 0.12, type = 'square', gain = 0.045) {
  try {
    const ctx = audio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* autoplay restrictions */
  }
}

function sfx(kind) {
  if (kind === 'place') tone(196, 0.1);
  if (kind === 'capture') {
    tone(330, 0.08);
    setTimeout(() => tone(440, 0.1), 70);
  }
  if (kind === 'counter') tone(110, 0.22, 'sawtooth', 0.05);
  if (kind === 'win') {
    tone(392, 0.18, 'triangle', 0.05);
    setTimeout(() => tone(523, 0.28, 'triangle', 0.05), 120);
  }
  if (kind === 'lose') tone(98, 0.4, 'sawtooth', 0.05);
}

function startMatch() {
  match = createMatch();
  selected = null;
  busy = false;
  lastPlaced = null;
  captureCells = new Set();
  clashFlashes = new Map();
  els.title.classList.add('hidden');
  els.result.classList.add('hidden');
  els.wheel.classList.remove('hidden');
  if (!els.wheel.dataset.ready) {
    els.wheel.innerHTML = renderElementWheel();
    els.wheel.dataset.ready = '1';
  }
  els.log.textContent = 'Hands drawn. Five champions each.';
  render();
}

function render() {
  if (!match) {
    els.board.innerHTML = '';
    els.playerRail.innerHTML = '';
    els.aiRail.innerHTML = '';
    return;
  }

  const s = scores(match);
  els.scoreAi.textContent = String(s.ai);
  els.scorePlayer.textContent = String(s.player);

  els.board.innerHTML = match.board
    .map((card, i) => {
      const open = !card && match.phase === 'player' && selected != null && !busy;
      const classes = ['cell', open ? 'open' : '', card ? 'filled' : '', !open && !card ? 'blocked' : '']
        .filter(Boolean)
        .join(' ');
      const flash = clashFlashes.get(i) || '';
      const body = card
        ? renderCard(card, {
            surface: `b${i}`,
            captured: captureCells.has(i),
            placed: lastPlaced === i,
          })
        : '';
      return `<div class="${classes}" data-cell="${i}">${body}${flash}</div>`;
    })
    .join('');

  els.playerRail.innerHTML = match.player.hand
    .map((card, i) =>
      renderCard(card, {
        surface: `h${i}`,
        selected: selected === i,
        showName: true,
      }),
    )
    .join('');

  els.aiRail.innerHTML = match.ai.hand.map((_, i) => renderCardBack(i)).join('');

  if (match.phase === 'ended' && match.ai.hand.length) {
    els.side.innerHTML = match.ai.hand
      .map((card) => renderCard(card, { surface: 'side', showName: false }))
      .join('');
  } else if (match.phase === 'ended' && match.player.hand.length) {
    els.side.innerHTML = match.player.hand
      .map((card) => renderCard(card, { surface: 'side', showName: false }))
      .join('');
  } else {
    els.side.innerHTML = '';
  }

  els.pip.classList.toggle('ai-turn', match.phase === 'ai');

  if (match.phase === 'player') {
    els.status.textContent = selected == null
      ? 'Your turn — choose a champion from your hand.'
      : 'Place it on an empty square.';
    els.hint.textContent = selected == null
      ? ''
      : `${match.player.hand[selected].name} · Lv.${match.player.hand[selected].level} · ${match.player.hand[selected].title}`;
  } else if (match.phase === 'ai') {
    els.status.textContent = 'Lady Vesper studies the grid…';
    els.hint.textContent = '';
  } else if (match.phase === 'ended') {
    const result = match.winner === 'player' ? 'Victory' : match.winner === 'ai' ? 'Defeat' : 'Draw';
    els.status.textContent = `${result}. Blue ${s.player} — Pink ${s.ai}.`;
    els.hint.textContent = 'Start a new match to draw again.';
  }

  if (match.phase === 'ended') showResult();
  else els.result.classList.add('hidden');
  els.again.classList.toggle('hidden', match.phase !== 'ended');
}

function showResult() {
  els.result.classList.remove('hidden');
  els.banner.classList.remove('lose', 'draw');
  if (match.winner === 'player') {
    els.banner.innerHTML = `<span class="you">You</span> <span class="win">Win!</span>`;
  } else if (match.winner === 'ai') {
    els.banner.classList.add('lose');
    els.banner.innerHTML = `<span class="you">You</span> <span class="win">Lose!</span>`;
  } else {
    els.banner.classList.add('draw');
    els.banner.innerHTML = `<span class="you">Draw</span> <span class="win">Game</span>`;
  }
}

function describeEvents(events) {
  if (!events?.length) return '';
  const bits = [];
  for (const ev of events) {
    if (ev.type === 'battle') {
      const extras = [];
      if (ev.typeMod) extras.push(`type ${ev.typeMod > 0 ? '+' : ''}${ev.typeMod}`);
      if (ev.elementMod) extras.push(`element ${ev.elementMod > 0 ? '+' : ''}${ev.elementMod}`);
      bits.push(
        `${ev.attackerName} rolled ${ev.atkRoll.remainder} vs ${ev.defenderName} ${ev.defLabel} ${ev.defRoll.remainder}` +
          (extras.length ? ` (${extras.join(', ')})` : '') +
          (ev.attackerWins ? ' — captured!' : ' — counter-seize!'),
      );
    } else if (ev.type === 'capture' && ev.kind === 'arrow') {
      bits.push(`${ev.name} had no answering arrow and flipped.`);
    } else if (ev.type === 'combo') {
      bits.push(`Combo! ${ev.name} is swept.`);
    } else if (ev.type === 'counter') {
      bits.push(`${ev.name} falls to a counter.`);
    }
  }
  return bits.join(' ');
}

function afterPlace(events, who) {
  captureCells = new Set(
    events.filter((e) => e.type === 'capture' || e.type === 'combo' || e.type === 'counter').map((e) => e.cell),
  );
  lastPlaced = events.find((e) => e.type === 'place')?.cell ?? null;
  clashFlashes = new Map();
  for (const ev of events) {
    if (ev.type !== 'battle') continue;
    const html = clashFlashHtml(ev);
    if (html) clashFlashes.set(ev.defenderCell, html);
  }
  els.log.textContent = describeEvents(events) || `${who === 'player' ? 'You' : 'Lady Vesper'} placed a card.`;
  if (events.some((e) => e.type === 'counter')) sfx('counter');
  else if (events.some((e) => e.type === 'capture' || e.type === 'combo')) sfx('capture');
  else sfx('place');
  render();
  window.setTimeout(() => {
    captureCells = new Set();
    lastPlaced = null;
    clashFlashes = new Map();
    if (match.phase === 'ended') {
      sfx(match.winner === 'player' ? 'win' : match.winner === 'ai' ? 'lose' : 'place');
      render();
      busy = false;
    } else if (match.phase === 'ai' && who === 'player') {
      window.setTimeout(aiTurn, 700);
    } else {
      busy = false;
      render();
    }
  }, 560);
}

function aiTurn() {
  if (!match || match.phase !== 'ai') {
    busy = false;
    return;
  }
  const move = chooseAiMove(match);
  const result = placeCard(match, 'ai', move.handIndex, move.cellIndex);
  if (!result.ok) {
    busy = false;
    render();
    return;
  }
  afterPlace(result.events, 'ai');
}

els.playerRail.addEventListener('click', (event) => {
  if (!match || busy || match.phase !== 'player') return;
  const card = event.target.closest('.tm-card');
  if (!card) return;
  const index = [...els.playerRail.querySelectorAll('.tm-card')].indexOf(card);
  if (index < 0) return;
  selected = index;
  render();
});

els.board.addEventListener('click', (event) => {
  if (!match || busy || match.phase !== 'player' || selected == null) return;
  const cell = event.target.closest('[data-cell]');
  if (!cell) return;
  const cellIndex = Number(cell.dataset.cell);
  const result = placeCard(match, 'player', selected, cellIndex);
  if (!result.ok) return;
  selected = null;
  busy = true;
  afterPlace(result.events, 'player');
});

els.start.addEventListener('click', startMatch);
els.newBtn.addEventListener('click', startMatch);
els.again.addEventListener('click', startMatch);
els.helpBtn.addEventListener('click', () => els.help.classList.remove('hidden'));
els.titleHelp.addEventListener('click', () => els.help.classList.remove('hidden'));
els.closeHelp.addEventListener('click', () => els.help.classList.add('hidden'));
els.help.addEventListener('click', (event) => {
  if (event.target === els.help) els.help.classList.add('hidden');
});

if (els.titleDeck) {
  els.titleDeck.innerHTML = [0, 1, 2]
    .map((i) => renderCardBack(`title-${i}`, { owner: 'none' }))
    .join('');
}
