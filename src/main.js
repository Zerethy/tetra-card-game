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
  applyWin,
  applyLoss,
  isUltimateId,
  resolveShowdown,
} from './campaign.js';

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
  claimNote: document.getElementById('claim-note'),
  claimConfirm: document.getElementById('claim-confirm'),
  deathOptin: document.getElementById('death-optin'),
  death: document.getElementById('death-overlay'),
  deathLede: document.getElementById('death-lede'),
  deathDuel: document.getElementById('death-duel'),
  deathNote: document.getElementById('death-note'),
  deathGo: document.getElementById('death-go'),
  deathDone: document.getElementById('death-done'),
};

let campaign = loadCampaign();
let match = null;
let selected = null;
let busy = false;
let lastPlaced = null;
let captureCells = new Set();
let clashFlashes = new Map();
let audioCtx = null;
let session = null;
let claimState = null;
let deathState = null;

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
  if (els.rivalRow) {
    els.rivalRow.innerHTML = BOSSES.map((boss) =>
      renderChip(boss.id, boss.name, campaign.rival === boss.id),
    ).join('');
  }
  const boss = bossById(campaign.rival);
  if (els.bossUltimates) els.bossUltimates.innerHTML = renderUltimateStrip(boss, campaign.claimedUltimates);
  const n = campaign.player.length;
  const ults = campaign.claimedUltimates.length;
  if (els.collectionLine) {
    els.collectionLine.innerHTML =
      n === 0
        ? `Album empty. <button type="button" class="text-btn" id="rebuild-album">Rebuild starter album</button>`
        : `Album · <strong>${n}</strong> card${n === 1 ? '' : 's'} · ${ults} ultimate${ults === 1 ? '' : 's'} claimed`;
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
  els.title.classList.remove('hidden');
  els.claim?.classList.add('hidden');
  els.death?.classList.add('hidden');
  els.result.classList.add('hidden');
  els.again.classList.add('hidden');
  els.wheel.classList.add('hidden');
  match = null;
  session = null;
  claimState = null;
  deathState = null;
  renderSetup();
  render();
}

function beginDuel() {
  const rng = mulberry32((Math.random() * 2 ** 31) | 0);
  const boss = bossById(campaign.rival);
  const playerHydrated = campaign.player.map(hydrateOwned).filter(Boolean);
  const playerWager = pickWager(playerHydrated, 8, rng);
  const aiTemplates = buildBossDeck(boss, rng);
  const aiWager = aiTemplates.map((t) => ({ ...t, uid: t.uid || `ai-${t.id}-${Math.random().toString(36).slice(2, 6)}` }));
  const vault = buildAiVault(aiWager, 2, rng).map(hydrateOwned).filter(Boolean);

  session = {
    boss,
    trade: campaign.trade,
    playerWager,
    aiWager,
    aiVault: vault,
    playerCollectionSize: campaign.player.length,
  };

  match = createMatch({
    playerTemplates: playerWager,
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

function startMatch() {
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
  beginDuel();
}

function render() {
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
      if (ev.typeMod) extras.push(`type ${ev.typeMod > 0 ? '+' : ''}${ev.typeMod}`);
      if (ev.elementMod) extras.push(`element ${ev.elementMod > 0 ? '+' : ''}${ev.elementMod}`);
      bits.push(
        `${ev.attackerName} ${ev.rawAtk ?? ev.atkStat} vs ${ev.defLabel} ${ev.rawDef ?? ev.defStat} — ${ev.attackerWins ? 'capture' : 'held'}` +
          (extras.length ? ` (${extras.join(', ')})` : ''),
      );
    } else if (ev.type === 'capture' && ev.kind === 'arrow') {
      bits.push(`${ev.name} had no answering arrow and flipped.`);
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
    if (html) clashFlashes.set(ev.defenderCell, html);
  }
  els.log.textContent = describeEvents(events) || `${who === 'player' ? 'You' : rivalName()} placed a card.`;
  if (events.some((e) => e.type === 'counter')) sfx('counter');
  else if (events.some((e) => e.type === 'capture' || e.type === 'combo')) sfx('capture');
  else sfx('place');
  render();
  window.setTimeout(() => {
    captureCells = new Set();
    lastPlaced = null;
    clashFlashes = new Map();
    if (match.phase === 'ended') {
      sfx(match.winner === 'player' ? 'win' : match.winner === 'ai' ? 'lose' : 'place');
      render();
      busy = false;
      window.setTimeout(openClaim, 720);
    } else if (match.phase === 'ai' && who === 'player') {
      window.setTimeout(aiTurn, 700);
    } else if (match.phase === 'player' && who === 'ai') {
      busy = false;
      render();
    } else if (match.phase === 'ai') {
      window.setTimeout(aiTurn, 500);
    } else {
      busy = false;
      render();
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
    els.deathOptin.classList.add('hidden');
    els.claim.classList.remove('hidden');
    return;
  }

  const playerWon = match.winner === 'player';
  const ruleName = TRADE_RULES.find((r) => r.id === rule)?.name || 'One';
  const pool = playerWon
    ? preferUltimates(session.aiWager, boss.ultimates)
    : session.playerWager.slice();
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
  els.claimLede.textContent = playerWon
    ? rule === 'all'
      ? `All: you take ${boss.name}’s entire wagered set.`
      : `${ruleName}: choose ${need} card${need === 1 ? '' : 's'} from ${boss.name}. Highlighted cards are selected — click to change.`
    : `You lost the ${ruleName} trade. ${boss.name} takes ${need} card${need === 1 ? '' : 's'}.`;
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
  els.claimGrid.innerHTML = claimState.pool
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
  const chosen = claimState.pool.filter((c) => claimState.selected.includes(c.uid));
  if (claimState.mode === 'win') {
    campaign = applyWin(campaign, chosen, session.boss);
  } else {
    campaign = applyLoss(campaign, chosen.map((c) => c.uid));
  }
  persist();
  openTitle();
}

function openDeathMatch(opts = {}) {
  const rng = mulberry32((Math.random() * 2 ** 31) | 0);
  if (!session) session = makeDeathSession(campaign, rng);
  const boss = session.boss || bossById(campaign.rival);
  const playerPool = session.playerWager.filter(Boolean);
  const aiPool = [...session.aiWager, ...(session.aiVault || [])].filter(Boolean);
  const playerCard = playerPool[Math.floor(rng() * playerPool.length)] || hydrateOwned(campaign.player[0]);
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
  } else if (winner === 'ai') {
    const pool = session?.playerWager?.length ? session.playerWager : campaign.player.map(hydrateOwned);
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
  if (!btn) return;
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
  if (event.target.id !== 'rebuild-album') return;
  campaign = resetCampaign(campaign);
  persist();
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

els.claimConfirm?.addEventListener('click', confirmClaim);
els.deathOptin?.addEventListener('click', () => openDeathMatch({ fromTitle: false }));
els.deathBtn?.addEventListener('click', () => openDeathMatch({ fromTitle: true }));
els.deathGo?.addEventListener('click', runDeathMatch);
els.deathDone?.addEventListener('click', finishDeathMatch);

if (els.titleDeck) {
  els.titleDeck.innerHTML = [0, 1, 2]
    .map((i) => renderCardBack(`title-${i}`, { owner: 'none' }))
    .join('');
}

renderSetup();
