import { DIRECTIONS, hexDigit, rarityOf, frameOf, loreOf, typeWord } from './cards.js';
import { creatureSVG, cardBackSVG, elementGlyph } from './art.js';

const ARROW_SVG = `<svg class="arr-svg" viewBox="0 0 24 20" aria-hidden="true"><path d="M12 1.6 L22.8 18.6 H1.2 Z"/></svg>`;

function escapeText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCard(card, options = {}) {
  const owner = options.owner || card.owner || 'player';
  const surface = options.surface || 'board';
  const uid = `${surface}-${card.instanceId}-${owner}`;
  const rarity = rarityOf(card);
  const frame = frameOf(card);
  const lore = loreOf(card);
  const selected = options.selected ? ' selected' : '';
  const captured = options.captured ? ' just-captured' : '';
  const placed = options.placed ? ' just-placed' : '';
  const arrows = DIRECTIONS.map((dir) =>
    card.arrows & dir.bit ? `<span class="arr ${dir.key}" title="${dir.key}">${ARROW_SVG}</span>` : '',
  ).join('');
  const el = card.element
    ? `<div class="tm-el el-${card.element}" title="${escapeText(card.element)}"><span class="el-face">${elementGlyph(card.element)}</span></div>`
    : `<div class="tm-el el-none" title="No element"></div>`;
  const atk = hexDigit(card.attack);
  const pdef = hexDigit(card.pdef);
  const mdef = hexDigit(card.mdef);

  return `<article class="tm-card owner-${owner} rarity-${rarity} frame-${frame}${selected}${captured}${placed}" data-instance="${card.instanceId}" data-id="${card.id}" data-rarity="${rarity}">
    <div class="tm-bevel">
      <div class="tm-gilt">
        <div class="tm-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <header class="tm-titlebar">
          <h3 class="tm-card-name">${escapeText(card.name)}</h3>
          <div class="tm-cost">${el}</div>
        </header>
        <div class="tm-portrait">
          <div class="tm-art">${creatureSVG(card.art, uid)}</div>
          <div class="tm-stats" aria-label="Attack ${atk}, type ${card.type}, physical ${pdef}, magical ${mdef}">
            <span class="atk">${atk}</span>
            <span class="mid"><span class="typ">${card.type}</span><span class="pd">${pdef}</span></span>
            <span class="md">${mdef}</span>
          </div>
          <div class="tm-sheen" aria-hidden="true"></div>
        </div>
        <p class="tm-typeline">${escapeText(lore.kind)} · ${typeWord(card.type)}</p>
        <div class="tm-textbox">
          <p class="tm-flavor">${escapeText(lore.flavor)}</p>
          <div class="tm-ptbox" title="Attack ${atk} ${card.type} · P.Def ${pdef} · M.Def ${mdef}">
            <span class="pt-atk">${atk}<small>${card.type}</small></span>
            <span class="pt-def">${pdef}/${mdef}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="tm-arrows">${arrows}</div>
  </article>`;
}

export function renderCardBack(index) {
  return `<article class="tm-card owner-ai face-down rarity-rare frame-bronze" data-back="${index}">
    <div class="tm-bevel">
      <div class="tm-gilt">
        <div class="tm-art tm-art-full">${cardBackSVG(`back-${index}`)}</div>
      </div>
    </div>
  </article>`;
}

export function typeLabel(type) {
  return typeWord(type);
}
