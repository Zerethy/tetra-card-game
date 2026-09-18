import { DIRECTIONS, ELEMENT_BEATS, TYPE_BEATS, ROSTER, hexDigit, tierOf } from './cards.js';

export const DECK_SIZE = 8;
const HAND_SIZE = 5;
const BOARD_SIZE = 9;
const COLS = 3;

/** Each starter deck of 8: mostly beasts, one warlord, one relic, one sovereign. */
export const DECK_QUOTA = { beast: 5, warlord: 1, relic: 1, sovereign: 1 };

export function mulberry32(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rng) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function instanceCard(template, owner, instanceId) {
  return {
    ...template,
    owner,
    instanceId,
  };
}

function bucketRoster(roster, rng) {
  const buckets = { beast: [], warlord: [], relic: [], sovereign: [] };
  for (const card of shuffle(roster, rng)) {
    buckets[tierOf(card)].push(card);
  }
  return buckets;
}

function takeFromQuota(buckets, rng) {
  const deck = [];
  for (const [tier, count] of Object.entries(DECK_QUOTA)) {
    for (let i = 0; i < count; i++) {
      if (buckets[tier].length) deck.push(buckets[tier].pop());
    }
  }
  const fallback = ['sovereign', 'relic', 'warlord', 'beast'];
  while (deck.length < DECK_SIZE) {
    const tier = fallback.find((key) => buckets[key].length);
    if (!tier) break;
    deck.push(buckets[tier].pop());
  }
  return shuffle(deck, rng);
}

export function dealStarterDecks(roster, rng) {
  const buckets = bucketRoster(roster, rng);
  return {
    player: takeFromQuota(buckets, rng),
    ai: takeFromQuota(buckets, rng),
  };
}

export function createMatch(options = {}) {
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = options.rng || mulberry32(seed);
  const dealt = options.playerTemplates && options.aiTemplates
    ? { player: options.playerTemplates, ai: options.aiTemplates }
    : dealStarterDecks(ROSTER, rng);
  let nextId = 1;

  const playerDeck = dealt.player.map((c) => instanceCard(c, 'player', nextId++));
  const aiDeck = dealt.ai.map((c) => instanceCard(c, 'ai', nextId++));

  const playerHand = playerDeck.splice(0, Math.min(HAND_SIZE, playerDeck.length));
  const aiHand = aiDeck.splice(0, Math.min(HAND_SIZE, aiDeck.length));

  const phase = playerHand.length ? 'player' : aiHand.length ? 'ai' : 'ended';

  return {
    seed,
    phase,
    board: Array(BOARD_SIZE).fill(null),
    player: { deck: playerDeck, hand: playerHand },
    ai: { deck: aiDeck, hand: aiHand },
    events: [],
    winner: null,
    rng,
    tradeRule: options.tradeRule || 'one',
    rivalId: options.rivalId || 'vesper',
  };
}

export function emptyCells(board) {
  const cells = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) cells.push(i);
  }
  return cells;
}

export function cellToRC(index) {
  return { r: Math.floor(index / COLS), c: index % COLS };
}

export function rcToCell(r, c) {
  if (r < 0 || r > 2 || c < 0 || c > 2) return -1;
  return r * COLS + c;
}

export function arrowTargets(index, arrows) {
  const { r, c } = cellToRC(index);
  const hits = [];
  for (const dir of DIRECTIONS) {
    if (!(arrows & dir.bit)) continue;
    const next = rcToCell(r + dir.dr, c + dir.dc);
    if (next >= 0) hits.push({ index: next, dir });
  }
  return hits;
}

export function hasOpposingArrow(card, fromIndex, toIndex) {
  if (!card) return false;
  const from = cellToRC(fromIndex);
  const to = cellToRC(toIndex);
  const dr = to.r - from.r;
  const dc = to.c - from.c;
  const dir = DIRECTIONS.find((d) => d.dr === dr && d.dc === dc);
  if (!dir) return false;
  return Boolean(card.arrows & dir.bit);
}

export function hexBand(displayed, rng) {
  const n = Math.max(0, Math.min(15, displayed | 0));
  return n * 16 + Math.floor(rng() * 16);
}

export function combatRoll(stat, rng) {
  const actual = hexBand(stat, rng);
  const reduction = Math.floor(rng() * (actual + 1));
  return { actual, remainder: actual - reduction };
}

export function defenderStat(attacker, defender) {
  switch (attacker.type) {
    case 'P':
      return { stat: defender.pdef, label: 'P.Def' };
    case 'M':
      return { stat: defender.mdef, label: 'M.Def' };
    case 'X':
      return defender.pdef <= defender.mdef
        ? { stat: defender.pdef, label: 'P.Def (X)' }
        : { stat: defender.mdef, label: 'M.Def (X)' };
    case 'A': {
      const stats = [
        { stat: defender.attack, label: 'Atk (A)' },
        { stat: defender.pdef, label: 'P.Def (A)' },
        { stat: defender.mdef, label: 'M.Def (A)' },
      ];
      stats.sort((a, b) => a.stat - b.stat);
      return stats[0];
    }
    default:
      return { stat: defender.pdef, label: 'P.Def' };
  }
}

export function elementModifier(attacker, defender) {
  if (!attacker.element || !defender.element) return 0;
  if (ELEMENT_BEATS[attacker.element] === defender.element) return 2;
  if (ELEMENT_BEATS[defender.element] === attacker.element) return -2;
  return 0;
}

/** +1 printed Attack when the attacker’s type beats the defender’s. */
export function typeModifier(attacker, defender) {
  const a = attacker?.type;
  const d = defender?.type;
  if (!a || !d || a === d) return 0;
  if (TYPE_BEATS[a] === d) return 1;
  if (TYPE_BEATS[d] === a) return -1;
  return 0;
}

export function resolveBattle(attacker, defender, rng) {
  const elementMod = elementModifier(attacker, defender);
  const typeMod = typeModifier(attacker, defender);
  const atkStat = Math.max(0, Math.min(15, attacker.attack + elementMod + typeMod));
  const defInfo = defenderStat(attacker, defender);
  const atkRoll = combatRoll(atkStat, rng);
  const defRoll = combatRoll(defInfo.stat, rng);
  const attackerWins = atkRoll.remainder > defRoll.remainder;
  return {
    attackerWins,
    atkRoll,
    defRoll,
    atkStat,
    defStat: defInfo.stat,
    defLabel: defInfo.label,
    elementMod,
    typeMod,
    attackerType: attacker.type,
    defenderType: defender.type,
    attackerElement: attacker.element || null,
    defenderElement: defender.element || null,
    summary:
      `${attacker.name} ${hexDigit(atkStat)}${attacker.type} rolled ${atkRoll.remainder}` +
      ` vs ${defender.name} ${defInfo.label} ${hexDigit(defInfo.stat)} rolled ${defRoll.remainder}`,
  };
}

function opponentOf(owner) {
  return owner === 'player' ? 'ai' : 'player';
}

function comboFrom(board, origin, owner, events) {
  const card = board[origin];
  if (!card) return;
  for (const hit of arrowTargets(origin, card.arrows)) {
    const target = board[hit.index];
    if (target && target.owner !== owner) {
      target.owner = owner;
      events.push({
        type: 'combo',
        cell: hit.index,
        name: target.name,
        owner,
      });
    }
  }
}

export function resolveCaptures(state, placedIndex, owner) {
  const events = [];
  const board = state.board;
  const placed = board[placedIndex];
  if (!placed) return events;

  const enemyHits = arrowTargets(placedIndex, placed.arrows).filter((hit) => {
    const card = board[hit.index];
    return card && card.owner !== owner;
  });

  const weak = [];
  const contested = [];
  for (const hit of enemyHits) {
    if (hasOpposingArrow(board[hit.index], hit.index, placedIndex)) contested.push(hit);
    else weak.push(hit);
  }

  const captured = [];
  for (const hit of weak) {
    board[hit.index].owner = owner;
    captured.push(hit.index);
    events.push({ type: 'capture', cell: hit.index, name: board[hit.index].name, owner, kind: 'arrow' });
  }

  let stillOurs = true;
  for (const hit of contested) {
    if (!stillOurs) break;
    const defender = board[hit.index];
    if (!defender || defender.owner === owner) continue;
    const battle = resolveBattle(placed, defender, state.rng);
    events.push({
      type: 'battle',
      attackerCell: placedIndex,
      defenderCell: hit.index,
      attackerName: placed.name,
      defenderName: defender.name,
      ...battle,
    });
    if (battle.attackerWins) {
      defender.owner = owner;
      captured.push(hit.index);
      events.push({ type: 'capture', cell: hit.index, name: defender.name, owner, kind: 'battle' });
      comboFrom(board, hit.index, owner, events);
    } else {
      placed.owner = opponentOf(owner);
      stillOurs = false;
      events.push({
        type: 'counter',
        cell: placedIndex,
        name: placed.name,
        owner: placed.owner,
      });
      comboFrom(board, placedIndex, placed.owner, events);
    }
  }

  if (stillOurs) {
    for (const cell of captured) comboFrom(board, cell, owner, events);
  }

  return events;
}

export function placeCard(state, owner, handIndex, cellIndex) {
  if (state.phase !== owner) {
    return { ok: false, reason: 'not-your-turn' };
  }
  if (cellIndex < 0 || cellIndex >= BOARD_SIZE || state.board[cellIndex]) {
    return { ok: false, reason: 'illegal-cell' };
  }
  const side = owner === 'player' ? state.player : state.ai;
  if (handIndex < 0 || handIndex >= side.hand.length) {
    return { ok: false, reason: 'illegal-hand' };
  }

  const card = side.hand.splice(handIndex, 1)[0];
  card.owner = owner;
  state.board[cellIndex] = card;

  const events = resolveCaptures(state, cellIndex, owner);
  events.unshift({ type: 'place', cell: cellIndex, name: card.name, owner });
  state.events = events;

  advancePhase(state, owner);

  return { ok: true, events };
}

function sideHasCards(state, who) {
  const side = who === 'player' ? state.player : state.ai;
  return side.hand.length > 0;
}

export function advancePhase(state, afterOwner) {
  const remaining = emptyCells(state.board);
  const other = afterOwner === 'player' ? 'ai' : 'player';
  if (remaining.length === 0 || (!sideHasCards(state, 'player') && !sideHasCards(state, 'ai'))) {
    state.phase = 'ended';
    const s = scores(state);
    state.winner = s.player > s.ai ? 'player' : s.ai > s.player ? 'ai' : 'draw';
    return;
  }
  if (sideHasCards(state, other)) {
    state.phase = other;
  } else {
    state.phase = afterOwner;
  }
}

export function scores(state) {
  let player = state.player.hand.length;
  let ai = state.ai.hand.length;
  for (const card of state.board) {
    if (!card) continue;
    if (card.owner === 'player') player += 1;
    else ai += 1;
  }
  return { player, ai };
}

export function cloneState(state) {
  const copy = structuredClone({
    ...state,
    rng: undefined,
  });
  copy.rng = state.rng;
  return copy;
}

export { HAND_SIZE, BOARD_SIZE };
