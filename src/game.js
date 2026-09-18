import { SIDES, ELEMENT_BEATS, ROSTER, tierOf, totalValue } from './cards.js';

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

export function neighborsOf(index) {
  const { r, c } = cellToRC(index);
  const hits = [];
  for (const side of SIDES) {
    const next = rcToCell(r + side.dr, c + side.dc);
    if (next >= 0) hits.push({ index: next, side: side.key, opposite: side.opposite });
  }
  return hits;
}

export function elementModifier(attacker, defender) {
  if (!attacker?.element || !defender?.element) return 0;
  if (ELEMENT_BEATS[attacker.element] === defender.element) return 1;
  if (ELEMENT_BEATS[defender.element] === attacker.element) return -1;
  return 0;
}

/** Compare touching sides. Higher printed rank wins. Element is ±1 and cannot reverse a gap of 2+. */
export function compareSides(attacker, defender, attackSide) {
  const side = SIDES.find((s) => s.key === attackSide);
  const opposite = side?.opposite || 'bottom';
  const rawAtk = attacker[attackSide] | 0;
  const rawDef = defender[opposite] | 0;
  const elementMod = elementModifier(attacker, defender);
  const usedAtk = rawAtk + elementMod;
  const attackerWins = usedAtk > rawDef;
  return {
    attackerWins,
    rawAtk,
    rawDef,
    atkStat: usedAtk,
    defStat: rawDef,
    side: attackSide,
    opposite,
    elementMod,
    attackerElement: attacker.element || null,
    defenderElement: defender.element || null,
    summary: `${rawAtk} vs ${rawDef} — ${attackerWins ? 'capture' : 'held'}`,
  };
}

/** Death Match / value compare: sum of the four sides. Element ±1 only on a tied sum. */
export function resolveBattle(attacker, defender, rng) {
  const rawAtk = totalValue(attacker);
  const rawDef = totalValue(defender);
  const tied = rawAtk === rawDef;
  const elementMod = tied ? elementModifier(attacker, defender) : 0;
  const usedAtk = rawAtk + elementMod;
  const attackerWins = usedAtk > rawDef;
  void rng;
  return {
    attackerWins,
    atkStat: usedAtk,
    defStat: rawDef,
    rawAtk,
    rawDef,
    defLabel: 'total',
    elementMod,
    attackerElement: attacker.element || null,
    defenderElement: defender.element || null,
    summary: `${rawAtk} vs ${rawDef} — ${attackerWins ? 'capture' : 'held'}`,
  };
}

export function resolveCaptures(state, placedIndex, owner) {
  const events = [];
  const board = state.board;
  if (!board[placedIndex]) return events;

  const queue = [{ index: placedIndex, kind: 'place' }];
  while (queue.length) {
    const { index: origin, kind } = queue.shift();
    const card = board[origin];
    if (!card || card.owner !== owner) continue;
    for (const hit of neighborsOf(origin)) {
      const defender = board[hit.index];
      if (!defender || defender.owner === owner) continue;
      const battle = compareSides(card, defender, hit.side);
      events.push({
        type: 'battle',
        attackerCell: origin,
        defenderCell: hit.index,
        attackerName: card.name,
        defenderName: defender.name,
        combo: kind === 'combo',
        ...battle,
      });
      if (!battle.attackerWins) continue;
      defender.owner = owner;
      events.push({
        type: kind === 'place' ? 'capture' : 'combo',
        cell: hit.index,
        name: defender.name,
        owner,
        kind: 'side',
      });
      queue.push({ index: hit.index, kind: 'combo' });
    }
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
