# Aetherbound

A playable browser card duel inspired by **Tetra Master** (Final Fantasy IX) — original champions, original art, no copyrighted names or assets.

Blue is you. Pink is Lady Vesper. Capture the ninefold board.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (Vite defaults to `http://localhost:5173`). Click **New Match**, draw a hand of five, and play.

```bash
npm test      # rule-engine checks
npm run build # production bundle
```

## How a match works

1. Each player shuffles a deck of eight original champions and **draws five into a hand**.
2. You take turns placing one card from your hand onto an empty square of the **3×3 board**.
3. You go first (five placements). The AI places four. The match ends when every square is filled.
4. **Score** is cards you own on the board **plus cards still in your hand**. Captures swing that total. Highest score wins; a tie is a draw.
5. The parchment overlay announces **You Win!**, **You Lose!**, or **Draw Game**.

## Cards

Each card shows four values in the top-left, matching the classic layout:

| Spot | Meaning |
|------|---------|
| Top numeral (0–F hex) | **Attack Power** |
| Letter `P` `M` `X` `A` | **Battle Type** |
| Numeral beside the type | **Physical Defense** |
| Numeral under the type | **Magical Defense** |

Gold pips on the edges are **arrows** (eight possible directions, including diagonals). Some cards also show an **element** glyph in the upper-right. A numbered **level badge** sits beside the gem (1–10).

**Total value** is Attack + P.Def + M.Def (the three numeric tetra ranks). Battle type is not counted. Rank ceiling is the highest of those three, printed in hex **1–A**.

| Level | Role | Rank ceiling | Total value | Aetherbound examples |
|-------|------|--------------|-------------|----------------------|
| 1 | Common beasts | 6 | 10–13 | Ember Drake, Plaguebloom, Nightbloom Witch |
| 2 | Beasts | 7 | 12–15 | Bone Choir, Skyraid Wyvern, Frost Wraith |
| 3 | Beasts | 7 | 16–18 | Stormglass Oracle, Thornwake Matron, Tidebreaker |
| 4 | Beasts | 7 | 17–20 | Bloodmoon Duelist, Rift Stalker |
| 5 | Elite beasts | 7 | 20–22 | Gravewing, Shard Knight |
| 6 | Warlords | 8 | 20–23 | Iron Vow, Voidglass Lich |
| 7 | Warlords | 8 | 23–26 | Cinder Behemoth, Abyssal Countess |
| 8 | Relics | 9 | 23–26 | Ashen Phoenix, Gilded Colossus |
| 9 | Relics | A | 24–27 | Runebound Golem |
| 10 | Sovereigns | A | 26–29 | Hellforge Tyrant, Pearl Seraph |

Each starter deck of **8** is dealt from that mix: **5** beasts (levels 1–5), **1** warlord (6–7), **1** relic (8–9), and **1** sovereign (10). Player and AI draw the same quota from a shared pool so matches stay fair. Names and art are original — no copyrighted FF cards or characters.

All names and illustrations are original dark-fantasy champions — paladins, liches, demon lords, constructs, and boss-like beasts — drawn as SVG, not ripped from other games.

## Capture rules

When you place a card, it **attacks every adjacent enemy** that one of its arrows points at.

- **Unprotected arrow** — the enemy has no arrow pointing back. Capture is automatic: the card flips to your color (blue ↔ pink).
- **Clash** — both cards point at each other. They fight (see below). The winner owns the loser. If you lose the clash, **your newly placed card is counter-captured**.
- **Combo** — after a capture, the captured card’s arrows immediately flip adjacent enemy cards. Those combo flips do not start new battles.

Friendly cards are never attacked by your own arrows.

## Battle comparison

Displayed attack/defense digits are hexadecimal **0–F** (0–15). Each digit stands for a band of 16 hidden values (`digit × 16` through `digit × 16 + 15`). For a clash the game:

1. Picks a hidden value inside each relevant band.
2. Subtracts a second roll between `0` and that hidden value.
3. The higher remainder wins. **Defender wins ties.**

Which defense is used depends on the attacker’s battle type:

- **P (Physical)** — vs Physical Defense
- **M (Magical)** — vs Magical Defense
- **X (Flexible)** — vs the lower of the two defenses
- **A (Assault)** — vs the defender’s lowest stat among Attack, P.Def, and M.Def

This is a Tetra Master–style comparison: higher printed stats are favored, but a clash is never a guaranteed smash.

### Elements

Optional glyphs (Fire, Ice, Water, Wind, Earth, Thunder, Holy, Dark, Poison) apply a small modifier to the attacker’s printed Attack before the band roll:

- **+2** if the attacker’s element beats the defender’s
- **−2** if the defender’s element beats the attacker’s

Wheels: Fire > Ice > Water > Fire · Wind > Earth > Thunder > Wind · Holy > Dark > Poison > Holy.

## AI

Lady Vesper plays from her drawn hand. She scores each legal (card, empty square) pair by expected captures, clash odds from printed stats, center control, and a little noise — then places the best move.

## Project

Vite + vanilla JS. Game rules live in `src/game.js` (pure, unit-tested). Card roster: `src/cards.js`. Original SVG portraits: `src/art.js`.

Inspired by the look of Tetra Master’s parchment table, blue/pink ownership, top-left stats, elemental icons, and “You Win!” banner — rebuilt with original work only.

## Visuals

Cards use a tall premium TCG layout: thick color-coded beveled frames (crimson warrior, ivory cleric, void rogue, azure mage, and others by element), a gilt inner trim, a serif name bar with a **level badge** plus elemental gem, a large painted portrait window, a metal type line (Beast / Warlord / Relic / Sovereign), and a parchment flavor box with real English text. Tetra Master stats stay on the portrait (Attack, P/M/X/A, physical and magical defense) and again in a small box on the text area, with gold directional arrows on the edges. Ownership is a blue or pink outer rim on the board. Portraits are original painted-style SVGs. Level sheen (epic/legendary) is cosmetic.
