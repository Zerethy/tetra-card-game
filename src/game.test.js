import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createMatch,
  placeCard,
  scores,
  resolveBattle,
  compareSides,
  mulberry32,
  emptyCells,
  elementModifier,
  PLAYER_STARTER_MAX_LEVEL,
} from './game.js';
import { rarityOf, frameOf, loreOf, ROSTER, LEVELS, totalValue, maxRank, levelOf, IDENTITIES, isIdentityId, DEFAULT_IDENTITY_ID } from './cards.js';
import { chooseAiMove } from './ai.js';
import { renderCard, renderCardBack, renderElementWheel, renderAlbumGrid, renderIdentityGrid } from './ui.js';
import {
  BOSSES,
  tradeTakeCount,
  deathTakeCount,
  preferUltimates,
  resolveShowdown,
  buildBossDeck,
  mustDeathMatch,
  makeDeathSession,
  shouldOfferDeathMatch,
  applyWin,
  applyLoss,
  emptyCampaign,
  starterCollection,
  isRivalUnlocked,
  STAGE_COUNT,
  albumProgress,
  sanitizeLoadout,
  pruneLoadout,
  identityUid,
  LOADOUT_SIZE,
  bindIdentity,
  dragAlbumToSlot,
  moveLoadoutIndex,
  removeLoadoutUid,
  swapLoadoutWithAlbum,
} from './campaign.js';

function card(partial) {
  return {
    id: 'test',
    name: partial.name || 'Test',
    title: 'Trial',
    top: 8,
    right: 2,
    bottom: 2,
    left: 2,
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
    player: { deck: [], hand: extra.playerHand || [card({ instanceId: 10, right: 8 })] },
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

test('orthogonal neighbors compare touching sides only', () => {
  const enemy = card({
    name: 'Foe',
    owner: 'ai',
    instanceId: 2,
    left: 3,
    right: 9,
    top: 9,
    bottom: 9,
  });
  const st = stateWith([null, enemy, null, null, null, null, null, null, null], {
    playerHand: [card({ instanceId: 10, right: 6, left: 1, top: 1, bottom: 1 })],
  });
  const result = placeCard(st, 'player', 0, 0);
  assert.equal(result.ok, true);
  assert.equal(st.board[1].owner, 'player');
  assert.ok(result.events.some((e) => e.type === 'battle' && e.summary === '6 vs 3 — capture'));
});

test('a lower touching rank does not capture, and does not counter-capture', () => {
  const enemy = card({
    name: 'Wall',
    owner: 'ai',
    instanceId: 2,
    left: 9,
    right: 1,
    top: 1,
    bottom: 1,
  });
  const st = stateWith([null, enemy, null, null, null, null, null, null, null], {
    playerHand: [card({ instanceId: 10, right: 4, left: 8, top: 8, bottom: 8 })],
  });
  const result = placeCard(st, 'player', 0, 0);
  assert.equal(result.ok, true);
  assert.equal(st.board[1].owner, 'ai');
  assert.equal(st.board[0].owner, 'player');
  assert.ok(result.events.some((e) => e.type === 'battle' && e.attackerWins === false));
  assert.equal(result.events.some((e) => e.type === 'counter'), false);
});

test('ties do not capture', () => {
  const enemy = card({
    name: 'Even',
    owner: 'ai',
    instanceId: 2,
    left: 5,
    right: 1,
    top: 1,
    bottom: 1,
  });
  const st = stateWith([null, enemy, null, null, null, null, null, null, null], {
    playerHand: [card({ instanceId: 10, right: 5, left: 1, top: 1, bottom: 1 })],
  });
  placeCard(st, 'player', 0, 0);
  assert.equal(st.board[1].owner, 'ai');
});

test('combo chains from a captured card into another neighbor', () => {
  const first = card({
    name: 'Link',
    owner: 'ai',
    instanceId: 2,
    left: 2,
    bottom: 7,
    top: 1,
    right: 1,
  });
  const second = card({
    name: 'Tail',
    owner: 'ai',
    instanceId: 3,
    top: 3,
    left: 9,
    right: 9,
    bottom: 9,
  });
  const st = stateWith([null, first, null, null, second, null, null, null, null], {
    playerHand: [card({ instanceId: 10, right: 8, left: 1, top: 1, bottom: 1 })],
  });
  placeCard(st, 'player', 0, 0);
  assert.equal(st.board[1].owner, 'player');
  assert.equal(st.board[4].owner, 'player');
});

test('filling the board decides a winner', () => {
  const st = stateWith(Array(9).fill(null), {
    playerHand: [
      card({ instanceId: 11 }),
      card({ instanceId: 12 }),
      card({ instanceId: 13 }),
      card({ instanceId: 14 }),
      card({ instanceId: 15 }),
    ],
    aiHand: [
      card({ owner: 'ai', instanceId: 21 }),
      card({ owner: 'ai', instanceId: 22 }),
      card({ owner: 'ai', instanceId: 23 }),
      card({ owner: 'ai', instanceId: 24 }),
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

test('element wheel grants a ±1 modifier', () => {
  assert.equal(elementModifier({ element: 'fire' }, { element: 'ice' }), 1);
  assert.equal(elementModifier({ element: 'ice' }, { element: 'fire' }), -1);
  assert.equal(elementModifier({ element: 'fire' }, { element: 'earth' }), 0);
  assert.equal(elementModifier({ element: null }, { element: 'ice' }), 0);
});

test('element is a tie-break only and never overturns a printed gap', () => {
  const gap = compareSides(
    card({ right: 5, element: 'fire' }),
    card({ left: 7, element: 'ice' }),
    'right',
  );
  assert.equal(gap.elementMod, 0);
  assert.equal(gap.attackerWins, false);
  const sixVsFive = compareSides(
    card({ right: 6, element: 'fire' }),
    card({ left: 5, element: 'water' }),
    'right',
  );
  assert.equal(sixVsFive.elementMod, 0);
  assert.equal(sixVsFive.attackerWins, true);
  assert.equal(sixVsFive.summary, '6 vs 5 — capture');
  const tied = compareSides(
    card({ right: 6, element: 'fire' }),
    card({ left: 6, element: 'ice' }),
    'right',
  );
  assert.equal(tied.elementMod, 1);
  assert.equal(tied.attackerWins, true);
});

test('a 6 never loses to a 3, even vs a bad element', () => {
  for (let seed = 0; seed < 24; seed += 1) {
    const battle = compareSides(
      card({ right: 6, element: 'fire' }),
      card({ left: 3, element: 'water' }),
      'right',
    );
    assert.equal(battle.attackerWins, true, `seed ${seed}`);
    assert.equal(battle.summary, '6 vs 3 — capture');
  }
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

test('rendered cards keep four side ranks and real English flavor', () => {
  const html = renderCard({
    id: 'iron-vow',
    name: 'Iron Vow',
    title: 'Oath Paladin',
    top: 8,
    right: 5,
    bottom: 7,
    left: 8,
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
  assert.match(html, /class="rk t">8</);
  assert.match(html, /class="rk r">5</);
  assert.match(html, /class="rk b">7</);
  assert.match(html, /class="rk l">8</);
  assert.match(html, /class="tm-ranks"/);
  assert.match(html, /frame-ivory/);
  assert.match(html, /owner-player/);
  assert.doesNotMatch(html, /[\uE000-\uF8FF]/);
});

test('card backs are original purple-celestial Aetherbound art', () => {
  const html = renderCardBack(0);
  assert.match(html, /face-down/);
  assert.match(html, /frame-celestial/);
  assert.match(html, /card-back-art/);
  assert.match(html, /AETHERBOUND/);
  assert.doesNotMatch(html, /RAID|Raid|Plarium|Watcher/i);
  assert.match(html, /owner-ai/);
  const title = renderCardBack('title-0', { owner: 'none' });
  assert.doesNotMatch(title, /owner-ai/);
  assert.match(title, /frame-celestial/);
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

test('same-level cards stay close in total and have no glass-cannon sides', () => {
  const byLevel = new Map();
  for (const card of ROSTER) {
    const list = byLevel.get(card.level) || [];
    list.push(card);
    byLevel.set(card.level, list);
    const sides = [card.top, card.right, card.bottom, card.left];
    const floor = card.level <= 2 ? 3 : 4;
    assert.ok(Math.min(...sides) >= floor, `${card.id} soft side ${Math.min(...sides)}`);
    assert.ok(new Set(sides).size > 1, `${card.id} is an even quad`);
  }
  for (const [level, cards] of byLevel) {
    const totals = cards.map((c) => totalValue(c));
    const spread = Math.max(...totals) - Math.min(...totals);
    assert.ok(spread <= 2, `level ${level} totals ${totals.join(',')} spread ${spread}`);
  }
});

test('roster cards only store four side ranks', () => {
  const allowed = new Set(['id', 'name', 'title', 'level', 'top', 'right', 'bottom', 'left', 'element', 'art']);
  for (const card of ROSTER) {
    for (const key of Object.keys(card)) {
      assert.ok(allowed.has(key), `${card.id} has unexpected field ${key}`);
    }
    for (const side of ['top', 'right', 'bottom', 'left']) {
      assert.equal(typeof card[side], 'number', `${card.id}.${side}`);
      assert.ok(card[side] >= 1 && card[side] <= 10, `${card.id}.${side}=${card[side]}`);
    }
  }
});

test('default createMatch deals low beasts, not relics or sovereigns', () => {
  for (const seed of [1, 7, 21, 99, 404]) {
    const match = createMatch({ seed });
    const player = [...match.player.hand, ...match.player.deck];
    const ai = [...match.ai.hand, ...match.ai.deck];
    assert.equal(player.length, 8);
    assert.equal(ai.length, 8);
    for (const card of [...player, ...ai]) {
      assert.ok(card.level <= PLAYER_STARTER_MAX_LEVEL, `${card.id} lv${card.level}`);
    }
  }
});

test('fresh album is level-1 beasts only', () => {
  const album = starterCollection(99);
  assert.equal(album.length, 8);
  for (const owned of album) {
    const template = ROSTER.find((c) => c.id === owned.id);
    assert.equal(template.level, 1, owned.id);
  }
});

test('elemental wheel HUD lists every element and no type cycle', () => {
  const html = renderElementWheel();
  assert.match(html, /Elemental Wheel/);
  for (const el of ['fire', 'ice', 'water', 'wind', 'earth', 'thunder', 'holy', 'dark', 'poison']) {
    assert.match(html, new RegExp(`el-${el}`));
  }
  assert.doesNotMatch(html, /type-pip/);
});

test('trade rules take one, three, or all of the wager', () => {
  assert.equal(tradeTakeCount('one', 8), 1);
  assert.equal(tradeTakeCount('three', 8), 3);
  assert.equal(tradeTakeCount('three', 2), 2);
  assert.equal(tradeTakeCount('all', 8), 8);
  assert.equal(tradeTakeCount('diff', 8, 2), 2);
  assert.equal(tradeTakeCount('one', 0), 0);
});

test('Death Match stakes two more than the table trade', () => {
  assert.equal(deathTakeCount('one', 8, 12), 3);
  assert.equal(deathTakeCount('three', 8, 12), 5);
  assert.equal(deathTakeCount('all', 8, 12), 10);
  assert.equal(deathTakeCount('all', 8, 8), 8);
  assert.equal(deathTakeCount('one', 1, 1), 1);
});

test('Death Match is forced at one card and still has a rival payout pool', () => {
  assert.equal(mustDeathMatch(1), true);
  assert.equal(mustDeathMatch(8), false);
  assert.equal(shouldOfferDeathMatch({ albumCount: 8, optedIn: false }), false);
  assert.equal(shouldOfferDeathMatch({ albumCount: 8, optedIn: true }), true);
  assert.equal(shouldOfferDeathMatch({ albumCount: 1, optedIn: false }), true);
  const session = makeDeathSession(
    {
      player: [{ uid: 'last', id: 'ember-drake' }],
      trade: 'one',
      rival: 'cindervow',
    },
    mulberry32(3),
  );
  assert.equal(session.playerWager.length, 1);
  assert.equal(session.aiWager.length, 8);
  assert.equal(session.aiVault.length, 2);
  assert.ok(session.aiWager.some((c) => c.id === 'hellforge' || c.id === 'ashen-phoenix' || c.id === 'cinder-behemoth'));
  assert.equal(deathTakeCount('one', session.playerWager.length, 1), 1);
  assert.equal(
    deathTakeCount('one', session.aiWager.length, session.aiWager.length + session.aiVault.length),
    3,
  );
});

test('ten stages climb from weak Vesper to full-power Cindervow', () => {
  assert.equal(BOSSES.length, STAGE_COUNT);
  assert.deepEqual(BOSSES.map((b) => b.stage), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const first = BOSSES[0];
  const last = BOSSES[BOSSES.length - 1];
  assert.equal(first.id, 'vesper');
  assert.equal(last.id, 'cindervow');
  for (const id of first.ultimates) {
    assert.ok(levelOf(ROSTER.find((c) => c.id === id)) <= 2, id);
  }
  for (const id of last.ultimates) {
    assert.ok(levelOf(ROSTER.find((c) => c.id === id)) >= 8, id);
  }
  assert.equal(first.maxLevel, 1);
  const vesperDeck = buildBossDeck(first, mulberry32(2));
  assert.ok(vesperDeck.every((c) => c.level === 1));
  const cinderDeck = buildBossDeck(last, mulberry32(8));
  const cinderFill = cinderDeck.filter((c) => !last.ultimates.includes(c.id));
  assert.ok(cinderFill.some((c) => c.level <= 7), 'Stage 10 fill is not a relic wall');
  assert.ok(cinderFill.every((c) => c.level < 10), 'Stage 10 does not stack extra sovereigns');
  assert.equal(new Set(cinderDeck.map((c) => c.id)).size, cinderDeck.length);
  assert.ok(last.ultimates.includes('hellforge'));
  for (const boss of BOSSES) {
    assert.equal(boss.ultimates.length, 3, boss.id);
    assert.equal(new Set(boss.ultimates).size, 3, boss.id);
    const deck = buildBossDeck(boss, mulberry32(11));
    assert.equal(deck.length, 8);
    for (const id of boss.ultimates) {
      assert.ok(deck.some((c) => c.id === id), `${boss.id} missing ${id}`);
    }
    assert.ok(deck.every((c) => c.level <= boss.maxLevel), `${boss.id} broke cap`);
    const preferred = preferUltimates(deck, boss.ultimates).slice(0, 3);
    assert.equal(preferred.every((c) => boss.ultimates.includes(c.id)), true);
    if (boss.stage <= 5) {
      for (const card of deck) {
        assert.ok(maxRank(card) <= 7, `${boss.id} early deck has ${card.id} peak ${maxRank(card)}`);
      }
    }
  }
});

test('Stage 10 is hardest, but a climbed album can contest it', () => {
  const threat = (cards) => cards.reduce((n, c) => n + totalValue(c), 0);
  const seeds = [1, 2, 3, 5, 8, 13, 21];
  const avgThreat = (boss) =>
    seeds.reduce((n, seed) => n + threat(buildBossDeck(boss, mulberry32(seed))), 0) / seeds.length;
  const t1 = avgThreat(BOSSES[0]);
  const t5 = avgThreat(BOSSES[4]);
  const t9 = avgThreat(BOSSES[8]);
  const t10 = avgThreat(BOSSES[9]);
  assert.ok(t1 < t5, `stage 1 ${t1} !< stage 5 ${t5}`);
  assert.ok(t5 < t10, `stage 5 ${t5} !< stage 10 ${t10}`);
  assert.ok(t9 < t10, `stage 9 ${t9} !< stage 10 ${t10}`);

  const mireveil = buildBossDeck(BOSSES[8], mulberry32(9));
  assert.equal(mireveil.some((c) => c.id === 'hellforge'), false);

  const climbed = [...new Set(BOSSES.slice(0, 9).flatMap((b) => b.ultimates))]
    .map((id) => ROSTER.find((c) => c.id === id))
    .filter(Boolean)
    .sort((a, b) => b.level * 100 + totalValue(b) - (a.level * 100 + totalValue(a)))
    .slice(0, 5);
  const player = threat(climbed);
  let bossBest = 0;
  for (const seed of seeds) {
    const best5 = buildBossDeck(BOSSES[9], mulberry32(seed))
      .slice()
      .sort((a, b) => totalValue(b) - totalValue(a))
      .slice(0, 5);
    bossBest += threat(best5);
  }
  bossBest /= seeds.length;
  assert.ok(
    player >= bossBest * 0.88,
    `climbed five ${player} cannot contest Cindervow best five ${bossBest}`,
  );
});

test('winning a stage unlocks the next and starters stay weaker than Cindervow', () => {
  const campaign = emptyCampaign();
  assert.equal(campaign.unlockedStage, 1);
  assert.equal(isRivalUnlocked(BOSSES[0], 1), true);
  assert.equal(isRivalUnlocked(BOSSES[1], 1), false);
  assert.equal(isRivalUnlocked(BOSSES[9], 1), false);
  const next = applyWin(campaign, [{ id: 'ember-drake', name: 'Ember Drake' }], BOSSES[0]);
  assert.equal(next.unlockedStage, 2);
  assert.equal(isRivalUnlocked(BOSSES[1], next.unlockedStage), true);
  const starterMax = Math.max(...starterCollection().map((c) => ROSTER.find((t) => t.id === c.id).level));
  const bossTen = buildBossDeck(BOSSES[9], mulberry32(4));
  const bossTenMax = Math.max(...bossTen.map((c) => c.level));
  assert.ok(starterMax < bossTenMax);
  assert.ok(bossTenMax >= 10);
});

test('createMatch can wager custom decks and skip empty hands', () => {
  const match = createMatch({
    playerTemplates: [ROSTER[0]],
    aiTemplates: [ROSTER[1], ROSTER[2]],
    tradeRule: 'all',
    rivalId: 'cindervow',
  });
  assert.equal(match.player.hand.length, 1);
  assert.equal(match.ai.hand.length, 2);
  assert.equal(match.player.deck.length, 0);
  assert.equal(match.tradeRule, 'all');
  assert.equal(match.rivalId, 'cindervow');
});

test('preferUltimates floats a boss signature first', () => {
  const sorted = preferUltimates(
    [
      { id: 'ember-drake', level: 1, top: 5, right: 5, bottom: 3, left: 4 },
      { id: 'hellforge', level: 10, top: 10, right: 9, bottom: 8, left: 8 },
    ],
    ['hellforge'],
  );
  assert.equal(sorted[0].id, 'hellforge');
});

test('winning a claim adds cards and tracks ultimates', () => {
  const campaign = { ...emptyCampaign(), player: [], claimedUltimates: [] };
  const next = applyWin(campaign, [{ id: 'hellforge', name: 'Hellforge Tyrant' }], BOSSES.find((b) => b.id === 'cindervow'));
  assert.equal(next.player.length, 1);
  assert.equal(next.player[0].id, 'hellforge');
  assert.ok(next.claimedUltimates.includes('hellforge'));
});

test('losing a trade removes the chosen cards from the album', () => {
  const campaign = {
    ...emptyCampaign(),
    player: [
      { uid: 'keep', id: 'ember-drake' },
      { uid: 'gone', id: 'hellforge' },
    ],
  };
  const next = applyLoss(campaign, ['gone']);
  assert.deepEqual(next.player.map((c) => c.uid), ['keep']);
});

test('album progress starts at three unique beasts and a five-card loadout', () => {
  const campaign = emptyCampaign();
  assert.deepEqual(albumProgress(campaign), { owned: 3, total: 22 });
  assert.equal(sanitizeLoadout(campaign).length, LOADOUT_SIZE);
  const html = renderAlbumGrid(campaign, campaign.loadout);
  assert.match(html, /album-tile owned/);
  assert.match(html, /album-unknown/);
  assert.match(html, /\?\?\?/);
});

test('identity cards are strong signatures, pinned, and cannot be traded away', () => {
  assert.equal(DEFAULT_IDENTITY_ID, 'you-rotbriar');
  assert.equal(IDENTITIES.length, 9);
  assert.equal(new Set(IDENTITIES.map((c) => c.element)).size, 9);
  for (const card of IDENTITIES) {
    const total = totalValue(card);
    const peak = maxRank(card);
    assert.equal(card.level, 8, card.id);
    assert.ok(total >= 30 && total <= 34, `${card.id} total ${total}`);
    assert.ok(peak >= 8 && peak <= 9, `${card.id} peak ${peak}`);
    assert.ok(isIdentityId(card.id));
    assert.match(loreOf(card).kind, /Identity/);
  }
  const rot = IDENTITIES.find((c) => c.id === 'you-rotbriar');
  assert.equal(rot.element, 'poison');
  assert.deepEqual([rot.top, rot.right, rot.bottom, rot.left], [8, 7, 9, 8]);
  const pick = renderIdentityGrid('you-rotbriar');
  assert.match(pick, /Rotbriar/);
  assert.match(pick, /Poison/);
  assert.match(pick, /Recommended/);
  assert.match(pick, /identity-pick selected/);
  const fresh = emptyCampaign();
  assert.equal(fresh.identityId, 'you-rotbriar');
  assert.ok(fresh.player.some((c) => c.id === 'you-rotbriar'));
  const bound = bindIdentity(emptyCampaign(), 'you-cinderpath');
  assert.equal(bound.identityId, 'you-cinderpath');
  assert.ok(bound.player.some((c) => c.id === 'you-cinderpath'));
  assert.equal(bound.player.filter((c) => isIdentityId(c.id)).length, 1);
  assert.deepEqual(albumProgress(bound), { owned: 3, total: 22 });
  const uid = bound.player.find((c) => c.id === 'you-cinderpath').uid;
  assert.ok(bound.loadout.includes(uid));
  const afterLoss = applyLoss(bound, [uid]);
  assert.ok(afterLoss.player.some((c) => c.id === 'you-cinderpath'));
  const grid = renderAlbumGrid(fresh, fresh.loadout);
  assert.match(grid, /identity-tile/);
  assert.match(grid, /data-uid="/);
  assert.match(grid, /pinned/);
});

test('album loadout drag adds, replaces, reorders, and refuses to drop identity', () => {
  const campaign = emptyCampaign();
  const you = identityUid(campaign);
  assert.ok(you);
  const beasts = campaign.player.filter((c) => c.id === 'ember-drake');
  assert.ok(beasts.length >= 2);
  const withoutEmber = {
    ...campaign,
    loadout: [you, ...campaign.player.filter((c) => !isIdentityId(c.id) && c.id !== 'ember-drake').slice(0, 3).map((c) => c.uid)],
  };
  const added = dragAlbumToSlot(withoutEmber, 'ember-drake', withoutEmber.loadout.length);
  assert.ok(added.loadout.includes(beasts[0].uid) || added.loadout.includes(beasts[1].uid));
  assert.ok(added.loadout.includes(you));
  const youIndex = added.loadout.indexOf(you);
  const blocked = dragAlbumToSlot(added, 'ember-drake', youIndex);
  assert.equal(blocked.loadout[youIndex], you);
  const moved = moveLoadoutIndex(added, 0, added.loadout.length - 1);
  assert.equal(moved.loadout[moved.loadout.length - 1], added.loadout[0]);
  const stripped = removeLoadoutUid(added, you);
  assert.ok(stripped.loadout.includes(you));
  const other = added.loadout.find((uid) => uid !== you);
  const removed = removeLoadoutUid(added, other);
  assert.equal(removed.loadout.includes(other), false);
  assert.ok(removed.loadout.includes(you));
  const swapFrom = removed.loadout.find((uid) => {
    const card = removed.player.find((c) => c.uid === uid);
    return card && uid !== you && card.id !== 'nightbloom';
  });
  const swapped = swapLoadoutWithAlbum(removed, swapFrom, 'nightbloom');
  assert.ok(swapped.player.filter((c) => swapped.loadout.includes(c.uid)).some((c) => c.id === 'nightbloom'));
  assert.equal(pruneLoadout(removed).includes(other), false);
});

test('Death Match showdown always names a winner or a draw', () => {
  const rng = mulberry32(7);
  const result = resolveShowdown(ROSTER[0], ROSTER[1], rng);
  assert.ok(['player', 'ai', 'draw'].includes(result.winner));
  assert.ok(result.rounds.length >= 1);
});

