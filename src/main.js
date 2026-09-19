import { createMatch, placeCard, scores, mulberry32 } from './game.js';
import { chooseAiMove } from './ai.js';
import {
  renderCard,
  renderCardBack,
  renderElementWheel,
  clashFlashHtml,
  renderChip,
  renderUltimateStrip,
  renderClaimCard,
  renderAlbumGrid,
  renderSwitchGrid,
  renderIdentityGrid,
} from './ui.js';
import {
  BOSSES,
  TRADE_RULES,
  loadCampaign,
  saveCampaign,
  resetCampaign,
  bossById,
  hydrateOwned,
  pickWager,
  buildBossDeck,
  buildAiVault,
  tradeTakeCount,
  deathTakeCount,
  mustDeathMatch,
  makeDeathSession,
  shouldOfferDeathMatch,
  autoPickHighest,
  preferUltimates,
  tradableCards,
  applyWin,
  applyLoss,
  isUltimateId,
  resolveShowdown,
  isRivalUnlocked,
  STAGE_COUNT,
  LOADOUT_SIZE,
  albumProgress,
  sanitizeLoadout,
  pruneLoadout,
  identityUid,
  bindIdentity,
  dragAlbumToSlot,
  moveLoadoutIndex,
  removeLoadoutUid,
  swapLoadoutWithAlbum,
  switchCandidates,
} from './campaign.js';
import { cardById, DEFAULT_IDENTITY_ID } from './cards.js';

const els = {
  title: document.getElementById('title-overlay'),
  help: document.getElementById('help-overlay'),
  start: document.getElementById('start-btn'),
  newBtn: document.getElementById('new-btn'),
  helpBtn: document.getElementById('help-btn'),
  titleHelp: document.getElementById('title-help-btn'),
  closeHelp: document.getElementById('close-help'),
  board: document.getElementById('board'),
  playerRail: document.getElementById('player-rail'),
  aiRail: document.getElementById('ai-rail'),
  scoreAi: document.getElementById('score-ai'),
  scorePlayer: document.getElementById('score-player'),
  status: document.getElementById('status'),
  hint: document.getElementById('hint'),
  log: document.getElementById('combat-log'),
  result: document.getElementById('result-layer'),
  banner: document.getElementById('result-banner'),
  pip: document.getElementById('turn-pip'),
  side: document.getElementById('side-cards'),
  again: document.getElementById('again-btn'),
  wheel: document.getElementById('hud-wheel'),
  titleDeck: document.getElementById('title-deck'),
  tradeRow: document.getElementById('trade-row'),
  rivalRow: document.getElementById('rival-row'),
  bossUltimates: document.getElementById('boss-ultimates'),
  collectionLine: document.getElementById('collection-line'),
  deathBtn: document.getElementById('death-btn'),
  deathWarn: document.getElementById('death-warn'),
  stakesRow: document.getElementById('stakes-row'),
  claim: document.getElementById('claim-overlay'),
  claimTitle: document.getElementById('claim-title'),
  claimLede: document.getElementById('claim-lede'),
  claimGrid: document.getElementById('claim-grid'),
  claimUltimates: document.getElementById('claim-ultimates'),
  claimNote: document.getElementById('claim-note'),
  claimConfirm: document.getElementById('claim-confirm'),
  deathOptin: document.getElementById('death-optin'),
  death: document.getElementById('death-overlay'),
  deathLede: document.getElementById('death-lede'),
  deathDuel: document.getElementById('death-duel'),
  deathNote: document.getElementById('death-note'),
  deathGo: document.getElementById('death-go'),
  deathDone: document.getElementById('death-done'),
  zoom: document.getElementById('card-zoom'),
  album: document.getElementById('album-overlay'),
  albumBtn: document.getElementById('album-btn'),
  albumClose: document.getElementById('album-close'),
  albumConfirm: document.getElementById('album-confirm'),
  albumGrid: document.getElementById('album-grid'),
  albumProgress: document.getElementById('album-progress'),
  albumLede: document.getElementById('album-lede'),
  loadoutRow: document.getElementById('loadout-row'),
  loadoutHint: document.getElementById('loadout-hint'),
  switchPanel: document.getElementById('switch-panel'),
  switchGrid: document.getElementById('switch-grid'),
  switchHint: document.getElementById('switch-hint'),
  browseAllBtn: document.getElementById('browse-all-btn'),
  albumBrowse: document.getElementById('album-browse'),
  identity: document.getElementById('identity-overlay'),
  identityBtn: document.getElementById('identity-btn'),
  identityGrid: document.getElementById('identity-grid'),
  identityConfirm: document.getElementById('identity-confirm'),
};

let campaign = loadCampaign();
let match = null;
let zoomSource = null;
let selected = null;
let busy = false;
let lastPlaced = null;
let captureCells = new Set();
let clashFlashes = new Map();
let audioCtx = null;
let session = null;
let claimState = null;
let deathState = null;
let albumIntent = 'browse';
let pendingIdentity = null;
let pendingSwapId = null;
let pendingSlotIndex = null;
let browseAllOpen = false;
const DRAG_THRESHOLD = 4;
let deckDrag = null;
let skipAlbumClick = false;

function rivalName() {
  return bossById(campaign.rival).name;
}

function audio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tone(freq, duration = 0.12, type = 'square', gain = 0.045) {
  try {
    const ctx = audio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* autoplay restrictions */
  }
}

function sfx(kind) {
  if (kind === 'place') tone(196, 0.1);
  if (kind === 'capture') {
    tone(330, 0.08);
    setTimeout(() => tone(440, 0.1), 70);
  }
  if (kind === 'counter') tone(110, 0.22, 'sawtooth', 0.05);
  if (kind === 'win') {
    tone(392, 0.18, 'triangle', 0.05);
    setTimeout(() => tone(523, 0.28, 'triangle', 0.05), 120);
  }
  if (kind === 'lose') tone(98, 0.4, 'sawtooth', 0.05);
}

function persist() {
  saveCampaign(campaign);
  renderSetup();
}

function renderSetup() {
  if (els.tradeRow) {
    els.tradeRow.innerHTML = TRADE_RULES.map((rule) =>
      renderChip(rule.id, rule.name, campaign.trade === rule.id, rule.blurb),
    ).join('');
  }
  const unlocked = campaign.unlockedStage || 1;
  if (!isRivalUnlocked(bossById(campaign.rival), unlocked)) {
    campaign.rival = [...BOSSES].filter((b) => isRivalUnlocked(b, unlocked)).pop()?.id || 'vesper';
  }
  if (els.rivalRow) {
    els.rivalRow.innerHTML = BOSSES.map((boss) =>
      renderChip(
        boss.id,
        `${boss.stage} · ${boss.short || boss.name}`,
        campaign.rival === boss.id,
        isRivalUnlocked(boss, unlocked)
          ? boss.blurb
          : `Win Stage ${boss.stage - 1} to unlock ${boss.name}.`,
        { locked: !isRivalUnlocked(boss, unlocked) },
      ),
    ).join('');
  }
  const boss = bossById(campaign.rival);
  if (els.bossUltimates) els.bossUltimates.innerHTML = renderUltimateStrip(boss, campaign.claimedUltimates);
  const n = campaign.player.length;
  const ults = campaign.claimedUltimates.length;
  if (els.collectionLine) {
    const you = campaign.identityId ? cardById(campaign.identityId) : null;
    const youBit = you ? ` · You are <strong>${you.name}</strong>` : '';
    els.collectionLine.innerHTML =
      n === 0
        ? `Album empty. <button type="button" class="text-btn" id="rebuild-album">Rebuild starter album</button>`
        : `<button type="button" class="text-btn" id="open-album-line">Album · <strong>${albumProgress(campaign).owned}</strong>/${albumProgress(campaign).total}</button> unique · ${n} cop${n === 1 ? 'y' : 'ies'} · ${ults} ultimate${ults === 1 ? '' : 's'} · Stage <strong>${unlocked}</strong>/${STAGE_COUNT}${youBit}`;
  }
  if (els.start) {
    if (n === 0) els.start.textContent = 'Rebuild Album';
    else if (mustDeathMatch(n)) els.start.textContent = 'Death Match';
    else els.start.textContent = 'New Match';
  }
  els.deathWarn?.classList.toggle('hidden', !mustDeathMatch(n));
  els.deathBtn?.classList.toggle('hidden', n <= 1);
  if (els.stakesRow) {
    els.stakesRow.innerHTML = renderChip(
      'offer-death',
      'Offer Death Match after duel',
      Boolean(campaign.offerDeathMatch),
      'Optional. After a 3×3 win, Move On still claims the table trade unless you click Death Match.',
    );
  }
}

function openTitle() {
  els.album?.classList.add('hidden');
  els.claim?.classList.add('hidden');
  els.death?.classList.add('hidden');
  els.result.classList.add('hidden');
  els.again.classList.add('hidden');
  els.wheel.classList.add('hidden');
  match = null;
  session = null;
  claimState = null;
  deathState = null;
  if (!campaign.identityId) {
    els.title.classList.add('hidden');
    openIdentity();
    return;
  }
  els.identity?.classList.add('hidden');
  els.title.classList.remove('hidden');
  renderSetup();
  render();
}

function beginDuel() {
  const rng = mulberry32((Math.random() * 2 ** 31) | 0);
  const boss = bossById(campaign.rival);
  campaign.loadout = sanitizeLoadout(campaign);
  const playerHydrated = campaign.player.map(hydrateOwned).filter(Boolean);
  const chosen = campaign.loadout
    .map((uid) => playerHydrated.find((c) => c.uid === uid))
    .filter(Boolean);
  const playable = chosen.length >= LOADOUT_SIZE
    ? chosen.slice(0, LOADOUT_SIZE)
    : pickWager(playerHydrated, LOADOUT_SIZE, rng);
  const playerWager = tradableCards(playable);
  const aiTemplates = buildBossDeck(boss, rng);
  const aiWager = aiTemplates.map((t) => ({ ...t, uid: t.uid || `ai-${t.id}-${Math.random().toString(36).slice(2, 6)}` }));
  const vault = buildAiVault(aiWager, 2, rng, boss).map(hydrateOwned).filter(Boolean);

  session = {
    boss,
    trade: campaign.trade,
    playerWager,
    aiWager,
    aiVault: vault,
    playerCollectionSize: campaign.player.length,
  };

  match = createMatch({
    playerTemplates: playable,
    aiTemplates: aiWager,
    tradeRule: campaign.trade,
    rivalId: boss.id,
  });
  selected = null;
  busy = false;
  lastPlaced = null;
  captureCells = new Set();
  clashFlashes = new Map();
  els.title.classList.add('hidden');
  els.claim?.classList.add('hidden');
  els.death?.classList.add('hidden');
  els.result.classList.add('hidden');
  els.wheel.classList.remove('hidden');
  if (!els.wheel.dataset.ready) {
    els.wheel.innerHTML = renderElementWheel();
    els.wheel.dataset.ready = '1';
  }
  els.log.textContent = `${boss.name} accepts the ${campaign.trade} trade. Hands drawn.`;
  render();
}

function renderAlbum() {
  campaign.loadout = pruneLoadout(campaign);
  const progress = albumProgress(campaign);
  const you = identityUid(campaign);
  const candidates = switchCandidates(campaign);
  const news = campaign.lastClaimedIds || [];
  const switching = Number.isInteger(pendingSlotIndex);
  const switchingUid = switching ? campaign.loadout[pendingSlotIndex] : null;
  const switchingYou = Boolean(switchingUid && switchingUid === you);
  const hasNew = news.some((id) => candidates.some((c) => c.id === id));
  if (els.albumProgress) {
    els.albumProgress.textContent = `${progress.owned} / ${progress.total} unique`;
  }
  if (els.albumLede) {
    els.albumLede.textContent = hasNew
      ? 'New card — tap it, then tap a slot in Your five to equip. Identity stays pinned.'
      : 'Tap a spare card, then a slot — or tap a slot, then a spare. Identity stays pinned as You.';
  }
  if (els.loadoutHint) {
    if (switchingYou) els.loadoutHint.textContent = 'Identity stays pinned. Tap another slot to switch it.';
    else if (switching) els.loadoutHint.textContent = 'Tap a spare under Switch with these, or drag one onto this slot.';
    else if (pendingSwapId) els.loadoutHint.textContent = 'Now tap a slot in Your five.';
    else if (hasNew) els.loadoutHint.textContent = 'New card — tap it, then tap a slot to equip.';
    else els.loadoutHint.textContent = 'Tap a spare, then a slot — or a slot, then a spare.';
  }
  if (els.switchHint) {
    if (switchingYou) els.switchHint.textContent = 'Your identity cannot be replaced. Spare cards stay listed below.';
    else if (!candidates.length) els.switchHint.textContent = 'No spare cards. Win trades to grow the album.';
    else if (hasNew) els.switchHint.textContent = 'Newest claims sit first. Tap one, then tap a slot.';
    else els.switchHint.textContent = 'Owned cards not already in the five, strongest / newest first.';
  }
  if (els.switchPanel) {
    els.switchPanel.classList.toggle('is-idle', !candidates.length);
    els.switchPanel.classList.toggle('is-open', candidates.length > 0);
  }
  if (els.switchGrid) {
    els.switchGrid.innerHTML = renderSwitchGrid(candidates, pendingSwapId, news);
  }
  if (els.albumGrid) els.albumGrid.innerHTML = renderAlbumGrid(campaign, campaign.loadout, pendingSwapId, news);
  if (els.albumBrowse) els.albumBrowse.classList.toggle('collapsed', !browseAllOpen);
  if (els.browseAllBtn) els.browseAllBtn.textContent = browseAllOpen ? 'Hide album' : 'Browse all';
  if (els.loadoutRow) {
    const hydrated = campaign.player.map(hydrateOwned).filter(Boolean);
    const filled = campaign.loadout.map((uid, index) => {
      const card = hydrated.find((c) => c.uid === uid);
      if (!card) return '';
      const pinned = uid === you ? ' pinned' : '';
      const chosen = pendingSlotIndex === index ? ' switching' : '';
      const caption = uid === you ? 'Pinned You' : pendingSlotIndex === index ? 'Switching' : 'Tap to switch';
      return `<div role="button" tabindex="0" class="loadout-slot filled${pinned}${chosen}" data-uid="${card.uid}" data-index="${index}" draggable="false">${renderCard(card, { surface: `ld-${uid}`, owner: 'player', showName: true })}<span class="slot-caption">${caption}</span></div>`;
    });
    while (filled.length < LOADOUT_SIZE) {
      const index = filled.length;
      const chosen = pendingSlotIndex === index ? ' switching' : '';
      filled.push(`<div role="button" tabindex="0" class="loadout-slot empty${chosen}" data-index="${index}"><span class="slot-caption">${pendingSlotIndex === index ? 'Fill this slot' : 'Empty'}</span></div>`);
    }
    els.loadoutRow.innerHTML = filled.join('');
  }
  if (els.albumConfirm) {
    els.albumConfirm.disabled = campaign.loadout.length !== LOADOUT_SIZE;
    els.albumConfirm.textContent = albumIntent === 'duel' ? 'Duel with these five' : 'Use these five';
  }
}

function openAlbum(intent = 'browse') {
  albumIntent = intent;
  pendingSlotIndex = null;
  const news = campaign.lastClaimedIds || [];
  const firstNew = switchCandidates(campaign).find((c) => news.includes(c.id));
  pendingSwapId = intent === 'equip' && firstNew ? firstNew.id : null;
  browseAllOpen = false;
  els.album?.classList.remove('hidden');
  renderAlbum();
}

function closeAlbum() {
  const returnToTitle = albumIntent === 'equip' && els.title?.classList.contains('hidden');
  pendingSwapId = null;
  pendingSlotIndex = null;
  browseAllOpen = false;
  cleanupDeckDrag();
  els.album?.classList.add('hidden');
  if (returnToTitle) openTitle();
}

function confirmAlbum() {
  campaign.loadout = pruneLoadout(campaign);
  if (campaign.loadout.length !== LOADOUT_SIZE) return;
  persist();
  closeAlbum();
  if (albumIntent === 'duel') beginDuel();
}

function toggleLoadoutCard(id) {
  const copies = campaign.player.filter((c) => c.id === id);
  if (!copies.length) return;
  campaign.loadout = pruneLoadout(campaign);
  const used = new Set(campaign.loadout);
  const free = copies.find((c) => !used.has(c.uid));
  if (free && campaign.loadout.length < LOADOUT_SIZE) {
    campaign.loadout = [...campaign.loadout, free.uid];
    pendingSwapId = null;
    persist();
    renderAlbum();
    return;
  }
  pendingSwapId = pendingSwapId === id ? null : id;
  renderAlbum();
}

function applyCardToSlot(cardId, slotIndex) {
  campaign = dragAlbumToSlot(campaign, cardId, slotIndex);
  pendingSwapId = null;
  pendingSlotIndex = null;
  persist();
  renderAlbum();
}

function pickSwitchCard(id) {
  if (!id) return;
  const you = identityUid(campaign);
  if (Number.isInteger(pendingSlotIndex) && campaign.loadout[pendingSlotIndex] !== you) {
    applyCardToSlot(id, pendingSlotIndex);
    return;
  }
  toggleLoadoutCard(id);
}

function clearDeckDropMarks() {
  document.querySelectorAll('.drop-ok, .drop-block').forEach((el) => {
    el.classList.remove('drop-ok', 'drop-block');
  });
}

function cleanupDeckDrag() {
  deckDrag?.ghost?.remove();
  deckDrag?.originEl?.classList.remove('is-dragging');
  document.body.classList.remove('deck-dragging', 'deck-pending');
  clearDeckDropMarks();
  deckDrag = null;
}

function dropTargetAt(x, y) {
  const ghost = deckDrag?.ghost;
  if (ghost) ghost.style.pointerEvents = 'none';
  const el = document.elementFromPoint(x, y);
  return {
    slot: el?.closest?.('.loadout-slot') || null,
    tile: el?.closest?.('.album-tile.owned') || null,
    grid: el?.closest?.('#album-grid, #switch-grid') || null,
    row: el?.closest?.('#loadout-row') || null,
  };
}

function markDeckDrop(x, y) {
  clearDeckDropMarks();
  if (!deckDrag || deckDrag.phase !== 'dragging') return;
  const hit = dropTargetAt(x, y);
  if (hit.slot) {
    const replacingYou = hit.slot.classList.contains('pinned') && deckDrag.payload.source === 'album';
    const sameSlot = deckDrag.payload.source === 'loadout' && hit.slot.dataset.uid === deckDrag.payload.uid;
    hit.slot.classList.add(replacingYou && !sameSlot ? 'drop-block' : 'drop-ok');
    return;
  }
  if (deckDrag.payload.source === 'album' && hit.row) {
    hit.row.classList.add('drop-ok');
    return;
  }
  if (deckDrag.payload.source !== 'loadout') return;
  if (hit.tile) {
    hit.tile.classList.add(hit.tile.classList.contains('pinned') ? 'drop-block' : 'drop-ok');
    return;
  }
  if (!hit.row) {
    (hit.grid || els.album)?.classList.add('drop-ok');
  }
}

function beginDeckDrag(event) {
  if (!deckDrag || deckDrag.phase !== 'pending') return;
  deckDrag.phase = 'dragging';
  hideCardZoom();
  document.body.classList.add('deck-dragging');
  const ghost = document.createElement('div');
  ghost.className = 'deck-drag-ghost';
  const cardEl = deckDrag.originEl.querySelector('.tm-card');
  ghost.innerHTML = cardEl ? cardEl.outerHTML : '';
  document.body.appendChild(ghost);
  deckDrag.ghost = ghost;
  deckDrag.originEl.classList.add('is-dragging');
  try {
    deckDrag.originEl.setPointerCapture(event.pointerId);
  } catch {
    /* capture is optional */
  }
}

function sameDeckPointer(event) {
  if (!deckDrag) return false;
  if (event.pointerId == null) return true;
  return event.pointerId === deckDrag.pointerId;
}

function onDeckPointerMove(event) {
  if (!sameDeckPointer(event)) return;
  const dx = event.clientX - deckDrag.origin.x;
  const dy = event.clientY - deckDrag.origin.y;
  if (deckDrag.phase === 'pending' && Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
    beginDeckDrag(event);
  }
  if (deckDrag?.phase !== 'dragging') return;
  event.preventDefault();
  if (deckDrag.ghost) {
    deckDrag.ghost.style.transform = `translate(${event.clientX - 40}px, ${event.clientY - 56}px)`;
  }
  markDeckDrop(event.clientX, event.clientY);
}

function commitDeckDrop(payload, x, y) {
  const hit = dropTargetAt(x, y);
  let next = campaign;
  if (hit.slot) {
    const index = Number(hit.slot.dataset.index);
    if (payload.source === 'album') next = dragAlbumToSlot(campaign, payload.id, index);
    else if (payload.source === 'loadout') next = moveLoadoutIndex(campaign, payload.index, index);
  } else if (payload.source === 'album' && hit.row) {
    next = dragAlbumToSlot(campaign, payload.id, pruneLoadout(campaign).length);
  } else if (payload.source === 'loadout' && hit.tile) {
    next = swapLoadoutWithAlbum(campaign, payload.uid, hit.tile.dataset.id);
  } else if (payload.source === 'loadout' && !hit.row) {
    next = removeLoadoutUid(campaign, payload.uid);
  } else {
    return;
  }
  if (next === campaign && next.loadout === campaign.loadout) return;
  campaign = next;
  persist();
  renderAlbum();
}

function onDeckPointerUp(event) {
  if (!sameDeckPointer(event)) return;
  const wasDragging = deckDrag.phase === 'dragging';
  const payload = deckDrag.payload;
  const x = event.clientX;
  const y = event.clientY;
  cleanupDeckDrag();
  if (!wasDragging) return;
  skipAlbumClick = true;
  event.preventDefault();
  event.stopPropagation();
  commitDeckDrop(payload, x, y);
  window.setTimeout(() => {
    skipAlbumClick = false;
  }, 50);
}

function onAlbumPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  if (event.target.closest('button.seal-btn, button.text-btn, #album-confirm, #album-close, #browse-all-btn')) return;
  hideCardZoom();
  const slot = event.target.closest('.loadout-slot.filled');
  const tile = event.target.closest('.album-tile.owned');
  const originEl = slot || tile;
  if (!originEl) return;
  deckDrag = {
    phase: 'pending',
    pointerId: event.pointerId ?? 1,
    origin: { x: event.clientX, y: event.clientY },
    originEl,
    payload: slot
      ? { source: 'loadout', uid: slot.dataset.uid, index: Number(slot.dataset.index) }
      : { source: 'album', id: tile.dataset.id },
    ghost: null,
  };
  document.body.classList.add('deck-pending');
  try {
    originEl.setPointerCapture(event.pointerId);
  } catch {
    /* capture is optional */
  }
}

function renderIdentitySelect() {
  if (els.identityGrid) els.identityGrid.innerHTML = renderIdentityGrid(pendingIdentity);
  if (els.identityConfirm) els.identityConfirm.disabled = !pendingIdentity;
}

function openIdentity() {
  pendingIdentity = campaign.identityId || DEFAULT_IDENTITY_ID;
  els.identity?.classList.remove('hidden');
  renderIdentitySelect();
}

function confirmIdentity() {
  if (!pendingIdentity) return;
  campaign = bindIdentity(campaign, pendingIdentity);
  persist();
  els.identity?.classList.add('hidden');
  openTitle();
}

function startMatch() {
  if (!campaign.identityId) {
    openIdentity();
    return;
  }
  if (campaign.player.length === 0) {
    campaign = resetCampaign(campaign);
    persist();
    els.log.textContent = 'A fresh starter album is bound.';
    return;
  }
  if (mustDeathMatch(campaign.player.length)) {
    openDeathMatch({ fromTitle: true });
    return;
  }
  campaign.loadout = sanitizeLoadout(campaign);
  openAlbum('duel');
}

function hideCardZoom() {
  zoomSource = null;
  if (!els.zoom) return;
  els.zoom.classList.add('hidden');
  els.zoom.innerHTML = '';
}

function placeCardZoom(cardEl, onBoard = false) {
  if (!els.zoom || !cardEl) return;
  const r = cardEl.getBoundingClientRect();
  const w = onBoard ? 256 : 220;
  const h = onBoard ? 358 : 308;
  els.zoom.style.width = `${w}px`;
  els.zoom.style.height = `${h}px`;
  let left;
  let top;
  const sideRoom = window.innerWidth - r.right > w + 16;
  const leftRoom = r.left > w + 16;
  if (onBoard && sideRoom) {
    left = r.right + 16;
    top = r.top + r.height / 2 - h / 2;
  } else if (onBoard && leftRoom) {
    left = r.left - w - 16;
    top = r.top + r.height / 2 - h / 2;
  } else if (r.bottom > window.innerHeight * 0.62) {
    left = r.left + r.width / 2 - w / 2;
    top = r.top - h - 14;
  } else if (sideRoom) {
    left = r.right + 14;
    top = r.top + r.height / 2 - h / 2;
  } else {
    left = r.left - w - 14;
    top = r.top + r.height / 2 - h / 2;
  }
  left = Math.min(Math.max(12, left), window.innerWidth - w - 12);
  top = Math.min(Math.max(12, top), window.innerHeight - h - 12);
  els.zoom.style.left = `${left}px`;
  els.zoom.style.top = `${top}px`;
}

function showCardZoom(cardEl) {
  if (!els.zoom || !cardEl || cardEl.classList.contains('face-down')) return;
  if (cardEl.closest('.card-zoom') || document.body.classList.contains('deck-dragging')) return;
  if (document.body.classList.contains('deck-pending')) return;
  if (cardEl.closest('#album-overlay')) return;
  zoomSource = cardEl;
  const onBoard = Boolean(cardEl.closest('.board .cell'));
  els.zoom.classList.toggle('on-board', onBoard);
  els.zoom.innerHTML = cardEl.outerHTML;
  const preview = els.zoom.querySelector('.tm-card');
  preview?.classList.remove('selected', 'just-placed', 'just-captured');
  els.zoom.classList.remove('hidden');
  placeCardZoom(cardEl, onBoard);
}

function render() {
  const keepInstance = zoomSource?.dataset?.instance;
  hideCardZoom();
  if (!match) {
    els.board.innerHTML = '';
    els.playerRail.innerHTML = '';
    els.aiRail.innerHTML = '';
    return;
  }

  const s = scores(match);
  els.scoreAi.textContent = String(s.ai);
  els.scorePlayer.textContent = String(s.player);

  els.board.innerHTML = match.board
    .map((card, i) => {
      const open = !card && match.phase === 'player' && selected != null && !busy;
      const classes = ['cell', open ? 'open' : '', card ? 'filled' : '', !open && !card ? 'blocked' : '']
        .filter(Boolean)
        .join(' ');
      const flash = clashFlashes.get(i) || '';
      const body = card
        ? renderCard(card, {
            surface: `b${i}`,
            captured: captureCells.has(i),
            placed: lastPlaced === i,
          })
        : '';
      return `<div class="${classes}" data-cell="${i}">${body}${flash}</div>`;
    })
    .join('');

  els.playerRail.innerHTML = match.player.hand
    .map((card, i) =>
      renderCard(card, {
        surface: `h${i}`,
        selected: selected === i,
        showName: true,
      }),
    )
    .join('');

  els.aiRail.innerHTML = match.ai.hand.map((_, i) => renderCardBack(i)).join('');

  if (match.phase === 'ended' && match.ai.hand.length) {
    els.side.innerHTML = match.ai.hand
      .map((card) => renderCard(card, { surface: 'side', showName: false }))
      .join('');
  } else if (match.phase === 'ended' && match.player.hand.length) {
    els.side.innerHTML = match.player.hand
      .map((card) => renderCard(card, { surface: 'side', showName: false }))
      .join('');
  } else {
    els.side.innerHTML = '';
  }

  els.pip.classList.toggle('ai-turn', match.phase === 'ai');

  if (match.phase === 'player') {
    els.status.textContent = selected == null
      ? 'Your turn — choose a champion from your hand.'
      : 'Place it on an empty square.';
    els.hint.textContent = selected == null
      ? ''
      : `${match.player.hand[selected].name} · Lv.${match.player.hand[selected].level} · ${match.player.hand[selected].title}`;
  } else if (match.phase === 'ai') {
    els.status.textContent = `${rivalName()} studies the grid…`;
    els.hint.textContent = '';
  } else if (match.phase === 'ended') {
    const result = match.winner === 'player' ? 'Victory' : match.winner === 'ai' ? 'Defeat' : 'Draw';
    els.status.textContent = `${result}. Blue ${s.player} — Pink ${s.ai}.`;
    els.hint.textContent = match.winner === 'draw'
      ? 'No trade on a draw. Move On to return.'
      : 'Move On to claim the table trade.';
  }

  if (match.phase === 'ended') showResult();
  else els.result.classList.add('hidden');
  els.again.classList.toggle('hidden', match.phase !== 'ended');
  if (match.phase === 'ended') els.again.textContent = match.winner === 'draw' ? 'Move On' : 'Collect';
  if (keepInstance) {
    const again = document.querySelector(`.tm-card[data-instance="${keepInstance}"]:not(.face-down)`);
    if (again) showCardZoom(again);
  }
}

function showResult() {
  els.result.classList.remove('hidden');
  els.banner.classList.remove('lose', 'draw');
  if (match.winner === 'player') {
    els.banner.innerHTML = `<span class="you">You</span> <span class="win">Win!</span>`;
  } else if (match.winner === 'ai') {
    els.banner.classList.add('lose');
    els.banner.innerHTML = `<span class="you">You</span> <span class="win">Lose!</span>`;
  } else {
    els.banner.classList.add('draw');
    els.banner.innerHTML = `<span class="you">Draw</span> <span class="win">Game</span>`;
  }
}

function describeEvents(events) {
  if (!events?.length) return '';
  const bits = [];
  for (const ev of events) {
    if (ev.type === 'battle') {
      const extras = [];
      if (ev.elementMod) extras.push(`element ${ev.elementMod > 0 ? '+' : ''}${ev.elementMod}`);
      bits.push(ev.summary + (extras.length ? ` (${extras.join(', ')})` : ''));
    } else if (ev.type === 'capture') {
      bits.push(`${ev.name} flips.`);
    } else if (ev.type === 'combo') {
      bits.push(`Combo! ${ev.name} is swept.`);
    } else if (ev.type === 'counter') {
      bits.push(`${ev.name} falls to a counter.`);
    }
  }
  return bits.join(' ');
}

function afterPlace(events, who) {
  captureCells = new Set(
    events.filter((e) => e.type === 'capture' || e.type === 'combo' || e.type === 'counter').map((e) => e.cell),
  );
  lastPlaced = events.find((e) => e.type === 'place')?.cell ?? null;
  clashFlashes = new Map();
  for (const ev of events) {
    if (ev.type !== 'battle') continue;
    const html = clashFlashHtml(ev);
    if (!html) continue;
    clashFlashes.set(ev.defenderCell, html);
    if (ev.defenderWins) clashFlashes.set(ev.attackerCell, html);
  }
  els.log.textContent = describeEvents(events) || `${who === 'player' ? 'You' : rivalName()} placed a card.`;
  if (events.some((e) => e.type === 'counter')) sfx('counter');
  else if (events.some((e) => e.type === 'capture' || e.type === 'combo')) sfx('capture');
  else sfx('place');
  render();
  window.setTimeout(() => {
    captureCells = new Set();
    lastPlaced = null;
    render();
    if (match.phase === 'ended') {
      sfx(match.winner === 'player' ? 'win' : match.winner === 'ai' ? 'lose' : 'place');
      busy = false;
      window.setTimeout(openClaim, 720);
    } else if (match.phase === 'ai' && who === 'player') {
      window.setTimeout(aiTurn, 700);
    } else if (match.phase === 'player' && who === 'ai') {
      busy = false;
    } else if (match.phase === 'ai') {
      window.setTimeout(aiTurn, 500);
    } else {
      busy = false;
    }
  }, 560);
}

function aiTurn() {
  if (!match || match.phase !== 'ai') {
    busy = false;
    return;
  }
  if (!match.ai.hand.length) {
    busy = false;
    render();
    return;
  }
  const move = chooseAiMove(match);
  const result = placeCard(match, 'ai', move.handIndex, move.cellIndex);
  if (!result.ok) {
    busy = false;
    render();
    return;
  }
  afterPlace(result.events, 'ai');
}

function openClaim() {
  if (!session || !match || match.phase !== 'ended') {
    openTitle();
    return;
  }
  const s = scores(match);
  const boss = session.boss;
  const rule = session.trade;
  if (match.winner === 'draw') {
    claimState = { mode: 'draw', need: 0, selected: [], pool: [], locked: true };
    els.claimTitle.textContent = 'Draw Game';
    els.claimLede.textContent = 'Neither album moves on a draw. Move On to return to the table.';
    els.claimGrid.innerHTML = '';
    els.claimNote.textContent = '';
    els.claimConfirm.textContent = 'Move On';
    if (els.claimUltimates) els.claimUltimates.innerHTML = '';
    els.deathOptin.classList.add('hidden');
    els.claim.classList.remove('hidden');
    return;
  }

  const playerWon = match.winner === 'player';
  const ruleName = TRADE_RULES.find((r) => r.id === rule)?.name || 'One';
  const pool = playerWon
    ? preferUltimates(session.aiWager, boss.ultimates)
    : tradableCards(session.playerWager);
  const need = tradeTakeCount(rule, pool.length, s.player - s.ai);
  const auto = playerWon ? pool.slice(0, need) : autoPickHighest(pool, need);
  claimState = {
    mode: playerWon ? 'win' : 'lose',
    need,
    selected: auto.map((c) => c.uid),
    pool,
    locked: !playerWon || rule === 'all',
    rule,
  };
  els.claimTitle.textContent = playerWon ? `Claim — ${ruleName}` : `${boss.name} claims`;
  const hasUltimates = Boolean(boss.ultimates?.length);
  els.claimLede.textContent = playerWon
    ? rule === 'all'
      ? `All: you take ${boss.name}’s entire wagered set${hasUltimates ? ', ultimates included' : ''}.`
      : hasUltimates
        ? `${ruleName}: ${boss.name}’s signature ultimates sit first. Choose ${need} — click to change, then Move On.`
        : `${ruleName}: choose ${need} card${need === 1 ? '' : 's'} from ${boss.name}. Highlighted cards are selected — click to change.`
    : `You lost the ${ruleName} trade. ${boss.name} takes ${need} card${need === 1 ? '' : 's'}.`;
  if (els.claimUltimates) {
    els.claimUltimates.innerHTML = playerWon && hasUltimates
      ? renderUltimateStrip(boss, campaign.claimedUltimates)
      : '';
  }
  renderClaimGrid();
  els.claimConfirm.textContent = 'Move On';
  const offerDeath = shouldOfferDeathMatch({
    albumCount: campaign.player.length,
    optedIn: campaign.offerDeathMatch,
  });
  els.deathOptin.classList.toggle('hidden', !offerDeath);
  els.deathOptin.textContent = mustDeathMatch(campaign.player.length) ? 'Death Match' : 'Death Match (opt in)';
  els.claim.classList.remove('hidden');
}

function renderClaimGrid() {
  if (!claimState) return;
  const selected = new Set(claimState.selected);
  els.claimGrid.innerHTML = tradableCards(claimState.pool)
    .map((card, i) =>
      renderClaimCard(
        { ...card, owner: claimState.mode === 'win' ? 'ai' : 'player', instanceId: card.uid || i },
        {
          surface: `cl${i}`,
          selected: selected.has(card.uid),
          locked: claimState.locked,
          ultimate: isUltimateId(card.id, session?.boss),
        },
      ),
    )
    .join('');
  const have = claimState.selected.length;
  els.claimNote.textContent = claimState.locked
    ? `${have} card${have === 1 ? '' : 's'} will move.`
    : `Selected ${have} / ${claimState.need}.`;
}

function confirmClaim() {
  if (!claimState || !session) {
    openTitle();
    return;
  }
  if (claimState.mode === 'draw') {
    openTitle();
    return;
  }
  if (!claimState.locked && claimState.selected.length !== claimState.need) {
    els.claimNote.textContent = `Select exactly ${claimState.need}.`;
    return;
  }
  const chosen = tradableCards(claimState.pool).filter((c) => claimState.selected.includes(c.uid));
  if (claimState.mode === 'win') {
    campaign = applyWin(campaign, chosen, session.boss);
    persist();
    els.claim?.classList.add('hidden');
    els.result?.classList.add('hidden');
    match = null;
    session = null;
    claimState = null;
    openAlbum('equip');
    return;
  }
  campaign = applyLoss(campaign, chosen.map((c) => c.uid));
  persist();
  openTitle();
}

function openDeathMatch(opts = {}) {
  const rng = mulberry32((Math.random() * 2 ** 31) | 0);
  if (!session) session = makeDeathSession(campaign, rng);
  const boss = session.boss || bossById(campaign.rival);
  const playerPool = tradableCards(session.playerWager);
  const aiPool = [...session.aiWager, ...(session.aiVault || [])].filter(Boolean);
  const playerCard = playerPool[Math.floor(rng() * playerPool.length)] || tradableCards(campaign.player.map(hydrateOwned))[0];
  const aiCard = aiPool[Math.floor(rng() * aiPool.length)];
  const rule = session.trade || campaign.trade;
  const collectionCount = campaign.player.length;
  const aiCollection = session.aiWager.length + (session.aiVault?.length || 0);
  deathState = {
    fromTitle: Boolean(opts.fromTitle),
    boss,
    rule,
    playerCard,
    aiCard,
    rng,
    resolved: null,
    take: deathTakeCount(rule, session.aiWager.length, aiCollection),
    loseTake: deathTakeCount(rule, session.playerWager.length, collectionCount),
  };
  const ruleName = TRADE_RULES.find((r) => r.id === rule)?.name || 'One';
  els.claim?.classList.add('hidden');
  els.title.classList.add('hidden');
  els.deathLede.textContent = mustDeathMatch(collectionCount)
    ? `Last card. Each side pulls one at random. Death stakes: you risk ${deathState.loseTake}, ${boss.name} risks ${deathState.take} (${ruleName} +2).`
    : `Each side pulls one card at random. Loser pays Death stakes — ${ruleName} plus two extra (you risk ${deathState.loseTake}, ${boss.name} risks ${deathState.take}).`;
  els.deathDuel.innerHTML = `<div class="death-backs">${renderCardBack('dm-p', { owner: 'none' })}${renderCardBack('dm-a', { owner: 'none' })}</div>`;
  els.deathNote.textContent = 'Pull to reveal the clash.';
  els.deathGo.classList.remove('hidden');
  els.deathDone.classList.add('hidden');
  els.death.classList.remove('hidden');
}

function runDeathMatch() {
  if (!deathState || deathState.resolved) return;
  const result = resolveShowdown(deathState.playerCard, deathState.aiCard, deathState.rng);
  deathState.resolved = result;
  const p = deathState.playerCard;
  const a = deathState.aiCard;
  els.deathDuel.innerHTML = `
    <div class="death-faces">
      ${renderCard({ ...p, owner: 'player', instanceId: 'dmp' }, { surface: 'dmp' })}
      <span class="death-vs">vs</span>
      ${renderCard({ ...a, owner: 'ai', instanceId: 'dma' }, { surface: 'dma' })}
    </div>`;
  if (result.winner === 'player') {
    els.deathNote.textContent = `You seize the Death Match. ${deathState.boss.name} pays ${deathState.take} cards.`;
    sfx('win');
  } else if (result.winner === 'ai') {
    els.deathNote.textContent = `${deathState.boss.name} seizes it. You pay ${deathState.loseTake} cards.`;
    sfx('lose');
  } else {
    els.deathNote.textContent = 'The pull ties. Albums stay.';
  }
  els.deathGo.classList.add('hidden');
  els.deathDone.classList.remove('hidden');
}

function finishDeathMatch() {
  if (!deathState?.resolved) {
    els.death.classList.add('hidden');
    openTitle();
    return;
  }
  const { winner } = deathState.resolved;
  const boss = deathState.boss;
  if (winner === 'player') {
    const pool = preferUltimates(
      [...(session?.aiWager || []), ...(session?.aiVault || [])],
      boss.ultimates,
    );
    const claimed = autoPickHighest(pool.length ? pool : [deathState.aiCard], deathState.take);
    campaign = applyWin(campaign, claimed, boss);
    persist();
    els.death.classList.add('hidden');
    deathState = null;
    session = null;
    match = null;
    openAlbum('equip');
    return;
  } else if (winner === 'ai') {
    const pool = tradableCards(session?.playerWager?.length ? session.playerWager : campaign.player.map(hydrateOwned));
    const taken = autoPickHighest(pool, deathState.loseTake);
    campaign = applyLoss(campaign, taken.map((c) => c.uid));
  }
  persist();
  els.death.classList.add('hidden');
  openTitle();
}

els.playerRail.addEventListener('click', (event) => {
  if (!match || busy || match.phase !== 'player') return;
  const card = event.target.closest('.tm-card');
  if (!card) return;
  const index = [...els.playerRail.querySelectorAll('.tm-card')].indexOf(card);
  if (index < 0) return;
  selected = index;
  render();
});

els.board.addEventListener('click', (event) => {
  if (!match || busy || match.phase !== 'player' || selected == null) return;
  const cell = event.target.closest('[data-cell]');
  if (!cell) return;
  const cellIndex = Number(cell.dataset.cell);
  const result = placeCard(match, 'player', selected, cellIndex);
  if (!result.ok) return;
  selected = null;
  busy = true;
  afterPlace(result.events, 'player');
});

els.start.addEventListener('click', startMatch);
els.newBtn.addEventListener('click', () => {
  if (match?.phase === 'ended') openClaim();
  else startMatch();
});
els.again.addEventListener('click', () => {
  if (match?.phase === 'ended') openClaim();
  else startMatch();
});
els.helpBtn.addEventListener('click', () => els.help.classList.remove('hidden'));
els.titleHelp.addEventListener('click', () => els.help.classList.remove('hidden'));
els.closeHelp.addEventListener('click', () => els.help.classList.add('hidden'));
els.help.addEventListener('click', (event) => {
  if (event.target === els.help) els.help.classList.add('hidden');
});

els.tradeRow?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-id]');
  if (!btn) return;
  campaign.trade = btn.dataset.id;
  persist();
});

els.rivalRow?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-id]');
  if (!btn || btn.disabled || btn.classList.contains('locked')) return;
  campaign.rival = btn.dataset.id;
  persist();
});

els.stakesRow?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-id]');
  if (!btn) return;
  campaign.offerDeathMatch = !campaign.offerDeathMatch;
  persist();
});

els.collectionLine?.addEventListener('click', (event) => {
  if (event.target.id === 'rebuild-album') {
    campaign = resetCampaign(campaign);
    persist();
    return;
  }
  if (event.target.closest('#open-album-line')) openAlbum('browse');
});

els.claimGrid?.addEventListener('click', (event) => {
  if (!claimState || claimState.locked) return;
  const pick = event.target.closest('.claim-pick');
  if (!pick) return;
  const uid = pick.dataset.uid;
  const set = new Set(claimState.selected);
  if (set.has(uid)) set.delete(uid);
  else {
    if (set.size >= claimState.need) return;
    set.add(uid);
  }
  claimState.selected = [...set];
  renderClaimGrid();
});

document.addEventListener('pointerdown', hideCardZoom, true);

document.addEventListener('pointerover', (event) => {
  const card = event.target.closest?.('.tm-card');
  if (!card || card.classList.contains('face-down') || card.closest('.card-zoom')) return;
  showCardZoom(card);
});
document.addEventListener('pointerout', (event) => {
  const card = event.target.closest?.('.tm-card');
  if (!card || card.closest('.card-zoom')) return;
  if (event.relatedTarget && card.contains(event.relatedTarget)) return;
  if (zoomSource === card) hideCardZoom();
});
window.addEventListener('scroll', hideCardZoom, true);

els.claimConfirm?.addEventListener('click', confirmClaim);
els.deathOptin?.addEventListener('click', () => openDeathMatch({ fromTitle: false }));
els.deathBtn?.addEventListener('click', () => openDeathMatch({ fromTitle: true }));
els.deathGo?.addEventListener('click', runDeathMatch);
els.deathDone?.addEventListener('click', finishDeathMatch);

els.albumBtn?.addEventListener('click', () => openAlbum('browse'));
els.albumClose?.addEventListener('click', closeAlbum);
els.albumConfirm?.addEventListener('click', confirmAlbum);
els.album?.addEventListener('pointerdown', onAlbumPointerDown);
els.album?.addEventListener('mousedown', (event) => {
  if (event.button !== 0) return;
  if (deckDrag) return;
  onAlbumPointerDown(event);
});
document.addEventListener('pointermove', onDeckPointerMove, { passive: false });
document.addEventListener('mousemove', (event) => {
  if (!deckDrag) return;
  onDeckPointerMove(event);
});
document.addEventListener('pointerup', onDeckPointerUp);
document.addEventListener('mouseup', (event) => {
  if (!deckDrag) return;
  onDeckPointerUp(event);
});
document.addEventListener('pointercancel', (event) => {
  if (deckDrag && event.pointerId === deckDrag.pointerId) cleanupDeckDrag();
});
els.album?.addEventListener('dragstart', (event) => {
  event.preventDefault();
});
els.albumGrid?.addEventListener('click', (event) => {
  if (skipAlbumClick) {
    skipAlbumClick = false;
    return;
  }
  const tile = event.target.closest('.album-tile.owned');
  if (!tile) return;
  pickSwitchCard(tile.dataset.id);
});
els.switchGrid?.addEventListener('click', (event) => {
  if (skipAlbumClick) {
    skipAlbumClick = false;
    return;
  }
  const tile = event.target.closest('.album-tile.owned');
  if (!tile) return;
  pickSwitchCard(tile.dataset.id);
});
els.loadoutRow?.addEventListener('click', (event) => {
  if (skipAlbumClick) {
    skipAlbumClick = false;
    return;
  }
  const slot = event.target.closest('.loadout-slot');
  if (!slot) return;
  const index = Number(slot.dataset.index);
  const you = identityUid(campaign);
  if (slot.dataset.uid && slot.dataset.uid === you) {
    pendingSlotIndex = null;
    renderAlbum();
    return;
  }
  if (pendingSwapId) {
    applyCardToSlot(pendingSwapId, Number.isInteger(index) ? index : 0);
    return;
  }
  pendingSlotIndex = pendingSlotIndex === index ? null : index;
  renderAlbum();
});
els.browseAllBtn?.addEventListener('click', () => {
  browseAllOpen = !browseAllOpen;
  renderAlbum();
});
els.identityBtn?.addEventListener('click', openIdentity);
els.identityConfirm?.addEventListener('click', confirmIdentity);
els.identityGrid?.addEventListener('click', (event) => {
  const pick = event.target.closest('.identity-pick');
  if (!pick) return;
  const already = pendingIdentity === pick.dataset.id;
  pendingIdentity = pick.dataset.id;
  renderIdentitySelect();
  if (already && event.detail >= 2) confirmIdentity();
});

if (els.titleDeck) {
  els.titleDeck.innerHTML = [0, 1, 2]
    .map((i) => renderCardBack(`title-${i}`, { owner: 'none' }))
    .join('');
}

if (campaign.identityId) {
  renderSetup();
} else {
  els.title.classList.add('hidden');
  openIdentity();
}
