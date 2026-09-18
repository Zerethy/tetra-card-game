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
} from './game.js';
import { DIR, rarityOf } from './cards.js';
import { chooseAiMove } from './ai.js';

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

test('rarity is cosmetic and inferred from printed stats', () => {
  assert.equal(rarityOf({ attack: 10, pdef: 6, mdef: 6 }), 'legendary');
  assert.equal(rarityOf({ attack: 7, pdef: 8, mdef: 8 }), 'legendary');
  assert.equal(rarityOf({ attack: 6, pdef: 5, mdef: 5 }), 'rare');
  assert.equal(rarityOf({ attack: 4, pdef: 4, mdef: 4 }), 'uncommon');
  assert.equal(rarityOf({ rarity: 'rare', attack: 10, pdef: 9, mdef: 9 }), 'rare');
});
