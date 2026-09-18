import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createMatch,
  placeCard,
  scores,
  resolveBattle,
  mulberry32,
  emptyCells,
  elementModifier,
  hasOpposingArrow,
  DECK_QUOTA,
} from './game.js';
import { DIR, rarityOf, frameOf, loreOf, ROSTER, LEVELS, totalValue, maxRank, tierOf } from './cards.js';
import { chooseAiMove } from './ai.js';
import { renderCard } from './ui.js';

function card(partial) {
  return {
    id: 'test',
    name: partial.name || 'Test',
    title: 'Trial',
    attack: 8,
    type: 'P',
    pdef: 2,
    mdef: 2,
    arrows: DIR.E,
    element: null,
    art: 'drake',
    owner: 'player',
    instanceId: 1,
    ...partial,
  };
}

function stateWith(board, extra = {}) {
  return {
    seed: 1,
    phase: extra.phase || 'player',
    board,
    player: { deck: [], hand: extra.playerHand || [card({ instanceId: 10, arrows: DIR.E })] },
    ai: { deck: [], hand: extra.aiHand || [] },
    events: [],
    winner: null,
    rng: extra.rng || mulberry32(1),
  };
}

test('new match draws five cards each and starts on the player turn', () => {
  const match = createMatch({ seed: 7 });
  assert.equal(match.player.hand.length, 5);
  assert.equal(match.ai.hand.length, 5);
  assert.equal(match.player.deck.length, 3);
  assert.equal(match.ai.deck.length, 3);
  assert.equal(match.phase, 'player');
  assert.equal(scores(match).player, 5);
  assert.equal(scores(match).ai, 5);
});

test('opposing arrow detection uses the vector from the defending card', () => {
  const west = card({ arrows: DIR.W });
  const east = card({ arrows: DIR.E });
  assert.equal(hasOpposingArrow(west, 1, 0), true);
  assert.equal(hasOpposingArrow(east, 1, 0), false);
  assert.equal(hasOpposingArrow(east, 0, 1), true);
});

test('unprotected arrows capture immediately', () => {
  const enemy = card({
    name: 'Foe',
    owner: 'ai',
    instanceId: 2,
    arrows: DIR.N,
    attack: 9,
    pdef: 9,
  });
  const st = stateWith([null, enemy, null, null, null, null, null, null, null]);
  const result = placeCard(st, 'player', 0, 0);
  assert.equal(result.ok, true);
  assert.equal(st.board[1].owner, 'player');
  assert.ok(result.events.some((e) => e.type === 'capture' && e.kind === 'arrow'));
});

test('opposing arrows trigger a battle and a high attack can capture', () => {
  const enemy = card({
    name: 'Wall',
    owner: 'ai',
    instanceId: 2,
    arrows: DIR.W,
    attack: 1,
    type: 'P',
    pdef: 0,
    mdef: 0,
  });
  const st = stateWith([null, enemy, null, null, null, null, null, null, null], {
    playerHand: [card({ attack: 15, type: 'P', pdef: 8, mdef: 8, arrows: DIR.E })],
    rng: () => 0,
  });
  const result = placeCard(st, 'player', 0, 0);
  assert.equal(result.ok, true);
  assert.ok(result.events.some((e) => e.type === 'battle'));
  assert.equal(st.board[1].owner, 'player');
});

test('losing a clash counter-captures the placed card', () => {
  const enemy = card({
    name: 'Fortress',
    owner: 'ai',
    instanceId: 2,
    arrows: DIR.W,
    attack: 1,
    type: 'P',
    pdef: 15,
    mdef: 15,
  });
  const st = stateWith([null, enemy, null, null, null, null, null, null, null], {
    playerHand: [card({ attack: 0, type: 'P', pdef: 0, mdef: 0, arrows: DIR.E })],
    rng: () => 0,
  });
  const result = placeCard(st, 'player', 0, 0);
  assert.equal(result.ok, true);
  assert.equal(st.board[0].owner, 'ai');
  assert.ok(result.events.some((e) => e.type === 'counter' || (e.type === 'battle' && !e.attackerWins)));
});

test('combo flips a second enemy pointed at by the captured card', () => {
  const first = card({
    name: 'Link',
    owner: 'ai',
    instanceId: 2,
    arrows: DIR.S,
    attack: 0,
    pdef: 0,
    mdef: 0,
  });
  const second = card({
    name: 'Tail',
    owner: 'ai',
    instanceId: 3,
    arrows: 0,
    attack: 0,
    pdef: 8,
    mdef: 8,
  });
  const st = stateWith([null, first, null, null, second, null, null, null, null]);
  placeCard(st, 'player', 0, 0);
  assert.equal(st.board[1].owner, 'player');
  assert.equal(st.board[4].owner, 'player');
});

test('filling the board decides a winner', () => {
  const st = stateWith(Array(9).fill(null), {
    playerHand: [
      card({ instanceId: 11, arrows: 0 }),
      card({ instanceId: 12, arrows: 0 }),
      card({ instanceId: 13, arrows: 0 }),
      card({ instanceId: 14, arrows: 0 }),
      card({ instanceId: 15, arrows: 0 }),
    ],
    aiHand: [
      card({ owner: 'ai', instanceId: 21, arrows: 0 }),
      card({ owner: 'ai', instanceId: 22, arrows: 0 }),
      card({ owner: 'ai', instanceId: 23, arrows: 0 }),
      card({ owner: 'ai', instanceId: 24, arrows: 0 }),
    ],
  });
  let turn = 'player';
  while (emptyCells(st.board).length) {
    const handIndex = 0;
    const cell = emptyCells(st.board)[0];
    const res = placeCard(st, turn, handIndex, cell);
    assert.equal(res.ok, true);
    turn = st.phase === 'ended' ? turn : st.phase;
  }
  assert.equal(st.phase, 'ended');
  assert.ok(['player', 'ai', 'draw'].includes(st.winner));
  const s = scores(st);
  assert.equal(s.player + s.ai, 9);
});

test('element wheel grants a modifier', () => {
  assert.equal(elementModifier({ element: 'fire' }, { element: 'ice' }), 2);
  assert.equal(elementModifier({ element: 'ice' }, { element: 'fire' }), -2);
  assert.equal(elementModifier({ element: 'fire' }, { element: 'earth' }), 0);
  assert.equal(elementModifier({ element: null }, { element: 'ice' }), 0);
});

test('assault type targets the lowest defender stat', () => {
  const battle = resolveBattle(
    card({ attack: 5, type: 'A' }),
    card({ attack: 9, pdef: 8, mdef: 1 }),
    mulberry32(4),
  );
  assert.equal(battle.defStat, 1);
});

test('AI selects a legal empty cell and a card from its hand', () => {
  const match = createMatch({ seed: 21 });
  match.phase = 'ai';
  const move = chooseAiMove(match);
  assert.ok(move.handIndex >= 0 && move.handIndex < match.ai.hand.length);
  assert.ok(emptyCells(match.board).includes(move.cellIndex));
  const result = placeCard(match, 'ai', move.handIndex, move.cellIndex);
  assert.equal(result.ok, true);
  assert.equal(match.phase, 'player');
});

test('rarity follows card level', () => {
  assert.equal(rarityOf({ level: 1 }), 'common');
  assert.equal(rarityOf({ level: 4 }), 'uncommon');
  assert.equal(rarityOf({ level: 6 }), 'rare');
  assert.equal(rarityOf({ level: 8 }), 'epic');
  assert.equal(rarityOf({ level: 10 }), 'legendary');
  assert.equal(rarityOf({ rarity: 'rare', level: 10 }), 'rare');
});

test('frame color and lore are original English chrome, not battle math', () => {
  assert.equal(frameOf({ element: 'fire' }), 'crimson');
  assert.equal(frameOf({ element: 'holy' }), 'ivory');
  assert.equal(frameOf({ element: 'dark' }), 'void');
  const lore = loreOf({ id: 'iron-vow', title: 'Oath Paladin' });
  assert.match(lore.kind, /Warlord/);
  assert.match(lore.kind, /Paladin/);
  assert.match(lore.flavor, /vow/i);
  assert.equal(loreOf({ title: 'Trial' }).kind, 'Beast — Trial');
});

test('rendered cards keep tetra stats, arrows, and real English flavor', () => {
  const html = renderCard({
    id: 'iron-vow',
    name: 'Iron Vow',
    title: 'Oath Paladin',
    attack: 7,
    type: 'P',
    pdef: 9,
    mdef: 4,
    arrows: DIR.N | DIR.S,
    element: 'holy',
    art: 'paladin',
    owner: 'player',
    instanceId: 3,
    level: 6,
  });
  assert.match(html, /Iron Vow/);
  assert.match(html, /The vow is older than the armor/);
  assert.match(html, /Oath Paladin/);
  assert.match(html, />Warlord</);
  assert.match(html, /data-level="6"/);
  assert.match(html, /class="tm-level"[^>]*>6</);
  assert.match(html, /class="arr N"/);
  assert.match(html, /class="arr S"/);
  assert.match(html, /<span class="atk">7<\/span>/);
  assert.match(html, /<span class="typ">P<\/span>/);
  assert.match(html, /<span class="pd">9<\/span>/);
  assert.match(html, /<span class="md">4<\/span>/);
  assert.match(html, /frame-ivory/);
  assert.match(html, /owner-player/);
  assert.doesNotMatch(html, /[\uE000-\uF8FF]/);
});

test('every roster card sits inside its level band', () => {
  assert.equal(ROSTER.length, 22);
  for (const card of ROSTER) {
    const band = LEVELS[card.level - 1];
    assert.ok(band, card.id);
    const total = totalValue(card);
    const peak = maxRank(card);
    assert.ok(
      total >= band.totalMin && total <= band.totalMax,
      `${card.id} total ${total} not in ${band.totalMin}–${band.totalMax}`,
    );
    assert.ok(peak <= band.maxRank, `${card.id} rank ${peak} exceeds ${band.maxRank}`);
  }
});

test('player and AI starter decks share the same level mix and no cards', () => {
  for (const seed of [1, 7, 21, 99, 404]) {
    const match = createMatch({ seed });
    const player = [...match.player.hand, ...match.player.deck];
    const ai = [...match.ai.hand, ...match.ai.deck];
    assert.equal(player.length, 8);
    assert.equal(ai.length, 8);
    const tally = (cards) => {
      const counts = { beast: 0, warlord: 0, relic: 0, sovereign: 0 };
      for (const card of cards) counts[tierOf(card)] += 1;
      return counts;
    };
    assert.deepEqual(tally(player), DECK_QUOTA);
    assert.deepEqual(tally(ai), DECK_QUOTA);
    const ids = [...player, ...ai].map((c) => c.id);
    assert.equal(new Set(ids).size, 16);
  }
});
