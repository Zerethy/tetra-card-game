import { ROSTER, cardById, tierOf, levelOf, totalValue } from './cards.js';
import { DECK_SIZE, DECK_QUOTA, shuffle, mulberry32, dealStarterDecks, resolveBattle } from './game.js';

export const STORAGE_KEY = 'aetherbound-campaign-v1';

export const TRADE_RULES = [
  { id: 'one', name: 'One', blurb: 'Winner chooses 1 card from the loser.' },
  { id: 'three', name: 'Three', blurb: 'Winner chooses up to 3 cards from the loser.' },
  { id: 'all', name: 'All', blurb: 'Winner takes the loser’s entire wagered set.' },
  { id: 'diff', name: 'Diff', blurb: 'Winner takes as many cards as the score difference.' },
];

export const BOSSES = [
  {
    id: 'vesper',
    name: 'Lady Vesper',
    title: 'Pink Rival',
    blurb: 'A wandering duelist with a mixed album. No reserved ultimates.',
    ultimates: [],
  },
  {
    id: 'cindervow',
    name: 'Lord Cindervow',
    title: 'Ember Liege',
    blurb: 'The furnace court. Three fire ultimates bound to his name.',
    ultimates: ['cinder-behemoth', 'ashen-phoenix', 'hellforge'],
  },
  {
    id: 'mireveil',
    name: 'Duchess Mireveil',
    title: 'Tide of Veils',
    blurb: 'Velvet abyss, last phylactery, and a stolen dawn.',
    ultimates: ['voidglass', 'abyssal-countess', 'pearl-seraph'],
  },
  {
    id: 'ferric',
    name: 'Warden Ferric',
    title: 'Law of Iron',
    blurb: 'Oath, gilt, and stone. Three ultimates of the iron ward.',
    ultimates: ['iron-vow', 'gilded-colossus', 'runebound'],
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

export function autoPickHighest(cards, n) {
  return cards
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
  const buckets = { beast: [], warlord: [], relic: [], sovereign: [] };
  for (const card of shuffle(pool, rng)) {
    buckets[tierOf(card)].push(card);
  }
  const deck = [];
  for (const [tier, count] of Object.entries(DECK_QUOTA)) {
    for (let i = 0; i < count; i += 1) {
      if (buckets[tier].length) deck.push(buckets[tier].pop());
    }
  }
  const fallback = ['sovereign', 'relic', 'warlord', 'beast'];
  while (deck.length < size) {
    const tier = fallback.find((key) => buckets[key].length);
    if (!tier) break;
    deck.push(buckets[tier].pop());
  }
  return shuffle(deck, rng);
}

export function buildBossDeck(boss, rng) {
  const ultimates = (boss?.ultimates || []).map((id) => cardById(id)).filter(Boolean);
  const used = new Set(ultimates.map((c) => c.id));
  const rest = shuffle(
    ROSTER.filter((c) => !used.has(c.id)),
    rng,
  );
  const deck = ultimates.slice();
  for (const card of rest) {
    if (deck.length >= DECK_SIZE) break;
    deck.push(card);
  }
  return shuffle(deck, rng);
}

export function buildAiVault(wagerTemplates, count, rng) {
  const used = new Set(wagerTemplates.map((c) => c.id));
  const rest = shuffle(
    ROSTER.filter((c) => !used.has(c.id)),
    rng,
  );
  return rest.slice(0, Math.max(0, count)).map(ownedFromTemplate);
}

export function starterCollection(seed = 0xa37e4) {
  const rng = mulberry32(seed);
  const dealt = dealStarterDecks(ROSTER, rng);
  const used = new Set([...dealt.player, ...dealt.ai].map((c) => c.id));
  const extra = ROSTER.filter((c) => !used.has(c.id) && tierOf(c) === 'beast').slice(0, 4);
  return [...dealt.player, ...extra].map(ownedFromTemplate);
}

export function emptyCampaign() {
  return {
    player: starterCollection(),
    trade: 'one',
    rival: 'vesper',
    claimedUltimates: [],
  };
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
    return {
      player,
      trade: TRADE_RULES.some((r) => r.id === parsed.trade) ? parsed.trade : 'one',
      rival: BOSSES.some((b) => b.id === parsed.rival) ? parsed.rival : 'vesper',
      claimedUltimates: Array.isArray(parsed.claimedUltimates) ? parsed.claimedUltimates : [],
    };
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
  next.rival = campaign?.rival || 'vesper';
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
  return {
    ...campaign,
    player: campaign.player.filter((c) => !drop.has(c.uid)),
  };
}

export function applyWin(campaign, claimed, boss) {
  const additions = claimed.map((c) => ownedFromTemplate(c));
  return {
    ...campaign,
    player: [...campaign.player, ...additions],
    claimedUltimates: markClaimedUltimates(campaign, claimed, boss),
  };
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
