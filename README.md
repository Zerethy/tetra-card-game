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

On opposing arrows the clash is a **higher-number-wins** compare, like Triple Triad. The attacker’s printed Attack is checked against the defense the battle-type letter names (**P** → P.Def, **M** → M.Def, **X** → the lower defense, **A** → the defender’s lowest stat). **6 beats 3. A 6 cannot lose to an M3.**

The log shows it plainly: `6 vs 3 — capture`. Equal printed ranks can use the type cycle (+1) or elemental wheel (+2) as a **tie-break only** — those modifiers never reverse a clear number gap. Defender wins remaining ties.

### Battle-type cycle

Types also play a rock-paper-scissors cycle. Same type, or opposites across the square (**A** vs **P**, **X** vs **M**), grant no bonus.

**A ▸ X ▸ P ▸ M ▸ A**

When printed Attack and the named defense are **tied**, a type advantage breaks the tie (+1 Attack). If the defender’s type beats the attacker’s, −1. A gold chip flashes (`A ▸ X +1`) only when that tie-break matters.

### Elements

Every card with an element sits on one of three clockwise wheels. On a **tied** printed compare, the attacker’s element can break the tie:

- **+2** if the attacker’s element beats the defender’s
- **−2** if the defender’s element beats the attacker’s
- **0** if either card has no element, or they are on different wheels

Wheels (clockwise beats), also shown on the parchment plaque in the top-left of the table:

- Fire ▸ Ice ▸ Water ▸ Fire
- Wind ▸ Earth ▸ Thunder ▸ Wind
- Holy ▸ Dark ▸ Poison ▸ Holy

## AI

Rivals play from their drawn hand. Lady Vesper and the named bosses score each legal (card, empty square) pair by expected captures, clash odds from printed stats, center control, and a little noise — then place the best move.

## Trades, bosses, and Death Match

Before **New Match**, pick a **trade rule** and a rival. Your session album (about a dozen starters) is stored in `localStorage`.

| Rule | Winner takes |
|------|----------------|
| **One** | 1 card from the loser’s wagered set (player picks; AI auto-picks highest level) |
| **Three** | up to 3 cards |
| **All** | the entire wagered set |
| **Diff** | as many cards as the score difference |

A draw moves no cards. After a win, **Move On** applies that trade and returns to the title. Bosses each keep **three ultimates** (level 6–10), shown before the match and preferred in the claim list:

- **Lord Cindervow** — Cinder Behemoth, Ashen Phoenix, Hellforge Tyrant
- **Duchess Mireveil** — Voidglass Lich, Abyssal Countess, Pearl Seraph
- **Warden Ferric** — Iron Vow, Gilded Colossus, Runebound Golem

**Death Match** is never required after a clean 3×3 win. **Move On** is the primary button and claims the table trade (One / Three / All / Diff). Death Match appears on that screen only if you opted in (“Offer Death Match after duel”) or your album is already down to one card. You can also start a Death Match from the title. Each side pulls one card at random and clashes. The loser pays **two more** than the selected trade rule (One → 3, Three → 5, All → the wager plus two vault cards), capped by how many cards remain.

## Project

Vite + vanilla JS. Game rules live in `src/game.js` (pure, unit-tested). Card roster: `src/cards.js`. Original SVG portraits: `src/art.js`. Session album, trades, and bosses: `src/campaign.js`.

Inspired by the look of Tetra Master’s table, blue/pink ownership, top-left stats, elemental icons, and “You Win!” banner — rebuilt with original work only.

## Visuals

The play table is a **neon-purple** celestial board (vivid glow, darker wells for the nine squares) so cards stay readable. Cards use a tall premium TCG layout: thick color-coded beveled frames (crimson warrior, ivory cleric, void rogue, azure mage, and others by element), a bone-and-iron inner trim, a serif name bar with a **level badge** plus elemental gem, a large painted portrait window, a metal type line (Beast / Warlord / Relic / Sovereign), and a spell-tome flavor box with real English text. Face chrome leans gothic-druid — wrought iron, thorn corners, candlelit portraits, cursed-forest mist — while Tetra Master stats stay readable on the portrait (Attack, P/M/X/A, physical and magical defense) and again in a small box on the text area, with gold directional arrows on the edges. Ownership is a blue or pink outer rim on the board. Face-down cards (opponent hand and the title-screen fan) use an original **purple-celestial Aetherbound back**: nebula, constellation lines, crescent sigil, no third-party branding. Portraits are original painted-style SVGs. Level sheen (epic/legendary) is cosmetic.
