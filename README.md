# Aetherbound

A playable browser card duel with **Triple Triad–style side ranks** on a neon celestial table — original champions, original art, no copyrighted names or assets.

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
2. You take turns placing one card from your hand onto an empty square of the **3×3 board**. Hover a face-up card (board or hand) to enlarge its four side ranks; the preview does not block clicks.
3. You go first (five placements). The AI places four. The match ends when every square is filled.
4. **Score** is cards you own on the board **plus cards still in your hand**. Captures swing that total. Highest score wins; a tie is a draw.
5. The parchment overlay announces **You Win!**, **You Lose!**, or **Draw Game**.

## Cards

Each card prints **four side ranks** — Top, Right, Bottom, Left — in hex **1–A** (1–10), like a Triple Triad layout. Some cards also show an **element** glyph in the upper-right. A numbered **level badge** sits beside the gem (1–10).

**Total value** is Top + Right + Bottom + Left. Rank ceiling is the highest of those four. Cards in the same level sit within about **2 total** of each other. The softest side is at least **3** on levels 1–2 and **4** from level 3 up — no random 2-sides, and mid-tier cards keep a slight asymmetry instead of even quads.

| Level | Role | Rank ceiling | Total value | Aetherbound examples |
|-------|------|--------------|-------------|----------------------|
| 1 | Common beasts | 6 | 14–18 | Ember Drake, Plaguebloom, Nightbloom Witch |
| 2 | Beasts | 7 | 16–20 | Bone Choir, Skyraid Wyvern, Frost Wraith |
| 3 | Beasts | 7 | 20–24 | Stormglass Oracle, Thornwake Matron, Tidebreaker |
| 4 | Beasts | 7 | 22–26 | Bloodmoon Duelist, Rift Stalker |
| 5 | Elite beasts | 7 | 24–28 | Gravewing, Shard Knight |
| 6 | Warlords | 8 | 26–30 | Iron Vow, Voidglass Lich |
| 7 | Warlords | 8 | 28–32 | Abyssal Countess |
| 8 | Relics | 9 | 30–34 | Cinder Behemoth, Ashen Phoenix, Gilded Colossus |
| 9 | Relics | A | 32–36 | Runebound Golem |
| 10 | Sovereigns | A | 34–38 | Hellforge Tyrant, Pearl Seraph |

A **fresh album** is your **identity card** plus eight **level-1 beasts** (copies of Ember Drake, Nightbloom Witch, and Plaguebloom). You do not start with relics or sovereigns. Stronger cards enter the album when you **win trades**. Names and art are original — no copyrighted FF cards or characters.

The **Album** lists every roster card: owned copies face-up, unknown cards as silhouettes, plus your identity pinned as **You**. Before **New Match**, pick **five** owned cards for the duel. The five persist in `localStorage`.

**Identity** defaults to **Rotbriar** (poison, dark-druid / Sweet-Thorn). You can still change it on the Identity screen. The You card is a strong signature — level 8, sides totaling 30–34 with peaks 8–9 — not a Stage 10 sovereign wall. It always stays in the album and can be one of the five. Existing saves pick up the new stats on load.

All names and illustrations are original dark-fantasy champions — paladins, liches, demon lords, constructs, and boss-like beasts — drawn as SVG, not ripped from other games.

## Capture rules

When you place a card, it compares **touching sides** with every orthogonally adjacent enemy (no diagonals).

- Your **Right** vs their **Left**
- Your **Left** vs their **Right**
- Your **Top** vs their **Bottom**
- Your **Bottom** vs their **Top**

**Higher number captures** and flips the enemy to your color (blue ↔ pink). Ties do nothing. Losing a compare does not counter-capture your placed card.

**Combo** — a newly captured card immediately compares its other sides against remaining neighbors, and those captures can chain.

Friendly cards are never attacked.

## Battle comparison

Clashes are a **higher-number-wins** side compare. **6 beats 3.** A clearly lower printed rank cannot beat a higher one.

The log shows it plainly: `6 vs 3 — capture`.

### Elements

Every card with an element sits on one of three clockwise wheels. Element is a **tie-break only** (+1 or −1 when the printed sides are equal). It never overturns a number gap: a 6 still beats a 5 or a 3.

Wheels (clockwise beats), also shown on the parchment plaque in the top-left of the table:

- Fire ▸ Ice ▸ Water ▸ Fire
- Wind ▸ Earth ▸ Thunder ▸ Wind
- Holy ▸ Dark ▸ Poison ▸ Holy

## AI

Rivals play from their drawn hand. Each stage scores legal (card, empty square) pairs by expected side captures, center control, and a little noise — then places the best move.

## Climb (Stage 1 → 10)

A new save starts at **Stage 1** only. Winning a stage unlocks the next. **Printed late-boss ranks are not softened** — Hellforge Tyrant is still 10/9/8/8. You earn the right to face those cards by climbing; you do not fight them on a fresh album.

| Stage | Rival | Signature band | Deck cap |
|-------|--------|----------------|----------|
| 1 | Lady Vesper | Lv1 beasts (weak-tier ultimates) | ≤1 |
| 2 | Sir Galehart | Lv2 beasts | ≤3 |
| 3 | Cantor Brine | Lv3 beasts | ≤4 |
| 4 | Hexa of the Rift | Lv4–5 | ≤5 |
| 5 | Mirror-Abbess | Elite beasts | ≤5 |
| 6 | Kael the Oathbound | Two elites + one Lv6 spike | ≤6 |
| 7 | The Veiled Regent | Warlords + one stronger hide | ≤8 |
| 8 | Warden Ferric | Iron-ward relics | ≤9 |
| 9 | Duchess Mireveil | Abyss + Pearl Seraph | ≤10 |
| 10 | Lord Cindervow | **Lv8–10 fire court** (Phoenix, Behemoth, Hellforge) | ≤10 |

Stage 10 is the **hardest** fight, not an unwinnable wall. Cindervow still brings three true Lv8–10 ultimates. The other five cards are warlords and relics — no second Hellforge, no extra Pearl Seraph, no eight-card 8–A brick. A climbed album of earned ultimates (Seraph, Runebound, Colossus, and the rest) can beat it with good play. Challenge is stronger cards plus the AI, not brick-wall RNG. Each rival still carries **three signature ultimates** in the wager; claiming them is the reward climb. Vesper’s “ultimates” are the same weak Lv1 beasts you start with.

### How difficulty is gated

We do **not** nerf boss stats or hide 8–A sides from late kits. Early stages are weaker *rivals* (Level 1–5 signatures). Mid stages introduce warlords. Stages 8–10 are the named lieges with their full ultimates in the wager — multiple high sides included. Stage 10 is the hardest fight, still beatable with a climbed album.

## Trades, bosses, and Death Match

Before **New Match**, pick a **trade rule** and an unlocked stage. Your session album is stored in `localStorage`.

| Rule | Winner takes |
|------|----------------|
| **One** | 1 card from the loser’s wagered set (player picks; AI auto-picks highest level) |
| **Three** | up to 3 cards |
| **All** | the entire wagered set |
| **Diff** | as many cards as the score difference |

A draw moves no cards. After a win, **Move On** applies that trade and returns to the title. Each rival’s three signatures sit first in One / Three / All picks. The album tracks which ultimates you have claimed.

Late signatures (unchanged peaks):

- **Warden Ferric** — Iron Vow, Gilded Colossus, Runebound Golem
- **Duchess Mireveil** — Voidglass Lich, Abyssal Countess, Pearl Seraph
- **Lord Cindervow** — Cinder Behemoth, Ashen Phoenix, Hellforge Tyrant

**Death Match** is never required after a clean 3×3 win. **Move On** is the primary button and claims the table trade (One / Three / All / Diff). Death Match appears on that screen only if you opted in (“Offer Death Match after duel”) or your album is already down to one card. You can also start a Death Match from the title. Each side pulls one card at random and clashes by **total of the four side ranks** (higher sum wins; element ±1 only on a tied sum). The loser pays **two more** than the selected trade rule (One → 3, Three → 5, All → the wager plus two vault cards), capped by how many cards remain.

## Project

Vite + vanilla JS. Game rules live in `src/game.js` (pure, unit-tested). Card roster: `src/cards.js`. Original SVG portraits: `src/art.js`. Session album, trades, and bosses: `src/campaign.js`.

Inspired by Triple Triad’s side-rank captures. Tetra Master inspired only the old board and parchment look (3×3 grid, cream title/help plaques, “You Win!” banner) — combat is touching-side number compares, not Attack / P / M / X / A clashes. Blue/pink ownership, elemental icons, and original gothic art.

## Visuals

The play table is a **neon-purple** celestial board (vivid electric glow, not dusty, with nebula and star dust, darker wells for the nine squares) so cards stay readable. The elemental-wheel plaque on the match table uses the same dark-purple chrome (title and help overlays stay cream parchment for contrast). Cards use a tall premium TCG layout: thick color-coded beveled frames (crimson warrior, ivory cleric, void rogue, azure mage, and others by element), a bone-and-iron inner trim, a serif name bar with a **level badge** plus elemental gem, a large painted portrait window, a metal type line (Beast / Warlord / Relic / Sovereign), and a spell-tome flavor box with real English text. Face chrome leans gothic-druid — wrought iron, thorn corners, candlelit portraits, cursed-forest mist — while **four side ranks** (Top / Right / Bottom / Left) sit on the portrait edges. Ownership is a blue or pink outer rim on the board. Face-down cards (opponent hand and the title-screen fan) use an original **purple-celestial Aetherbound back**: nebula, constellation lines, crescent sigil, no third-party branding. Portraits are original painted-style SVGs. Level sheen (epic/legendary) is cosmetic.
