import { emptyCells, placeCard, scores, neighborsOf, compareSides, mulberry32 } from './game.js';

function cloneForSim(state, salt) {
  const copy = structuredClone({ ...state, rng: undefined, events: [] });
  copy.rng = mulberry32((state.seed ^ (salt * 2654435761)) >>> 0);
  return copy;
}

function moveScore(state, owner, handIndex, cellIndex) {
  const before = scores(state);
  const sim = cloneForSim(state, handIndex * 10 + cellIndex + 1);
  const result = placeCard(sim, owner, handIndex, cellIndex);
  if (!result.ok) return -999;

  const after = scores(sim);
  const myBefore = owner === 'player' ? before.player : before.ai;
  const myAfter = owner === 'player' ? after.player : after.ai;
  const theirAfter = owner === 'player' ? after.ai : after.player;
  let score = (myAfter - myBefore) * 12;
  score += (myAfter - theirAfter) * 4;

  const card = state[owner].hand[handIndex];
  for (const hit of neighborsOf(cellIndex)) {
    const target = state.board[hit.index];
    if (!target || target.owner === owner) continue;
    const battle = compareSides(card, target, hit.side);
    if (battle.attackerWins) score += 10;
    else if (battle.defenderWins) score -= 14;
    else score -= 1;
  }

  if (cellIndex === 4) score += 3;
  if ([0, 2, 6, 8].includes(cellIndex)) score += 1;

  const emptiesAfter = emptyCells(sim.board).length;
  if (emptiesAfter <= 1 && myAfter > theirAfter) score += 6;
  if (sim.winner === owner) score += 40;
  if (sim.winner && sim.winner !== owner && sim.winner !== 'draw') score -= 40;

  score += sim.rng() * 1.6;
  return score;
}

export function chooseAiMove(state) {
  const cells = emptyCells(state.board);
  const hand = state.ai.hand;
  let best = null;
  let bestScore = -Infinity;
  for (let h = 0; h < hand.length; h++) {
    for (const cell of cells) {
      const s = moveScore(state, 'ai', h, cell);
      if (s > bestScore) {
        bestScore = s;
        best = { handIndex: h, cellIndex: cell, score: s };
      }
    }
  }
  if (!best) {
    return { handIndex: 0, cellIndex: cells[0], score: 0 };
  }
  return best;
}
