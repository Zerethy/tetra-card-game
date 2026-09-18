import { DIRECTIONS, hexDigit } from './cards.js';
import { creatureSVG, cardBackSVG, elementGlyph } from './art.js';

export function renderCard(card, options = {}) {
  const owner = options.owner || card.owner || 'player';
  const surface = options.surface || 'board';
  const uid = `${surface}-${card.instanceId}-${owner}`;
  const selected = options.selected ? ' selected' : '';
  const captured = options.captured ? ' just-captured' : '';
  const placed = options.placed ? ' just-placed' : '';
  const showName = options.showName ? `<div class="tm-name">${card.name}</div>` : '';
  const arrows = DIRECTIONS.map((dir) =>
    card.arrows & dir.bit ? `<span class="arr ${dir.key}" title="${dir.key}"></span>` : '',
  ).join('');
  const el = card.element
    ? `<div class="tm-el" title="${card.element}">${elementGlyph(card.element)}</div>`
    : '';

  return `<article class="tm-card owner-${owner}${selected}${captured}${placed}" data-instance="${card.instanceId}" data-id="${card.id}">
    <div class="tm-art">${creatureSVG(card.art, uid)}</div>
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
  return `<article class="tm-card owner-ai face-down" data-back="${index}">
    <div class="tm-art">${cardBackSVG(`back-${index}`)}</div>
  </article>`;
}

export function typeLabel(type) {
  return { P: 'Physical', M: 'Magical', X: 'Flexible', A: 'Assault' }[type] || type;
}
