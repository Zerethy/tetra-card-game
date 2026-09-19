import { hexDigit, rarityOf, frameOf, loreOf, levelOf, ELEMENT_RINGS, cardById, totalValue, ROSTER, IDENTITIES, isIdentityId, DEFAULT_IDENTITY_ID } from './cards.js';
import { creatureSVG, cardBackSVG, elementGlyph } from './art.js';

function escapeText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rankDigit(card, side) {
  return hexDigit(card[side] | 0);
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
  const you = card.identity || isIdentityId(card.id) ? ' identity-you' : '';
  const el = card.element
    ? `<div class="tm-el el-${card.element}" title="${escapeText(card.element)}"><span class="el-face">${elementGlyph(card.element)}</span></div>`
    : `<div class="tm-el el-none" title="No element"></div>`;
  const t = rankDigit(card, 'top');
  const r = rankDigit(card, 'right');
  const b = rankDigit(card, 'bottom');
  const l = rankDigit(card, 'left');
  const level = levelOf(card);
  const kindParts = lore.kind.includes(' — ') ? lore.kind.split(' — ') : ['Beast', lore.kind];

  return `<article class="tm-card owner-${owner} rarity-${rarity} frame-${frame}${selected}${captured}${placed}${you}" data-instance="${card.instanceId}" data-id="${card.id}" data-rarity="${rarity}" data-level="${level}">
    <div class="tm-bevel">
      <div class="tm-gilt">
        <div class="tm-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="tm-runes" aria-hidden="true"></div>
        <header class="tm-titlebar">
          <h3 class="tm-card-name">${escapeText(card.name)}</h3>
          <div class="tm-cost">
            <div class="tm-level" title="Level ${level}">${level}</div>
            ${el}
          </div>
        </header>
        <div class="tm-portrait">
          <div class="tm-art">${creatureSVG(card.art, uid)}</div>
          <div class="tm-ranks" aria-label="Top ${t}, Right ${r}, Bottom ${b}, Left ${l}">
            <span class="rk t">${t}</span>
            <span class="rk r">${r}</span>
            <span class="rk b">${b}</span>
            <span class="rk l">${l}</span>
          </div>
          <div class="tm-sheen" aria-hidden="true"></div>
        </div>
        <p class="tm-typeline"><span>${escapeText(kindParts[0])}</span><span>${escapeText(kindParts[1] || '')}</span></p>
        <div class="tm-textbox">
          <p class="tm-flavor">${escapeText(lore.flavor)}</p>
          <div class="tm-ptbox" title="Top ${t} · Right ${r} · Bottom ${b} · Left ${l} · total ${totalValue(card)}">
            <span class="pt-atk">${t}/${r}</span>
            <span class="pt-def">${b}/${l}</span>
          </div>
        </div>
      </div>
    </div>
    ${card.identity || isIdentityId(card.id) ? '<span class="you-tag">You</span>' : ''}
  </article>`;
}

export function renderCardBack(index, options = {}) {
  const owner = options.owner === 'none' ? '' : ` owner-${options.owner || 'ai'}`;
  return `<article class="tm-card${owner} face-down rarity-rare frame-celestial" data-back="${index}">
    <div class="tm-bevel">
      <div class="tm-gilt">
        <div class="tm-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="tm-art tm-art-full">${cardBackSVG(`back-${index}`)}</div>
      </div>
    </div>
  </article>`;
}

const ELEMENT_TITLE = {
  fire: 'Fire',
  ice: 'Ice',
  water: 'Water',
  wind: 'Wind',
  earth: 'Earth',
  thunder: 'Thunder',
  holy: 'Holy',
  dark: 'Dark',
  poison: 'Poison',
};

export function renderElementWheel() {
  const rings = ELEMENT_RINGS.map(
    (ring) => `<div class="wheel-ring" data-ring="${ring.id}">
      ${ring.nodes
        .map((el, i) => {
          const beats = ring.nodes[(i + 1) % ring.nodes.length];
          return `<span class="wheel-node el-${el}" title="${ELEMENT_TITLE[el]} beats ${ELEMENT_TITLE[beats]}">${elementGlyph(el)}</span>`;
        })
        .join('')}
    </div>`,
  ).join('');
  return `<p class="hud-wheel-title">Elemental Wheel</p>
    <div class="wheel-rings">${rings}</div>
    <p class="hud-wheel-note">Clockwise beats · tie-break +1</p>
    <p class="hud-wheel-note">Never overturns a number gap</p>`;
}

export function clashFlashHtml(battle) {
  const summary = battle?.summary || `${battle?.rawAtk ?? '?'} vs ${battle?.rawDef ?? '?'} — held`;
  const [compare, outcome] = String(summary).split(/\s+—\s+/);
  const bits = [
    `<span class="cf-rank"><b>${escapeText(compare)}</b>${outcome ? `<i>${escapeText(outcome)}</i>` : ''}</span>`,
  ];
  if (battle?.elementMod > 0) {
    bits.push(`<span class="cf-el">${ELEMENT_TITLE[battle.attackerElement] || 'Element'} +1</span>`);
  } else if (battle?.elementMod < 0) {
    bits.push(`<span class="cf-el dim">${ELEMENT_TITLE[battle.defenderElement] || 'Element'} −1</span>`);
  }
  return `<div class="clash-flash">${bits.join('')}</div>`;
}

export function renderChip(id, label, selected, title = '', options = {}) {
  const tip = title ? ` title="${escapeText(title)}"` : '';
  const locked = options.locked ? ' locked' : '';
  const disabled = options.locked ? ' disabled' : '';
  return `<button type="button" class="chip${selected ? ' selected' : ''}${locked}" data-id="${escapeText(id)}"${disabled}${tip}>${escapeText(label)}</button>`;
}

export function renderUltimateStrip(boss, claimedIds = []) {
  if (!boss?.ultimates?.length) {
    return `<p class="ultimate-empty">No reserved ultimates — a mixed wandering deck.</p>`;
  }
  const claimed = new Set(claimedIds);
  const cards = boss.ultimates.map((id, i) => {
    const html = renderCard({ ...cardTemplate(id), instanceId: `ult-${i}`, owner: 'ai' }, { surface: `ult${i}`, showName: true });
    const owned = claimed.has(id) ? ' claimed' : '';
    return `<div class="ultimate-slot${owned}" data-id="${id}">${html}<span class="ult-tag">Ultimate</span></div>`;
  });
  const names = boss.ultimates.map((id) => escapeText(cardTemplate(id).name)).join(' · ');
  const band = boss.band ? ` · ${escapeText(boss.band)}` : '';
  return `<p class="setup-label">Stage ${boss.stage || '?'}${band}</p>
    <div class="ultimate-row">${cards.join('')}</div>
    <p class="ultimate-names">${escapeText(boss.name)} — ${names}</p>`;
}

export function renderAlbumLocked(card) {
  return `<article class="tm-card album-locked frame-void" data-id="${escapeText(card.id)}" aria-label="Unknown card">
    <div class="tm-bevel"><div class="tm-gilt">
      <div class="tm-art tm-art-full album-silhouette"></div>
      <p class="album-unknown">???</p>
    </div></div>
  </article>`;
}

export function renderAlbumGrid(campaign, loadout = [], pendingId = null) {
  const selected = new Set(loadout);
  const copiesById = new Map();
  for (const owned of campaign.player || []) {
    const list = copiesById.get(owned.id) || [];
    list.push(owned);
    copiesById.set(owned.id, list);
  }
  const identityOwned = (campaign.player || []).find((c) => isIdentityId(c.id));
  const identityTile = identityOwned
    ? (() => {
        const card = cardById(identityOwned.id);
        const inLoadout = selected.has(identityOwned.uid);
        const view = { ...card, uid: identityOwned.uid, instanceId: identityOwned.uid, owner: 'player' };
        const seat = inLoadout ? ' seated' : ' available';
        const picking = pendingId === card.id ? ' pick-source' : '';
        return `<div role="button" tabindex="0" class="album-tile owned identity-tile pinned${inLoadout ? ' in-loadout' : ''}${seat}${picking}" data-id="${escapeText(card.id)}" data-uid="${escapeText(identityOwned.uid)}" data-pinned="1" draggable="false">
        ${renderCard(view, { surface: `al-${card.id}`, owner: 'player', showName: true })}
        <span class="album-count"><span class="album-state ${inLoadout ? 'is-selected' : 'is-ready'}">${inLoadout ? 'In five' : 'Available'}</span> · You · ${inLoadout ? 'pinned' : 'owned'}</span>
      </div>`;
      })()
    : '';
  const tiles = ROSTER.slice()
    .sort((a, b) => {
      const ao = copiesById.has(a.id) ? 0 : 1;
      const bo = copiesById.has(b.id) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      if (ao === 0) return b.level - a.level || a.name.localeCompare(b.name);
      return a.level - b.level || a.name.localeCompare(b.name);
    })
    .map((card) => {
      const copies = copiesById.get(card.id) || [];
      if (!copies.length) {
        return `<div class="album-tile locked" data-id="${escapeText(card.id)}" aria-disabled="true" title="Not yet owned">
          ${renderAlbumLocked(card)}
          <span class="album-count"><span class="album-state is-locked">Locked</span> · unknown</span>
        </div>`;
      }
      const inLoadout = copies.filter((c) => selected.has(c.uid)).length;
      const free = copies.find((c) => !selected.has(c.uid)) || copies[0];
      const seated = inLoadout === copies.length;
      const picking = pendingId === card.id ? ' pick-source' : '';
      const view = { ...card, uid: copies[0].uid, instanceId: copies[0].uid, owner: 'player' };
      return `<div role="button" tabindex="0" class="album-tile owned${inLoadout ? ' in-loadout' : ''}${seated ? ' seated' : ' available'}${picking}" data-id="${escapeText(card.id)}" data-uid="${escapeText(free.uid)}" draggable="false">
        ${renderCard(view, { surface: `al-${card.id}`, owner: 'player', showName: true })}
        <span class="album-count"><span class="album-state ${seated ? 'is-selected' : 'is-ready'}">${seated ? 'In five' : 'Available'}</span> · ${copies.length} owned${inLoadout ? ` · ${inLoadout} in five` : ''}${seated ? '' : ' · drag in'}</span>
      </div>`;
    });
  return identityTile + tiles.join('');
}

export function renderIdentityGrid(selectedId) {
  return IDENTITIES.map((card) => {
    const view = { ...card, instanceId: card.id, owner: 'player' };
    const recommended = card.id === DEFAULT_IDENTITY_ID ? ' recommended' : '';
    const sel = selectedId === card.id ? ' selected' : '';
    const elName = ELEMENT_TITLE[card.element] || card.element;
    return `<button type="button" class="identity-pick${sel}${recommended}" data-id="${escapeText(card.id)}" title="${escapeText(card.vibe)}">
      ${renderCard(view, { surface: `id-${card.id}`, owner: 'player', showName: true })}
      ${recommended ? '<span class="rec-tag">Recommended</span>' : ''}
      <span class="identity-el el-${escapeText(card.element)}">${escapeText(elName)} · ${escapeText(card.title)}</span>
      <span class="identity-vibe">${escapeText(card.vibe)}</span>
    </button>`;
  }).join('');
}

function cardTemplate(id) {
  const t = cardById(id);
  return t
    ? { ...t }
    : { id, name: id, title: '', top: 0, right: 0, bottom: 0, left: 0, element: null, art: 'drake', level: 1 };
}

export function renderClaimCard(card, options = {}) {
  const selected = options.selected ? ' selected' : '';
  const locked = options.locked ? ' locked' : '';
  const ult = options.ultimate ? ' ultimate' : '';
  return `<button type="button" class="claim-pick${selected}${locked}${ult}" data-uid="${escapeText(card.uid || card.instanceId)}" data-id="${escapeText(card.id)}">
    ${renderCard(card, { surface: options.surface || 'claim', owner: card.owner || 'ai', showName: true })}
    ${options.ultimate ? '<span class="ult-tag">Ultimate</span>' : ''}
  </button>`;
}
