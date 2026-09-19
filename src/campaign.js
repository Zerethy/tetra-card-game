import { ROSTER, cardById, levelOf, totalValue, IDENTITIES, isIdentityId, identityById, DEFAULT_IDENTITY_ID } from './cards.js';
import {
  DECK_SIZE,
  PLAYER_STARTER_MAX_LEVEL,
  shuffle,
  mulberry32,
  dealCappedDeck,
  resolveBattle,
} from './game.js';

export const STORAGE_KEY = 'aetherbound-campaign-v2';
export const STAGE_COUNT = 10;
export const LOADOUT_SIZE = 5;

export const TRADE_RULES = [
  { id: 'one', name: 'One', blurb: 'Winner chooses 1 card from the loser.' },
  { id: 'three', name: 'Three', blurb: 'Winner chooses up to 3 cards from the loser.' },
  { id: 'all', name: 'All', blurb: 'Winner takes the loser’s entire wagered set.' },
  { id: 'diff', name: 'Diff', blurb: 'Winner takes as many cards as the score difference.' },
];

export const BOSSES = [
  {
    id: 'vesper',
    stage: 1,
    name: 'Lady Vesper',
    short: 'Vesper',
    title: 'Pink Rival',
    blurb: 'Stage 1. Weakest rival. Low-side Lv1 “ultimates,” beatable with starter Lv1–3 cards.',
    band: 'Apprentice · Lv1',
    ultimates: ['ember-drake', 'nightbloom', 'plaguebloom'],
    maxLevel: 1,
  },
  {
    id: 'galehart',
    stage: 2,
    name: 'Sir Galehart',
    short: 'Galehart',
    title: 'Sky Lance',
    blurb: 'Stage 2. Gale and frost beasts. The first real climb reward.',
    band: 'Beasts · Lv2',
    ultimates: ['skyraid', 'frost-wraith', 'bone-choir'],
    maxLevel: 3,
  },
  {
    id: 'brine',
    stage: 3,
    name: 'Cantor Brine',
    short: 'Brine',
    title: 'Red Tide',
    blurb: 'Stage 3. Tide, thunder, and thorn. Mid-beast signatures.',
    band: 'Beasts · Lv3',
    ultimates: ['tidebreaker', 'stormglass', 'thornwake'],
    maxLevel: 4,
  },
  {
    id: 'hexa',
    stage: 4,
    name: 'Hexa of the Rift',
    short: 'Hexa',
    title: 'Between-Worlds',
    blurb: 'Stage 4. Two mid beasts and one stronger elite.',
    band: 'Elites · Lv4–5',
    ultimates: ['bloodmoon', 'rift-stalker', 'gravewing'],
    maxLevel: 5,
  },
  {
    id: 'abbess',
    stage: 5,
    name: 'Mirror-Abbess',
    short: 'Abbess',
    title: 'Glass Psalm',
    blurb: 'Stage 5. Ice and bone elites. One step below warlords.',
    band: 'Elites · Lv5',
    ultimates: ['shard-knight', 'gravewing', 'rift-stalker'],
    maxLevel: 5,
  },
  {
    id: 'kael',
    stage: 6,
    name: 'Kael the Oathbound',
    short: 'Kael',
    title: 'First Vow',
    blurb: 'Stage 6. Two elites and one warlord spike.',
    band: 'Warlord spike · Lv6',
    ultimates: ['shard-knight', 'gravewing', 'iron-vow'],
    maxLevel: 6,
  },
  {
    id: 'regent',
    stage: 7,
    name: 'The Veiled Regent',
    short: 'Regent',
    title: 'Velvet Host',
    blurb: 'Stage 7. Warlords plus one stronger relic-bound hide.',
    band: 'Warlords · Lv7–8',
    ultimates: ['abyssal-countess', 'voidglass', 'cinder-behemoth'],
    maxLevel: 8,
  },
  {
    id: 'ferric',
    stage: 8,
    name: 'Warden Ferric',
    short: 'Ferric',
    title: 'Law of Iron',
    blurb: 'Stage 8. Oath, gilt, and stone. Full iron-ward ultimates.',
    band: 'Iron ward · Lv6–9',
    ultimates: ['iron-vow', 'gilded-colossus', 'runebound'],
    maxLevel: 9,
  },
  {
    id: 'mireveil',
    stage: 9,
    name: 'Duchess Mireveil',
    short: 'Mireveil',
    title: 'Tide of Veils',
    blurb: 'Stage 9. Velvet abyss, last phylactery, and a stolen dawn.',
    band: 'Abyss · Lv6–10',
    ultimates: ['voidglass', 'abyssal-countess', 'pearl-seraph'],
    maxLevel: 10,
  },
  {
    id: 'cindervow',
    stage: 10,
    name: 'Lord Cindervow',
    short: 'Cindervow',
    title: 'Ember Liege',
    blurb: 'Stage 10. Hardest fight, still beatable. Three Lv8–10 ultimates; fill is warlords, not extra sovereigns.',
    band: 'Sovereign · Lv8–10',
    ultimates: ['cinder-behemoth', 'ashen-phoenix', 'hellforge'],
    maxLevel: 10,
  },
];

export function bossById(id) {
  return BOSSES.find((b) => b.id === id) || BOSSES[0];
}

export function newUid() {
  return `c-${Math.random().toString(36).slice(2, 10)}`;
}

export function ownedFromTemplate(template) {
  return { uid: newUid(), id: template.id };
}

export function hydrateOwned(owned) {
  const template = cardById(owned.id);
  if (!template) return null;
  return { ...template, uid: owned.uid };
}

export function rankCard(card) {
  return levelOf(card) * 100 + totalValue(card);
}

export function tradeTakeCount(rule, loserCount, scoreDiff = 1) {
  const n = Math.max(0, loserCount | 0);
  if (rule === 'three') return Math.min(3, n);
  if (rule === 'all') return n;
  if (rule === 'diff') return Math.min(Math.max(1, Math.abs(scoreDiff | 0)), n);
  return Math.min(1, n);
}

/** Death Match pays more than the table trade: +2, or All+2 when already All. */
export function deathTakeCount(rule, wagerCount, collectionCount) {
  const normal = tradeTakeCount(rule, wagerCount);
  const boosted = rule === 'all' ? wagerCount + 2 : normal + 2;
  return Math.min(Math.max(0, collectionCount | 0), Math.max(0, boosted));
}

/** Death Match is forced when the album is a single card. */
export function mustDeathMatch(ownedCount) {
  return (ownedCount | 0) === 1;
}

/** After a 3×3, offer Death Match only for last-card or an explicit opt-in. */
export function shouldOfferDeathMatch({ albumCount, optedIn }) {
  return mustDeathMatch(albumCount) || Boolean(optedIn);
}

export function makeDeathSession(campaign, rng) {
  const boss = bossById(campaign.rival);
  const playerWager = tradableCards((campaign.player || []).map(hydrateOwned));
  const aiTemplates = buildBossDeck(boss, rng);
  const aiWager = aiTemplates.map((t) => ({ ...t, uid: t.uid || newUid() }));
  const aiVault = buildAiVault(aiWager, 2, rng, boss).map(hydrateOwned).filter(Boolean);
  return {
    boss,
    trade: campaign.trade,
    playerWager,
    aiWager,
    aiVault,
    playerCollectionSize: campaign.player.length,
  };
}

export function tradableCards(cards = []) {
  return (cards || []).filter((card) => card && !isIdentityId(card.id));
}

export function autoPickHighest(cards, n) {
  return tradableCards(cards)
    .slice()
    .sort((a, b) => rankCard(b) - rankCard(a) || String(a.id).localeCompare(String(b.id)))
    .slice(0, Math.max(0, n));
}

export function preferUltimates(cards, ultimateIds) {
  const set = new Set(ultimateIds || []);
  return cards.slice().sort((a, b) => {
    const ua = set.has(a.id) ? 1 : 0;
    const ub = set.has(b.id) ? 1 : 0;
    if (ub !== ua) return ub - ua;
    return rankCard(b) - rankCard(a) || String(a.id).localeCompare(String(b.id));
  });
}

export function pickWager(ownedHydrated, size = DECK_SIZE, rng) {
  const pool = ownedHydrated.filter(Boolean);
  if (pool.length <= size) return shuffle(pool, rng);
  const ranked = pool.slice().sort((a, b) => rankCard(b) - rankCard(a) || String(a.id).localeCompare(String(b.id)));
  const cut = ranked.slice(0, Math.min(ranked.length, size + 2));
  return shuffle(cut, rng).slice(0, size);
}

export function bossFillMinLevel(boss) {
  const cap = boss?.maxLevel ?? 10;
  const stage = boss?.stage || 1;
  if (stage <= 3) return 1;
  if (stage <= 6) return Math.max(1, cap - 2);
  if (stage <= 9) return 5;
  return 6;
}

/** Late stages keep their own Lv10 signatures — they do not fill with extra sovereigns. */
export function extraSovereignFillIds(boss) {
  const reserved = new Set(boss?.ultimates || []);
  return ROSTER.filter((card) => card.level >= 10 && !reserved.has(card.id)).map((card) => card.id);
}

export function buildBossDeck(boss, rng) {
  const ultimates = (boss?.ultimates || []).map((id) => cardById(id)).filter(Boolean);
  const cap = boss?.maxLevel ?? 10;
  const stage = boss?.stage || 1;
  return dealCappedDeck(ROSTER, rng, {
    size: DECK_SIZE,
    maxLevel: cap,
    minLevel: bossFillMinLevel(boss),
    required: ultimates,
    allowCopies: true,
    copyMaxLevel: stage <= 3 ? cap : Math.min(cap, 6),
    forbidIds: stage >= 8 ? extraSovereignFillIds(boss) : [],
  });
}

export function buildAiVault(wagerTemplates, count, rng, boss) {
  const used = new Set(wagerTemplates.map((c) => c.id));
  const cap = boss?.maxLevel ?? 10;
  const rest = shuffle(
    ROSTER.filter((c) => !used.has(c.id) && c.level <= cap),
    rng,
  );
  return rest.slice(0, Math.max(0, count)).map(ownedFromTemplate);
}

export function starterCollection(seed = 0xa37e4) {
  const rng = mulberry32(seed);
  const lv1 = ROSTER.filter((c) => c.level === 1 && c.level <= PLAYER_STARTER_MAX_LEVEL);
  const picks = [];
  let i = 0;
  while (picks.length < DECK_SIZE && lv1.length) {
    picks.push(lv1[i % lv1.length]);
    i += 1;
  }
  return picks.map(ownedFromTemplate);
}

export function uniqueOwnedIds(campaign) {
  return [
    ...new Set(
      (campaign?.player || [])
        .map((c) => c.id)
        .filter((id) => cardById(id) && !isIdentityId(id)),
    ),
  ];
}

export function albumProgress(campaign) {
  return { owned: uniqueOwnedIds(campaign).length, total: ROSTER.length };
}

export function pruneLoadout(campaign) {
  const have = new Set((campaign?.player || []).map((c) => c.uid));
  return (campaign?.loadout || []).filter((uid) => have.has(uid)).slice(0, LOADOUT_SIZE);
}

export function identityUid(campaign) {
  return (campaign?.player || []).find((c) => isIdentityId(c.id))?.uid || null;
}

export function firstFreeCopy(campaign, cardId, loadout = campaign?.loadout) {
  const used = new Set(loadout || []);
  return (campaign?.player || []).find((c) => c.id === cardId && !used.has(c.uid)) || null;
}

/** Owned cards not seated in the five. Identity is never a replacement. Strongest first. */
export function switchCandidates(campaign, loadout = campaign?.loadout) {
  const used = new Set(pruneLoadout({ ...campaign, loadout }));
  const byId = new Map();
  for (const owned of campaign?.player || []) {
    if (!owned?.uid || used.has(owned.uid) || isIdentityId(owned.id)) continue;
    const card = hydrateOwned(owned);
    if (!card) continue;
    const prev = byId.get(card.id);
    if (!prev) byId.set(card.id, { ...card, copies: 1 });
    else prev.copies += 1;
  }
  return [...byId.values()].sort(
    (a, b) => rankCard(b) - rankCard(a) || String(a.name || a.id).localeCompare(String(b.name || b.id)),
  );
}

export function sanitizeLoadout(campaign) {
  let loadout = pruneLoadout(campaign);
  const you = identityUid(campaign);
  if (you && !loadout.includes(you)) {
    loadout = [you, ...loadout.filter((uid) => uid !== you)].slice(0, LOADOUT_SIZE);
  }
  if (loadout.length >= LOADOUT_SIZE) return loadout.slice(0, LOADOUT_SIZE);
  const hydrated = (campaign?.player || []).map(hydrateOwned).filter(Boolean);
  for (const card of pickWager(hydrated, LOADOUT_SIZE, mulberry32(0x51a1))) {
    if (loadout.length >= LOADOUT_SIZE) break;
    if (!loadout.includes(card.uid)) loadout.push(card.uid);
  }
  return loadout.slice(0, LOADOUT_SIZE);
}

export function moveLoadoutIndex(campaign, fromIndex, toIndex) {
  const loadout = pruneLoadout(campaign);
  if (!Number.isInteger(fromIndex) || fromIndex < 0 || fromIndex >= loadout.length) return campaign;
  if (!Number.isInteger(toIndex) || toIndex < 0) return campaign;
  const next = loadout.slice();
  const [item] = next.splice(fromIndex, 1);
  const dest = Math.min(toIndex, next.length);
  next.splice(dest, 0, item);
  return { ...campaign, loadout: next };
}

export function removeLoadoutUid(campaign, uid) {
  const you = identityUid(campaign);
  if (!uid || uid === you) return campaign;
  return { ...campaign, loadout: pruneLoadout(campaign).filter((entry) => entry !== uid) };
}

export function replaceableSlotIndex(campaign, preferredIndex = 0) {
  const loadout = pruneLoadout(campaign);
  const you = identityUid(campaign);
  if (
    Number.isInteger(preferredIndex) &&
    preferredIndex >= 0 &&
    preferredIndex < loadout.length &&
    loadout[preferredIndex] !== you
  ) {
    return preferredIndex;
  }
  if (loadout.length < LOADOUT_SIZE) return loadout.length;
  const start = Number.isInteger(preferredIndex) && preferredIndex > 0 ? preferredIndex : 0;
  for (let step = 0; step < loadout.length; step += 1) {
    const index = (start + step) % loadout.length;
    if (loadout[index] !== you) return index;
  }
  return -1;
}

export function dragAlbumToSlot(campaign, cardId, slotIndex) {
  if (!cardId) return campaign;
  const loadout = pruneLoadout(campaign);
  const you = identityUid(campaign);
  let index = slotIndex;
  if (!Number.isInteger(index) || index < 0 || index >= LOADOUT_SIZE) {
    index = loadout.length < LOADOUT_SIZE ? loadout.length : 0;
  }
  if (loadout[index] === you || index >= loadout.length) {
    index = replaceableSlotIndex(campaign, index);
    if (index < 0) return campaign;
  }
  const free = firstFreeCopy(campaign, cardId, loadout);
  if (free) {
    if (index >= loadout.length) {
      if (loadout.length >= LOADOUT_SIZE) {
        index = replaceableSlotIndex(campaign, 0);
        if (index < 0 || index >= loadout.length) return campaign;
      } else {
        return { ...campaign, loadout: [...loadout, free.uid] };
      }
    }
    if (loadout[index] === you && free.uid !== you) {
      index = replaceableSlotIndex(campaign, index);
      if (index < 0 || index >= loadout.length) return campaign;
    }
    const next = loadout.slice();
    next[index] = free.uid;
    return { ...campaign, loadout: next };
  }
  const existingIdx = loadout.findIndex((uid) => campaign.player.find((card) => card.uid === uid)?.id === cardId);
  if (existingIdx >= 0) {
    const dest = Math.min(Math.max(0, index), loadout.length - 1);
    return moveLoadoutIndex({ ...campaign, loadout }, existingIdx, dest);
  }
  return campaign;
}

export function swapLoadoutWithAlbum(campaign, fromUid, albumId) {
  const loadout = pruneLoadout(campaign);
  const fromIndex = loadout.indexOf(fromUid);
  if (fromIndex < 0) return campaign;
  if (fromUid === identityUid(campaign)) return campaign;
  const occupant = campaign.player.find((card) => card.uid === fromUid);
  if (occupant?.id === albumId) return campaign;
  return dragAlbumToSlot({ ...campaign, loadout }, albumId, fromIndex);
}

export function bindIdentity(campaign, identityId) {
  const ident = identityById(identityId);
  const player = (campaign?.player || []).filter((c) => !isIdentityId(c.id));
  const next = {
    ...campaign,
    identityId: ident.id,
    player: [ownedFromTemplate(ident), ...player],
  };
  next.loadout = sanitizeLoadout(next);
  const you = next.player.find((c) => c.id === ident.id);
  if (you && !next.loadout.includes(you.uid)) {
    next.loadout = [you.uid, ...next.loadout.filter((uid) => uid !== you.uid)].slice(0, LOADOUT_SIZE);
  }
  return next;
}

export function emptyCampaign(options = {}) {
  const player = starterCollection();
  const campaign = {
    player,
    trade: 'one',
    rival: 'vesper',
    claimedUltimates: [],
    offerDeathMatch: false,
    unlockedStage: 1,
    loadout: [],
    identityId: null,
  };
  return bindIdentity(campaign, options.identityId || DEFAULT_IDENTITY_ID);
}

export function isRivalUnlocked(boss, unlockedStage) {
  return (boss?.stage || 1) <= Math.max(1, unlockedStage | 0);
}

export function loadCampaign() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCampaign();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.player) || !parsed.player.length) return emptyCampaign();
    const player = parsed.player
      .filter((c) => c && c.id && cardById(c.id))
      .map((c) => ({ uid: c.uid || newUid(), id: c.id }));
    if (!player.length) return emptyCampaign();
    const unlockedStage = Math.min(
      STAGE_COUNT,
      Math.max(1, Number(parsed.unlockedStage) || 1),
    );
    let rival = BOSSES.some((b) => b.id === parsed.rival) ? parsed.rival : 'vesper';
    if (!isRivalUnlocked(bossById(rival), unlockedStage)) {
      rival = [...BOSSES].filter((b) => isRivalUnlocked(b, unlockedStage)).pop()?.id || 'vesper';
    }
    let identityId = IDENTITIES.some((i) => i.id === parsed.identityId) ? parsed.identityId : DEFAULT_IDENTITY_ID;
    const loaded = {
      player,
      trade: TRADE_RULES.some((r) => r.id === parsed.trade) ? parsed.trade : 'one',
      rival,
      claimedUltimates: Array.isArray(parsed.claimedUltimates) ? parsed.claimedUltimates : [],
      offerDeathMatch: Boolean(parsed.offerDeathMatch),
      unlockedStage,
      identityId,
      loadout: Array.isArray(parsed.loadout) ? parsed.loadout : [],
    };
    if (!loaded.player.some((c) => isIdentityId(c.id))) {
      return bindIdentity(loaded, identityId);
    }
    loaded.loadout = sanitizeLoadout(loaded);
    return loaded;
  } catch {
    return emptyCampaign();
  }
}

export function saveCampaign(campaign) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaign));
  } catch {
    /* private mode */
  }
}

export function resetCampaign(campaign) {
  const next = emptyCampaign();
  next.trade = campaign?.trade || 'one';
  next.rival = 'vesper';
  next.offerDeathMatch = Boolean(campaign?.offerDeathMatch);
  next.unlockedStage = 1;
  if (campaign?.identityId) return bindIdentity(next, campaign.identityId);
  next.loadout = sanitizeLoadout(next);
  return next;
}

export function isUltimateId(id, boss) {
  return Boolean(boss?.ultimates?.includes(id));
}

export function markClaimedUltimates(campaign, claimed, boss) {
  const set = new Set(campaign.claimedUltimates || []);
  for (const card of claimed) {
    if (isUltimateId(card.id, boss)) set.add(card.id);
  }
  return [...set];
}

export function applyLoss(campaign, uids) {
  const drop = new Set(uids);
  const next = {
    ...campaign,
    player: campaign.player.filter((c) => !drop.has(c.uid) || isIdentityId(c.id)),
  };
  next.loadout = sanitizeLoadout(next);
  return next;
}

export function applyWin(campaign, claimed, boss) {
  const additions = claimed.map((c) => ownedFromTemplate(c));
  const cleared = boss?.stage || 1;
  const unlockedStage = Math.min(STAGE_COUNT, Math.max(campaign.unlockedStage || 1, cleared + 1));
  const next = {
    ...campaign,
    player: [...campaign.player, ...additions],
    claimedUltimates: markClaimedUltimates(campaign, claimed, boss),
    unlockedStage,
  };
  next.loadout = sanitizeLoadout(next);
  return next;
}

export function resolveShowdown(playerCard, aiCard, rng) {
  const forward = resolveBattle(playerCard, aiCard, rng);
  if (forward.attackerWins) {
    return { winner: 'player', rounds: [forward] };
  }
  const reverse = resolveBattle(aiCard, playerCard, rng);
  if (reverse.attackerWins) {
    return { winner: 'ai', rounds: [forward, reverse] };
  }
  const pv = rankCard(playerCard);
  const av = rankCard(aiCard);
  if (pv !== av) {
    return { winner: pv > av ? 'player' : 'ai', rounds: [forward, reverse], tiebreak: 'value' };
  }
  return { winner: 'draw', rounds: [forward, reverse] };
}
