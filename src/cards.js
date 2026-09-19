/** Orthogonal sides used for Triple Triad–style captures. */
export const SIDES = [
  { key: 'top', dr: -1, dc: 0, opposite: 'bottom' },
  { key: 'right', dr: 0, dc: 1, opposite: 'left' },
  { key: 'bottom', dr: 1, dc: 0, opposite: 'top' },
  { key: 'left', dr: 0, dc: -1, opposite: 'right' },
];

export const ELEMENTS = ['fire', 'ice', 'water', 'wind', 'earth', 'thunder', 'holy', 'dark', 'poison'];

/** Attacker element beats this defender element. Three clockwise triangles. */
export const ELEMENT_BEATS = {
  fire: 'ice',
  ice: 'water',
  water: 'fire',
  wind: 'earth',
  earth: 'thunder',
  thunder: 'wind',
  holy: 'dark',
  dark: 'poison',
  poison: 'holy',
};

/** HUD rings: each node beats the next, last beats first. */
export const ELEMENT_RINGS = [
  { id: 'primal', nodes: ['fire', 'ice', 'water'] },
  { id: 'wild', nodes: ['wind', 'earth', 'thunder'] },
  { id: 'aether', nodes: ['holy', 'dark', 'poison'] },
];

/**
 * Original dark-fantasy roster. Names and four side ranks are original.
 * Archetypes nod at classic JRPG bosses and infernal warlords without copying them.
 * Ranks are Top, Right, Bottom, Left (1–10 / 1–A).
 * Same-level totals stay within ~2. Softest side is ≥3 (Lv1–2) or ≥4 (Lv3+).
 * Identity is a stronger side, not a 2-side glass cannon or an even-quad tank.
 */
export const ROSTER = [
  {
    id: 'ashen-phoenix',
    name: 'Ashen Phoenix',
    title: 'Cinder Sovereign',
    level: 8,
    top: 9,
    right: 8,
    bottom: 7,
    left: 8,
    element: 'fire',
    art: 'phoenix',
  },
  {
    id: 'gravewing',
    name: 'Gravewing',
    title: 'Bone Tyrant',
    level: 5,
    top: 7,
    right: 6,
    bottom: 6,
    left: 7,
    element: 'dark',
    art: 'gravewing',
  },
  {
    id: 'tidebreaker',
    name: 'Tidebreaker',
    title: 'Abyss Coil',
    level: 3,
    top: 4,
    right: 6,
    bottom: 7,
    left: 5,
    element: 'water',
    art: 'serpent',
  },
  {
    id: 'stormglass',
    name: 'Stormglass Oracle',
    title: 'Sky-Scribe',
    level: 3,
    top: 6,
    right: 7,
    bottom: 4,
    left: 4,
    element: 'thunder',
    art: 'oracle',
  },
  {
    id: 'iron-vow',
    name: 'Iron Vow',
    title: 'Oath Paladin',
    level: 6,
    top: 8,
    right: 6,
    bottom: 6,
    left: 8,
    element: 'holy',
    art: 'paladin',
  },
  {
    id: 'voidglass',
    name: 'Voidglass Lich',
    title: 'Last Phylactery',
    level: 6,
    top: 7,
    right: 8,
    bottom: 6,
    left: 7,
    element: 'dark',
    art: 'lich',
  },
  {
    id: 'bloodmoon',
    name: 'Bloodmoon Duelist',
    title: 'Crimson Step',
    level: 4,
    top: 7,
    right: 6,
    bottom: 5,
    left: 6,
    element: 'poison',
    art: 'duelist',
  },
  {
    id: 'thornwake',
    name: 'Thornwake Matron',
    title: 'Bloom of Knives',
    level: 3,
    top: 5,
    right: 4,
    bottom: 6,
    left: 6,
    element: 'earth',
    art: 'matron',
  },
  {
    id: 'cinder-behemoth',
    name: 'Cinder Behemoth',
    title: 'Furnace Hide',
    level: 8,
    top: 8,
    right: 8,
    bottom: 7,
    left: 8,
    element: 'fire',
    art: 'behemoth',
  },
  {
    id: 'hellforge',
    name: 'Hellforge Tyrant',
    title: 'Crown of Cinders',
    level: 10,
    top: 10,
    right: 9,
    bottom: 8,
    left: 8,
    element: 'fire',
    art: 'tyrant',
  },
  {
    id: 'gilded-colossus',
    name: 'Gilded Colossus',
    title: 'Judgment Engine',
    level: 8,
    top: 8,
    right: 9,
    bottom: 8,
    left: 7,
    element: 'holy',
    art: 'colossus',
  },
  {
    id: 'nightbloom',
    name: 'Nightbloom Witch',
    title: 'Hex Orchard',
    level: 1,
    top: 5,
    right: 4,
    bottom: 3,
    left: 4,
    element: 'poison',
    art: 'witch',
  },
  {
    id: 'rift-stalker',
    name: 'Rift Stalker',
    title: 'Between-Worlds',
    level: 4,
    top: 7,
    right: 5,
    bottom: 6,
    left: 6,
    element: 'dark',
    art: 'stalker',
  },
  {
    id: 'bone-choir',
    name: 'Bone Choir',
    title: 'Red Cantor',
    level: 2,
    top: 5,
    right: 3,
    bottom: 6,
    left: 4,
    element: 'dark',
    art: 'choir',
  },
  {
    id: 'skyraid',
    name: 'Skyraid Wyvern',
    title: 'Gale Lance',
    level: 2,
    top: 6,
    right: 5,
    bottom: 3,
    left: 4,
    element: 'wind',
    art: 'wyvern',
  },
  {
    id: 'abyssal-countess',
    name: 'Abyssal Countess',
    title: 'Velvet Cataclysm',
    level: 7,
    top: 7,
    right: 8,
    bottom: 8,
    left: 7,
    element: 'water',
    art: 'countess',
  },
  {
    id: 'runebound',
    name: 'Runebound Golem',
    title: 'Law of Stone',
    level: 9,
    top: 9,
    right: 8,
    bottom: 10,
    left: 7,
    element: 'earth',
    art: 'golem',
  },
  {
    id: 'pearl-seraph',
    name: 'Pearl Seraph',
    title: 'Dawnwarden',
    level: 10,
    top: 9,
    right: 8,
    bottom: 8,
    left: 10,
    element: 'holy',
    art: 'seraph',
  },
  {
    id: 'plaguebloom',
    name: 'Plaguebloom',
    title: 'Sweet Rot',
    level: 1,
    top: 3,
    right: 4,
    bottom: 5,
    left: 4,
    element: 'poison',
    art: 'plague',
  },
  {
    id: 'ember-drake',
    name: 'Ember Drake',
    title: 'Kindling Prince',
    level: 1,
    top: 5,
    right: 5,
    bottom: 3,
    left: 4,
    element: 'fire',
    art: 'drake',
  },
  {
    id: 'frost-wraith',
    name: 'Frost Wraith',
    title: 'Hollow Thaw',
    level: 2,
    top: 4,
    right: 3,
    bottom: 4,
    left: 7,
    element: 'ice',
    art: 'wraith',
  },
  {
    id: 'shard-knight',
    name: 'Shard Knight',
    title: 'Glass Crusade',
    level: 5,
    top: 6,
    right: 7,
    bottom: 6,
    left: 7,
    element: 'ice',
    art: 'shard',
  },
];

/**
 * Player-character cards. Modest Lv2 power — a named “you,” not a Stage 10 sovereign.
 * Kept off ROSTER so bosses never deal them.
 */
export const IDENTITIES = [
  {
    id: 'you-cinderpath',
    name: 'Cinderpath',
    title: 'Ash Pilgrim',
    vibe: 'A spark-sworn wanderer. The first coal still answers.',
    level: 2,
    top: 6,
    right: 5,
    bottom: 3,
    left: 4,
    element: 'fire',
    art: 'duelist',
    identity: true,
  },
  {
    id: 'you-rimewake',
    name: 'Rimewake',
    title: 'Hollow Squire',
    vibe: 'Keeps a vow that froze before it finished.',
    level: 2,
    top: 4,
    right: 3,
    bottom: 5,
    left: 6,
    element: 'ice',
    art: 'shard',
    identity: true,
  },
  {
    id: 'you-tidevow',
    name: 'Tidevow',
    title: 'Salt Cantor',
    vibe: 'Sings the red current and bargains with wrecks.',
    level: 2,
    top: 3,
    right: 5,
    bottom: 6,
    left: 4,
    element: 'water',
    art: 'oracle',
    identity: true,
  },
  {
    id: 'you-galesworn',
    name: 'Galesworn',
    title: 'Sky Courier',
    vibe: 'Carries oaths the wind refuses to drop.',
    level: 2,
    top: 6,
    right: 4,
    bottom: 3,
    left: 5,
    element: 'wind',
    art: 'wyvern',
    identity: true,
  },
  {
    id: 'you-rootbound',
    name: 'Rootbound',
    title: 'Grove Knight',
    vibe: 'A hedge-oath. The orchard knighted them first.',
    level: 2,
    top: 3,
    right: 4,
    bottom: 6,
    left: 5,
    element: 'earth',
    art: 'matron',
    identity: true,
  },
  {
    id: 'you-sparkclerk',
    name: 'Sparkclerk',
    title: 'Storm Scribe',
    vibe: 'Writes verdicts the thunder has not yet spoken.',
    level: 2,
    top: 5,
    right: 6,
    bottom: 3,
    left: 4,
    element: 'thunder',
    art: 'choir',
    identity: true,
  },
  {
    id: 'you-dawnkept',
    name: 'Dawnkept',
    title: 'Chapel Orphan',
    vibe: 'Raised under a cracked rose window. Still keeps hours.',
    level: 2,
    top: 6,
    right: 4,
    bottom: 5,
    left: 3,
    element: 'holy',
    art: 'paladin',
    identity: true,
  },
  {
    id: 'you-veilkept',
    name: 'Veilkept',
    title: 'Night Apprentice',
    vibe: 'Learned their name on the wrong side of dusk.',
    level: 2,
    top: 5,
    right: 3,
    bottom: 4,
    left: 6,
    element: 'dark',
    art: 'witch',
    identity: true,
  },
  {
    id: 'you-rotbriar',
    name: 'Rotbriar',
    title: 'Sweet-Thorn',
    vibe: 'A hedge-witch. The briar pays rent in small mercies.',
    level: 2,
    top: 4,
    right: 5,
    bottom: 6,
    left: 3,
    element: 'poison',
    art: 'plague',
    identity: true,
  },
];

export function isIdentityId(id) {
  return IDENTITIES.some((card) => card.id === id);
}

export function identityById(id) {
  return IDENTITIES.find((card) => card.id === id) || IDENTITIES[0];
}

export function hexDigit(n) {
  const clamped = Math.max(0, Math.min(15, n | 0));
  return '0123456789ABCDEF'[clamped];
}

export function cardById(id) {
  return ROSTER.find((c) => c.id === id) || IDENTITIES.find((c) => c.id === id);
}

/**
 * Triple Triad–style levels 1–10.
 * Total value = Top + Right + Bottom + Left.
 * Rank ceiling is the highest of those four, printed in hex 1–A.
 */
export const LEVELS = [
  { level: 1, role: 'Common beasts', maxRank: 6, totalMin: 14, totalMax: 18 },
  { level: 2, role: 'Beasts', maxRank: 7, totalMin: 16, totalMax: 20 },
  { level: 3, role: 'Beasts', maxRank: 7, totalMin: 20, totalMax: 24 },
  { level: 4, role: 'Beasts', maxRank: 7, totalMin: 22, totalMax: 26 },
  { level: 5, role: 'Elite beasts', maxRank: 7, totalMin: 24, totalMax: 28 },
  { level: 6, role: 'Warlords', maxRank: 8, totalMin: 26, totalMax: 30 },
  { level: 7, role: 'Warlords', maxRank: 8, totalMin: 28, totalMax: 32 },
  { level: 8, role: 'Relics', maxRank: 9, totalMin: 30, totalMax: 34 },
  { level: 9, role: 'Relics', maxRank: 10, totalMin: 32, totalMax: 36 },
  { level: 10, role: 'Sovereigns', maxRank: 10, totalMin: 34, totalMax: 38 },
];

export function totalValue(card) {
  return (card?.top || 0) + (card?.right || 0) + (card?.bottom || 0) + (card?.left || 0);
}

export function maxRank(card) {
  return Math.max(card?.top || 0, card?.right || 0, card?.bottom || 0, card?.left || 0);
}

export function levelOf(card) {
  const n = Number(card?.level);
  if (n >= 1 && n <= 10) return n;
  return 1;
}

export function levelBand(level) {
  return LEVELS[(levelOf({ level }) || 1) - 1];
}

/** beast 1–5, warlord 6–7, relic 8–9, sovereign 10 */
export function tierOf(card) {
  const lv = levelOf(card);
  if (lv >= 10) return 'sovereign';
  if (lv >= 8) return 'relic';
  if (lv >= 6) return 'warlord';
  return 'beast';
}

export function tierLabel(card) {
  const labels = { beast: 'Beast', warlord: 'Warlord', relic: 'Relic', sovereign: 'Sovereign' };
  return labels[tierOf(card)] || 'Beast';
}

/** Visual rarity derived from level — does not change battle math. */
export function rarityOf(card) {
  if (card?.rarity) return card.rarity;
  const lv = levelOf(card);
  if (lv >= 10) return 'legendary';
  if (lv >= 8) return 'epic';
  if (lv >= 6) return 'rare';
  if (lv >= 4) return 'uncommon';
  return 'common';
}

const FRAME_BY_ELEMENT = {
  fire: 'crimson',
  holy: 'ivory',
  dark: 'void',
  thunder: 'azure',
  ice: 'frost',
  water: 'tide',
  poison: 'venom',
  earth: 'bronze',
  wind: 'gale',
};

export function frameOf(card) {
  return card?.frame || FRAME_BY_ELEMENT[card?.element] || 'bronze';
}

/** Original type-lines and flavor. Real English only — no fake runes. */
const LORE = {
  'ashen-phoenix': {
    kind: 'Champion — Ember Beast',
    flavor: 'When the last temple burned, it nested in the coals and called the fire home.',
  },
  gravewing: {
    kind: 'Champion — Bone Tyrant',
    flavor: 'Its wings are a reliquary. Every feather is a name the grave still owes.',
  },
  tidebreaker: {
    kind: 'Champion — Abyss Coil',
    flavor: 'Ships vanish where its coils rewrite the map of the deep.',
  },
  stormglass: {
    kind: 'Champion — Sky-Scribe',
    flavor: 'She writes verdicts in lightning. The sky is her only witness.',
  },
  'iron-vow': {
    kind: 'Champion — Oath Paladin',
    flavor: 'The vow is older than the armor. The armor is only there to keep it.',
  },
  voidglass: {
    kind: 'Champion — Last Phylactery',
    flavor: 'He stored his death in a shard of night and forgot which pocket it was in.',
  },
  bloodmoon: {
    kind: 'Champion — Crimson Duelist',
    flavor: 'She counts the duel in heartbeats. Yours, not hers.',
  },
  thornwake: {
    kind: 'Champion — Bloom of Knives',
    flavor: 'The orchard opens its mouths at dusk. Each blossom is a quiet blade.',
  },
  'cinder-behemoth': {
    kind: 'Champion — Furnace Hide',
    flavor: 'Mountains remember its tread as a season of ash.',
  },
  hellforge: {
    kind: 'Champion — Demon Lord',
    flavor: 'Crowns are smelted, not inherited, in the foundry of his court.',
  },
  'gilded-colossus': {
    kind: 'Champion — Judgment Engine',
    flavor: 'It was built to weigh sins. It learned to collect them instead.',
  },
  nightbloom: {
    kind: 'Champion — Hex Orchard',
    flavor: 'Her garden drinks moonlight and pays rent in curses.',
  },
  'rift-stalker': {
    kind: 'Champion — Between-Worlds',
    flavor: 'He walks the seam where two nights fail to meet.',
  },
  'bone-choir': {
    kind: 'Champion — Red Cantor',
    flavor: 'The hymn has no living singers. That has never stopped it.',
  },
  skyraid: {
    kind: 'Champion — Gale Lance',
    flavor: 'Storms take the shape of a wyvern when they want to be believed.',
  },
  'abyssal-countess': {
    kind: 'Champion — Velvet Cataclysm',
    flavor: 'She drowned a city once, for the acoustics.',
  },
  runebound: {
    kind: 'Champion — Law of Stone',
    flavor: 'The runes are a contract. The golem is the signature that walks.',
  },
  'pearl-seraph': {
    kind: 'Champion — Dawnwarden',
    flavor: 'Dawn is a door. She stands in it until the dark learns manners.',
  },
  plaguebloom: {
    kind: 'Champion — Sweet Rot',
    flavor: 'It smells like orchards. That is how it finds the door.',
  },
  'ember-drake': {
    kind: 'Champion — Kindling Prince',
    flavor: 'Smaller than the old drakes. Hungrier, which is worse.',
  },
  'frost-wraith': {
    kind: 'Champion — Hollow Thaw',
    flavor: 'Winter leftover in the shape of someone who would not leave.',
  },
  'shard-knight': {
    kind: 'Champion — Glass Crusade',
    flavor: 'Every plate is a frozen vow. They crack before they yield.',
  },
  'you-cinderpath': {
    kind: 'Identity — Ash Pilgrim',
    flavor: 'A spark-sworn wanderer. The first coal still answers.',
  },
  'you-rimewake': {
    kind: 'Identity — Hollow Squire',
    flavor: 'Keeps a vow that froze before it finished.',
  },
  'you-tidevow': {
    kind: 'Identity — Salt Cantor',
    flavor: 'Sings the red current and bargains with wrecks.',
  },
  'you-galesworn': {
    kind: 'Identity — Sky Courier',
    flavor: 'Carries oaths the wind refuses to drop.',
  },
  'you-rootbound': {
    kind: 'Identity — Grove Knight',
    flavor: 'A hedge-oath. The orchard knighted them first.',
  },
  'you-sparkclerk': {
    kind: 'Identity — Storm Scribe',
    flavor: 'Writes verdicts the thunder has not yet spoken.',
  },
  'you-dawnkept': {
    kind: 'Identity — Chapel Orphan',
    flavor: 'Raised under a cracked rose window. Still keeps hours.',
  },
  'you-veilkept': {
    kind: 'Identity — Night Apprentice',
    flavor: 'Learned their name on the wrong side of dusk.',
  },
  'you-rotbriar': {
    kind: 'Identity — Sweet-Thorn',
    flavor: 'A hedge-witch. The briar pays rent in small mercies.',
  },
};

export function loreOf(card) {
  const catalog = card?.id ? cardById(card.id) : null;
  const view = { ...catalog, ...card };
  const stored = LORE[view?.id];
  const identity = Boolean(view?.identity) || isIdentityId(view?.id);
  const left = identity ? 'Identity' : tierLabel(view);
  const right = stored?.kind?.includes(' — ')
    ? stored.kind.split(' — ')[1]
    : stored?.kind || view?.title || 'Relic';
  return {
    kind: `${left} — ${right}`,
    flavor: stored?.flavor || view?.vibe || view?.title || 'A champion bound to the ninefold grid.',
  };
}
