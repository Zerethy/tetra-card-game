/** Arrow bits: N, NE, E, SE, S, SW, W, NW */
export const DIR = {
  N: 1,
  NE: 2,
  E: 4,
  SE: 8,
  S: 16,
  SW: 32,
  W: 64,
  NW: 128,
};

export const DIRECTIONS = [
  { bit: DIR.N, key: 'N', dr: -1, dc: 0, opposite: DIR.S },
  { bit: DIR.NE, key: 'NE', dr: -1, dc: 1, opposite: DIR.SW },
  { bit: DIR.E, key: 'E', dr: 0, dc: 1, opposite: DIR.W },
  { bit: DIR.SE, key: 'SE', dr: 1, dc: 1, opposite: DIR.NW },
  { bit: DIR.S, key: 'S', dr: 1, dc: 0, opposite: DIR.N },
  { bit: DIR.SW, key: 'SW', dr: 1, dc: -1, opposite: DIR.NE },
  { bit: DIR.W, key: 'W', dr: 0, dc: -1, opposite: DIR.E },
  { bit: DIR.NW, key: 'NW', dr: -1, dc: -1, opposite: DIR.SE },
];

export const ELEMENTS = ['fire', 'ice', 'water', 'wind', 'earth', 'thunder', 'holy', 'dark', 'poison'];

/** Attacker element beats this defender element. */
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

const A = DIR;

/**
 * Original dark-fantasy roster. Names, stats, and arrows are original.
 * Archetypes nod at classic JRPG bosses and infernal warlords without copying them.
 */
export const ROSTER = [
  {
    id: 'ashen-phoenix',
    name: 'Ashen Phoenix',
    title: 'Cinder Sovereign',
    attack: 8,
    type: 'P',
    pdef: 4,
    mdef: 6,
    arrows: A.N | A.NE | A.E | A.SW,
    element: 'fire',
    art: 'phoenix',
  },
  {
    id: 'gravewing',
    name: 'Gravewing',
    title: 'Bone Tyrant',
    attack: 7,
    type: 'M',
    pdef: 5,
    mdef: 8,
    arrows: A.N | A.W | A.E | A.S,
    element: 'dark',
    art: 'gravewing',
  },
  {
    id: 'tidebreaker',
    name: 'Tidebreaker',
    title: 'Abyss Coil',
    attack: 6,
    type: 'P',
    pdef: 7,
    mdef: 5,
    arrows: A.W | A.SW | A.S | A.SE,
    element: 'water',
    art: 'serpent',
  },
  {
    id: 'stormglass',
    name: 'Stormglass Oracle',
    title: 'Sky-Scribe',
    attack: 5,
    type: 'M',
    pdef: 3,
    mdef: 9,
    arrows: A.N | A.NE | A.NW,
    element: 'thunder',
    art: 'oracle',
  },
  {
    id: 'iron-vow',
    name: 'Iron Vow',
    title: 'Oath Paladin',
    attack: 7,
    type: 'P',
    pdef: 9,
    mdef: 4,
    arrows: A.N | A.S | A.W,
    element: 'holy',
    art: 'paladin',
  },
  {
    id: 'voidglass',
    name: 'Voidglass Lich',
    title: 'Last Phylactery',
    attack: 6,
    type: 'M',
    pdef: 4,
    mdef: 8,
    arrows: A.E | A.SE | A.S | A.SW,
    element: 'dark',
    art: 'lich',
  },
  {
    id: 'bloodmoon',
    name: 'Bloodmoon Duelist',
    title: 'Crimson Step',
    attack: 9,
    type: 'P',
    pdef: 3,
    mdef: 3,
    arrows: A.NE | A.E | A.SE,
    element: 'poison',
    art: 'duelist',
  },
  {
    id: 'thornwake',
    name: 'Thornwake Matron',
    title: 'Bloom of Knives',
    attack: 4,
    type: 'P',
    pdef: 8,
    mdef: 6,
    arrows: A.N | A.S | A.E | A.W,
    element: 'earth',
    art: 'matron',
  },
  {
    id: 'cinder-behemoth',
    name: 'Cinder Behemoth',
    title: 'Furnace Hide',
    attack: 8,
    type: 'P',
    pdef: 8,
    mdef: 2,
    arrows: A.N | A.NW | A.W | A.SW,
    element: 'fire',
    art: 'behemoth',
  },
  {
    id: 'hellforge',
    name: 'Hellforge Tyrant',
    title: 'Crown of Cinders',
    attack: 10,
    type: 'A',
    pdef: 6,
    mdef: 6,
    arrows: A.N | A.NE | A.E | A.SE | A.S,
    element: 'fire',
    art: 'tyrant',
  },
  {
    id: 'gilded-colossus',
    name: 'Gilded Colossus',
    title: 'Judgment Engine',
    attack: 7,
    type: 'A',
    pdef: 8,
    mdef: 8,
    arrows: A.N | A.E | A.S | A.W,
    element: 'holy',
    art: 'colossus',
  },
  {
    id: 'nightbloom',
    name: 'Nightbloom Witch',
    title: 'Hex Orchard',
    attack: 5,
    type: 'M',
    pdef: 4,
    mdef: 7,
    arrows: A.NW | A.N | A.NE | A.E,
    element: 'poison',
    art: 'witch',
  },
  {
    id: 'rift-stalker',
    name: 'Rift Stalker',
    title: 'Between-Worlds',
    attack: 8,
    type: 'X',
    pdef: 5,
    mdef: 5,
    arrows: A.NE | A.SE | A.SW | A.NW,
    element: 'dark',
    art: 'stalker',
  },
  {
    id: 'bone-choir',
    name: 'Bone Choir',
    title: 'Red Cantor',
    attack: 6,
    type: 'M',
    pdef: 5,
    mdef: 7,
    arrows: A.N | A.E | A.S,
    element: 'dark',
    art: 'choir',
  },
  {
    id: 'skyraid',
    name: 'Skyraid Wyvern',
    title: 'Gale Lance',
    attack: 7,
    type: 'P',
    pdef: 4,
    mdef: 5,
    arrows: A.N | A.NE | A.NW | A.E,
    element: 'wind',
    art: 'wyvern',
  },
  {
    id: 'abyssal-countess',
    name: 'Abyssal Countess',
    title: 'Velvet Cataclysm',
    attack: 8,
    type: 'M',
    pdef: 5,
    mdef: 9,
    arrows: A.W | A.SW | A.S | A.SE | A.E,
    element: 'water',
    art: 'countess',
  },
  {
    id: 'runebound',
    name: 'Runebound Golem',
    title: 'Law of Stone',
    attack: 5,
    type: 'P',
    pdef: 11,
    mdef: 6,
    arrows: A.N | A.S | A.E | A.W | A.SE,
    element: 'earth',
    art: 'golem',
  },
  {
    id: 'pearl-seraph',
    name: 'Pearl Seraph',
    title: 'Dawnwarden',
    attack: 6,
    type: 'M',
    pdef: 6,
    mdef: 8,
    arrows: A.N | A.NE | A.NW | A.S,
    element: 'holy',
    art: 'seraph',
  },
  {
    id: 'plaguebloom',
    name: 'Plaguebloom',
    title: 'Sweet Rot',
    attack: 4,
    type: 'X',
    pdef: 7,
    mdef: 7,
    arrows: A.S | A.SW | A.SE | A.W,
    element: 'poison',
    art: 'plague',
  },
  {
    id: 'ember-drake',
    name: 'Ember Drake',
    title: 'Kindling Prince',
    attack: 6,
    type: 'P',
    pdef: 5,
    mdef: 4,
    arrows: A.E | A.SE | A.S,
    element: 'fire',
    art: 'drake',
  },
  {
    id: 'frost-wraith',
    name: 'Frost Wraith',
    title: 'Hollow Thaw',
    attack: 5,
    type: 'M',
    pdef: 4,
    mdef: 10,
    arrows: A.N | A.W | A.NW,
    element: 'ice',
    art: 'wraith',
  },
  {
    id: 'shard-knight',
    name: 'Shard Knight',
    title: 'Glass Crusade',
    attack: 7,
    type: 'X',
    pdef: 7,
    mdef: 7,
    arrows: A.N | A.NE | A.S | A.SW,
    element: 'ice',
    art: 'shard',
  },
];

export function hexDigit(n) {
  const clamped = Math.max(0, Math.min(15, n | 0));
  return '0123456789ABCDEF'[clamped];
}

export function cardById(id) {
  return ROSTER.find((c) => c.id === id);
}

/** Visual rarity only — does not change battle math. */
export function rarityOf(card) {
  if (card?.rarity) return card.rarity;
  const power = (card?.attack || 0) + (card?.pdef || 0) + (card?.mdef || 0);
  if ((card?.attack || 0) >= 10 || power >= 22) return 'legendary';
  if (power >= 16) return 'rare';
  return 'uncommon';
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

const TYPE_WORD = { P: 'Physical', M: 'Magical', X: 'Flexible', A: 'Assault' };

export function typeWord(type) {
  return TYPE_WORD[type] || 'Physical';
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
};

export function loreOf(card) {
  return (
    LORE[card?.id] || {
      kind: `Champion — ${card?.title || 'Relic'}`,
      flavor: card?.title || 'A champion bound to the ninefold grid.',
    }
  );
}
