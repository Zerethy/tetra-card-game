import { DIRECTIONS, hexDigit, rarityOf } from './cards.js';
import { creatureSVG, cardBackSVG, elementGlyph } from './art.js';

const ARROW_SVG = `<svg class="arr-svg" viewBox="0 0 24 20" aria-hidden="true"><path d="M12 1.6 L22.8 18.6 H1.2 Z"/></svg>`;

export function renderCard(card, options = {}) {
  const owner = options.owner || card.owner || 'player';
  const surface = options.surface || 'board';
  const uid = `${surface}-${card.instanceId}-${owner}`;
  const rarity = rarityOf(card);
  const selected = options.selected ? ' selected' : '';
  const captured = options.captured ? ' just-captured' : '';
  const placed = options.placed ? ' just-placed' : '';
  const showName = options.showName
    ? `<div class="tm-name"><span>${card.name}</span></div>`
    : '';
  const arrows = DIRECTIONS.map((dir) =>
    card.arrows & dir.bit ? `<span class="arr ${dir.key}" title="${dir.key}">${ARROW_SVG}</span>` : '',
  ).join('');
  const el = card.element
    ? `<div class="tm-el el-${card.element}" title="${card.element}"><span class="el-face">${elementGlyph(card.element)}</span></div>`
    : '';

  return `<article class="tm-card owner-${owner} rarity-${rarity}${selected}${captured}${placed}" data-instance="${card.instanceId}" data-id="${card.id}" data-rarity="${rarity}">
    <div class="tm-art">${creatureSVG(card.art, uid)}</div>
    <div class="tm-wash" aria-hidden="true"></div>
    <div class="tm-frame" aria-hidden="true"></div>
    <div class="tm-sheen" aria-hidden="true"></div>
    <div class="tm-stats" aria-label="Attack ${hexDigit(card.attack)}, type ${card.type}, physical ${hexDigit(card.pdef)}, magical ${hexDigit(card.mdef)}">
      <span class="atk">${hexDigit(card.attack)}</span>
      <span class="mid"><span class="typ">${card.type}</span><span class="pd">${hexDigit(card.pdef)}</span></span>
      <span class="md">${hexDigit(card.mdef)}</span>
    </div>
    ${el}
    <div class="tm-arrows">${arrows}</div>
    ${showName}
  </article>`;
}

export function renderCardBack(index) {
  return `<article class="tm-card owner-ai face-down rarity-rare" data-back="${index}">
    <div class="tm-art">${cardBackSVG(`back-${index}`)}</div>
    <div class="tm-frame" aria-hidden="true"></div>
  </article>`;
}

export function typeLabel(type) {
  return { P: 'Physical', M: 'Magical', X: 'Flexible', A: 'Assault' }[type] || type;
}
