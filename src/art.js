/** Original painted-style SVG portraits — dark-fantasy champions, no third-party assets. */

function g(uid, id, x1, y1, x2, y2, stops) {
  const s = stops
    .map(([o, c, a]) => `<stop offset="${o}%" stop-color="${c}" stop-opacity="${a ?? 1}"/>`)
    .join('');
  return `<linearGradient id="${uid}-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${s}</linearGradient>`;
}

function rg(uid, id, cx, cy, r, stops) {
  const s = stops
    .map(([o, c, a]) => `<stop offset="${o}%" stop-color="${c}" stop-opacity="${a ?? 1}"/>`)
    .join('');
  return `<radialGradient id="${uid}-${id}" cx="${cx}" cy="${cy}" r="${r}">${s}</radialGradient>`;
}

function filters(uid) {
  return `
    <radialGradient id="${uid}-vig" cx="50%" cy="34%" r="76%">
      <stop offset="22%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#050208" stop-opacity=".72"/>
    </radialGradient>
    <radialGradient id="${uid}-key" cx="38%" cy="18%" r="62%">
      <stop offset="0%" stop-color="#fff6d4" stop-opacity=".42"/>
      <stop offset="42%" stop-color="#ffd090" stop-opacity=".1"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <filter id="${uid}-bloom" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${uid}-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.1"/>
    </filter>
    <filter id="${uid}-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0.55 0"/>
    </filter>
    <filter id="${uid}-blotch">
      <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.38  0 0 0 0 0.18  0 0 0 0.28 0"/>
    </filter>`;
}

function wrap(uid, defs, body) {
  return `<svg class="creature" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>${defs}${filters(uid)}</defs>
    ${body}
    <rect width="200" height="280" filter="url(#${uid}-blotch)" opacity=".5" style="mix-blend-mode:overlay" pointer-events="none"/>
    <rect width="200" height="280" filter="url(#${uid}-grain)" opacity=".55" style="mix-blend-mode:soft-light" pointer-events="none"/>
    <rect width="200" height="280" fill="url(#${uid}-key)" pointer-events="none"/>
    <rect width="200" height="280" fill="url(#${uid}-vig)" pointer-events="none"/>
  </svg>`;
}

function motes(color, pts) {
  return pts
    .map(([x, y, r, a]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${a ?? 0.85}"/>`)
    .join('');
}

function sky(uid, id = 'sky') {
  return `<rect width="200" height="280" fill="url(#${uid}-${id})"/>
    <ellipse cx="94" cy="76" rx="92" ry="68" fill="#fff4d0" opacity=".16" filter="url(#${uid}-soft)"/>`;
}

const ART = {
  phoenix(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#3a1208'], [55, '#8a2208'], [100, '#1a0604']]) +
        g(uid, 'w', '0', '0', '1', '1', [[0, '#fff3c0'], [30, '#ff9a32'], [70, '#e02410'], [100, '#5a0808']]) +
        g(uid, 'b', '0', '0', '0', '1', [[0, '#ffe7b8'], [100, '#c43010']]) +
        rg(uid, 'sun', '50%', '36%', '42%', [[0, '#fff4c4', 1], [45, '#ff6a18', 0.7], [100, '#8a1000', 0]]),
      `${sky(uid)}
       <ellipse cx="100" cy="120" rx="92" ry="80" fill="url(#${uid}-sun)"/>
       <path d="M-10 210 Q60 150 100 170 Q150 200 210 160 L210 280 L-10 280 Z" fill="#4a1008" opacity=".55"/>
       <path d="M8 190 C36 70 78 48 100 96 C72 120 34 158 18 236 Z" fill="url(#${uid}-w)"/>
       <path d="M192 190 C164 70 122 48 100 96 C128 120 166 158 182 236 Z" fill="url(#${uid}-w)"/>
       <path d="M22 176 C48 100 74 86 96 112" fill="none" stroke="#ffd27a" stroke-width="3" opacity=".55"/>
       <path d="M178 176 C152 100 126 86 104 112" fill="none" stroke="#ffd27a" stroke-width="3" opacity=".55"/>
       <path d="M100 58 C122 78 132 150 116 214 C106 250 94 250 84 214 C68 150 78 78 100 58 Z" fill="url(#${uid}-b)"/>
       <path d="M88 86 C94 70 106 70 112 86 C108 96 92 96 88 86 Z" fill="#fff1c8"/>
       <path d="M100 42 C116 28 138 44 136 66 C120 56 110 70 100 84 C90 70 80 56 64 66 C62 44 84 28 100 42 Z" fill="#ffd978"/>
       <path d="M72 52 L84 44 M128 52 L116 44 M100 30 L100 18" stroke="#ffef9a" stroke-width="2"/>
       <ellipse cx="90" cy="108" rx="5" ry="6" fill="#2a0a04"/>
       <circle cx="91" cy="107" r="1.8" fill="#fff6c8"/>
       <path d="M108 114 L138 124 L108 128 Z" fill="#ffb020"/>
       <path d="M78 200 C60 238 86 262 100 268 C114 262 140 238 122 200" fill="#ff4e12"/>
       <path d="M92 214 C100 240 108 240 108 214" fill="#ffef9a" opacity=".7"/>
       ${motes('#ffd27a', [[36, 70, 2.2], [164, 88, 2.6], [48, 130, 1.6], [150, 150, 2], [70, 50, 1.4, 0.7], [120, 40, 1.8]])}`,
    );
  },

  gravewing(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#1a1028'], [100, '#08040c']]) +
        g(uid, 'bone', '0', '0', '0', '1', [[0, '#f4ead4'], [100, '#8a7460']]) +
        g(uid, 'wing', '0', '1', '1', '0', [[0, '#3a2838'], [100, '#0c080e']]) +
        g(uid, 'cape', '0', '0', '0', '1', [[0, '#c42838'], [100, '#3a0810']]) +
        rg(uid, 'moon', '78%', '18%', '28%', [[0, '#e8f0ff', 0.9], [100, '#e8f0ff', 0]]),
      `${sky(uid)}
       <circle cx="156" cy="48" r="28" fill="url(#${uid}-moon)"/>
       <path d="M6 168 C44 48 78 70 100 108 C78 132 28 168 10 238 Z" fill="url(#${uid}-wing)"/>
       <path d="M194 168 C156 48 122 70 100 108 C122 132 172 168 190 238 Z" fill="url(#${uid}-wing)"/>
       <path d="M28 150 L58 92 M40 178 L70 120 M172 150 L142 92 M160 178 L130 120" stroke="#c8b8a0" stroke-width="3" opacity=".7"/>
       <path d="M60 148 L100 132 L140 148 L152 268 L48 268 Z" fill="url(#${uid}-cape)"/>
       <path d="M86 168 Q100 190 114 168" fill="none" stroke="#7a1020" stroke-width="6"/>
       <path d="M74 82 L100 36 L126 82 L114 96 L100 62 L86 96 Z" fill="url(#${uid}-bone)"/>
       <ellipse cx="100" cy="116" rx="30" ry="34" fill="url(#${uid}-bone)"/>
       <path d="M78 102 H122 M82 126 H118" stroke="#c8b49a" stroke-width="2" opacity=".5"/>
       <ellipse cx="88" cy="112" rx="6" ry="8" fill="#081018"/>
       <ellipse cx="112" cy="112" rx="6" ry="8" fill="#081018"/>
       <circle cx="88" cy="112" r="3.2" fill="#7dffd4" filter="url(#${uid}-bloom)"/>
       <circle cx="112" cy="112" r="3.2" fill="#7dffd4" filter="url(#${uid}-bloom)"/>
       <path d="M86 132 Q100 146 114 132" fill="none" stroke="#3a2a1a" stroke-width="3"/>
       <rect x="86" y="150" width="28" height="78" rx="7" fill="url(#${uid}-bone)"/>
       <path d="M32 172 L72 154 L66 178 Z" fill="#e8d8c0"/>
       <path d="M168 172 L128 154 L134 178 Z" fill="#e8d8c0"/>
       ${motes('#7dffd4', [[44, 60, 1.6, 0.6], [160, 90, 2, 0.5], [100, 24, 1.4, 0.45]])}`,
    );
  },

  serpent(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#083048'], [50, '#0a5870'], [100, '#041820']]) +
        g(uid, 'sc', '0', '0', '1', '1', [[0, '#b6ffe8'], [40, '#2ec9b0'], [100, '#0b3a48']]) +
        rg(uid, 'sea', '50%', '80%', '55%', [[0, '#5ad8ff', 0.45], [100, '#041820', 0]]),
      `${sky(uid)}
       <ellipse cx="100" cy="230" rx="110" ry="70" fill="url(#${uid}-sea)"/>
       <path d="M-8 220 Q40 190 70 210 Q110 236 160 200 Q190 180 210 210 L210 280 L-8 280 Z" fill="#0a3040" opacity=".7"/>
       <path d="M28 246 C58 198 28 158 78 132 C122 108 86 78 124 56 C162 34 176 84 138 108 C90 142 164 158 128 204 C102 236 162 244 108 266" fill="none" stroke="url(#${uid}-sc)" stroke-width="30" stroke-linecap="round"/>
       <path d="M28 246 C58 198 28 158 78 132 C122 108 86 78 124 56 C162 34 176 84 138 108 C90 142 164 158 128 204 C102 236 162 244 108 266" fill="none" stroke="#7bffea" stroke-width="6" opacity=".35"/>
       <ellipse cx="132" cy="58" rx="36" ry="28" fill="#2ec9b0"/>
       <path d="M154 42 L196 28 L164 68 Z" fill="#d8fff4"/>
       <path d="M148 70 Q160 78 170 68" fill="#0a4038"/>
       <circle cx="144" cy="56" r="6" fill="#e8ff6a"/>
       <circle cx="145" cy="54" r="2.2" fill="#082018"/>
       <path d="M118 48 C130 20 158 22 150 48" fill="#1a6a60"/>
       ${motes('#7bffea', [[40, 90, 3, 0.45], [70, 160, 2.4], [160, 140, 2], [90, 210, 3.2, 0.4], [170, 90, 1.6]])}`,
    );
  },

  oracle(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#1a1048'], [100, '#08041c']]) +
        g(uid, 'robe', '0', '0', '0', '1', [[0, '#e0d0ff'], [50, '#7a58d8'], [100, '#2a1468']]) +
        g(uid, 'hair', '0', '0', '0', '1', [[0, '#fff0a8'], [100, '#c47a10']]) +
        rg(uid, 'bolt', '72%', '24%', '32%', [[0, '#fffce8', 1], [50, '#ffe14d', 0.75], [100, '#ffb000', 0]]),
      `${sky(uid)}
       <ellipse cx="148" cy="64" rx="58" ry="50" fill="url(#${uid}-bolt)"/>
       <path d="M154 16 L132 78 L152 72 L120 148 L178 62 L152 70 Z" fill="#fff4a8" stroke="#c9a020" stroke-width="2" filter="url(#${uid}-bloom)"/>
       <path d="M48 270 L62 138 Q100 108 138 138 L152 270 Z" fill="url(#${uid}-robe)"/>
       <path d="M78 168 Q100 196 122 168" fill="none" stroke="#c9b6ff" stroke-width="5"/>
       <ellipse cx="100" cy="106" rx="28" ry="32" fill="#f3d2b0"/>
       <path d="M70 102 C64 52 136 44 130 102 C120 86 80 86 70 102 Z" fill="url(#${uid}-hair)"/>
       <path d="M74 88 C90 70 110 70 126 88" fill="none" stroke="#ffe27a" stroke-width="3" opacity=".5"/>
       <circle cx="90" cy="108" r="3.8" fill="#1c1030"/>
       <circle cx="112" cy="108" r="3.8" fill="#1c1030"/>
       <circle cx="91" cy="106.5" r="1.3" fill="#fff"/>
       <path d="M90 124 Q100 132 110 124" fill="none" stroke="#a06050" stroke-width="2"/>
       <circle cx="100" cy="172" r="16" fill="#8d6bff" opacity=".9" filter="url(#${uid}-bloom)"/>
       <circle cx="100" cy="172" r="7" fill="#fff4a0"/>
       ${motes('#ffe14d', [[40, 48, 1.8], [60, 90, 1.2], [170, 110, 2], [30, 160, 1.4, 0.5]])}`,
    );
  },

  paladin(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#3a2a10'], [50, '#6a5018'], [100, '#1a1208']]) +
        g(uid, 'arm', '0', '0', '0', '1', [[0, '#fff6d8'], [45, '#d4b060'], [100, '#6a4a18']]) +
        g(uid, 'cape', '0', '0', '1', '0', [[0, '#f8f0d8'], [100, '#a88840']]) +
        rg(uid, 'holy', '50%', '28%', '42%', [[0, '#fff8d0', 0.95], [100, '#d4b050', 0]]),
      `${sky(uid)}
       <ellipse cx="100" cy="86" rx="82" ry="64" fill="url(#${uid}-holy)"/>
       <path d="M32 272 L42 146 L100 118 L158 146 L168 272 Z" fill="url(#${uid}-cape)"/>
       <path d="M70 180 Q100 210 130 180" fill="none" stroke="#fff6c8" stroke-width="4" opacity=".35"/>
       <rect x="76" y="126" width="48" height="88" rx="8" fill="url(#${uid}-arm)"/>
       <path d="M80 142 H120 M80 162 H120 M86 180 H114" stroke="#fff6d8" stroke-width="1.6" opacity=".4"/>
       <path d="M70 84 L100 40 L130 84 L122 102 L100 74 L78 102 Z" fill="url(#${uid}-arm)"/>
       <rect x="82" y="84" width="36" height="40" rx="8" fill="#e8d49a"/>
       <rect x="90" y="98" width="20" height="11" rx="2" fill="#3a2a12" opacity=".4"/>
       <circle cx="92" cy="104" r="2.4" fill="#2a1c0c"/>
       <circle cx="108" cy="104" r="2.4" fill="#2a1c0c"/>
       <circle cx="92" cy="103.2" r="0.9" fill="#fff6c8"/>
       <circle cx="100" cy="90" r="5" fill="#ffe27a" filter="url(#${uid}-bloom)"/>
       <path d="M84 88 H116" stroke="#fff8d8" stroke-width="2" opacity=".6"/>
       <circle cx="48" cy="168" r="24" fill="url(#${uid}-arm)"/>
       <path d="M48 146 L48 118 M34 138 H62" stroke="#f7e7b0" stroke-width="6"/>
       <path d="M148 272 L158 108 L174 106 L182 272" fill="#c4a050"/>
       <path d="M152 96 L180 96 L166 58 Z" fill="#f4e27a" filter="url(#${uid}-bloom)"/>
       ${motes('#fff4c8', [[40, 40, 1.8], [160, 36, 2.2], [70, 24, 1.4], [130, 70, 1.6, 0.6]])}`,
    );
  },

  lich(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#140828'], [100, '#060210']]) +
        g(uid, 'r', '0', '0', '0', '1', [[0, '#9a7cff'], [100, '#1a1030']]) +
        g(uid, 'sk', '0', '0', '0', '1', [[0, '#f0f8e0'], [100, '#8a9a70']]),
      `${sky(uid)}
       <circle cx="36" cy="48" r="40" fill="#3a1860" opacity=".45"/>
       <path d="M40 272 L54 124 Q100 86 146 124 L160 272 Z" fill="url(#${uid}-r)"/>
       <path d="M70 160 Q100 210 130 160" fill="none" stroke="#c9b6ff" stroke-width="3"/>
       <ellipse cx="100" cy="108" rx="32" ry="36" fill="url(#${uid}-sk)"/>
       <path d="M74 86 L100 48 L126 86" fill="#2a1848"/>
       <path d="M78 92 H122" stroke="#c8d8b0" stroke-width="2" opacity=".45"/>
       <ellipse cx="88" cy="108" rx="7" ry="9" fill="#120814"/>
       <ellipse cx="112" cy="108" rx="7" ry="9" fill="#120814"/>
       <circle cx="88" cy="108" r="3.4" fill="#7dffb2" filter="url(#${uid}-bloom)"/>
       <circle cx="112" cy="108" r="3.4" fill="#7dffb2" filter="url(#${uid}-bloom)"/>
       <path d="M86 130 L100 140 L114 130" fill="none" stroke="#4a5a38" stroke-width="2.4"/>
       <circle cx="50" cy="176" r="18" fill="#5dffc8" opacity=".5" filter="url(#${uid}-bloom)"/>
       <circle cx="50" cy="176" r="7" fill="#e8ffe8"/>
       <path d="M142 148 L176 64 L186 74 L154 164 Z" fill="#cbb6ff"/>
       ${motes('#7dffb2', [[160, 40, 2], [24, 90, 1.6, 0.5], [100, 30, 1.4], [170, 120, 1.8, 0.45]])}`,
    );
  },

  duelist(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#3a0810'], [100, '#100408']]) +
        g(uid, 'l', '0', '0', '0', '1', [[0, '#ff7a88'], [100, '#4a1020']]) +
        g(uid, 'skin', '0', '0', '0', '1', [[0, '#f0c4a0'], [100, '#8a4a38']]),
      `${sky(uid)}
       <path d="M20 0 H180 L160 80 H40 Z" fill="#5a1020" opacity=".35"/>
       <path d="M64 272 L76 146 L100 122 L124 146 L136 272 Z" fill="url(#${uid}-l)"/>
       <ellipse cx="100" cy="102" rx="26" ry="30" fill="url(#${uid}-skin)"/>
       <path d="M74 98 C70 58 130 52 126 98 C116 82 84 82 74 98 Z" fill="#140810"/>
       <path d="M74 110 C64 132 84 144 100 122" fill="#140810"/>
       <circle cx="110" cy="106" r="3.8" fill="#f4e8c8"/>
       <circle cx="110.8" cy="105" r="1.3" fill="#1a0808"/>
       <path d="M128 148 L192 78 L198 92 L142 170 Z" fill="#f0e8d8"/>
       <path d="M190 68 L204 50 L198 86 Z" fill="#c0a060"/>
       <path d="M190 68 L198 44" stroke="#ffd27a" stroke-width="2"/>
       <path d="M56 168 L28 222 L72 184" fill="#7a1020"/>
       <circle cx="100" cy="156" r="9" fill="#ff4d62" filter="url(#${uid}-bloom)"/>
       ${motes('#ff6b7a', [[40, 40, 1.6], [170, 50, 2], [30, 100, 1.2, 0.5]])}`,
    );
  },

  matron(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#1a3010'], [100, '#081008']]) +
        g(uid, 'p', '0', '0', '0', '1', [[0, '#d8ff7a'], [50, '#3d7a28'], [100, '#142010']]) +
        g(uid, 'f', '0', '0', '1', '1', [[0, '#f2d278'], [100, '#8a4a10']]),
      `${sky(uid)}
       <path d="M100 28 C158 64 186 150 154 236 C132 270 68 270 46 236 C14 150 42 64 100 28 Z" fill="url(#${uid}-p)"/>
       <path d="M70 70 C90 40 120 48 130 78" fill="none" stroke="#8ad14a" stroke-width="8" opacity=".4"/>
       <ellipse cx="100" cy="118" rx="38" ry="42" fill="#5ea33a"/>
       <circle cx="86" cy="116" r="7" fill="#e8ff8a"/>
       <circle cx="116" cy="116" r="7" fill="#e8ff8a"/>
       <circle cx="86" cy="116" r="3.2" fill="#1a2808"/>
       <circle cx="116" cy="116" r="3.2" fill="#1a2808"/>
       <path d="M80 140 Q100 162 120 140" fill="#204010"/>
       <path d="M30 86 L74 122 L36 134 Z" fill="url(#${uid}-f)"/>
       <path d="M170 86 L126 122 L164 134 Z" fill="url(#${uid}-f)"/>
       <path d="M100 168 L86 262 L114 262 Z" fill="#2a4a16"/>
       <circle cx="58" cy="200" r="16" fill="#8ad14a"/>
       <circle cx="146" cy="214" r="14" fill="#c6e86a"/>
       ${motes('#c6e86a', [[40, 50, 2.4], [160, 60, 2], [24, 140, 1.6], [176, 170, 2.2, 0.6]])}`,
    );
  },

  behemoth(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#4a1808'], [100, '#120604']]) +
        g(uid, 'h', '0', '0', '0', '1', [[0, '#f0a060'], [100, '#4a1808']]) +
        g(uid, 'm', '0', '0', '1', '0', [[0, '#ffd27a'], [100, '#a05020']]) +
        rg(uid, 'ember', '50%', '40%', '40%', [[0, '#ffb060', 0.7], [100, '#4a0800', 0]]),
      `${sky(uid)}
       <ellipse cx="100" cy="120" rx="90" ry="70" fill="url(#${uid}-ember)"/>
       <ellipse cx="100" cy="186" rx="86" ry="66" fill="url(#${uid}-h)"/>
       <ellipse cx="100" cy="108" rx="56" ry="46" fill="url(#${uid}-h)"/>
       <path d="M54 84 L28 28 L72 74 Z" fill="#5a2010"/>
       <path d="M146 84 L172 28 L128 74 Z" fill="#5a2010"/>
       <circle cx="80" cy="102" r="9" fill="#ffef8a"/>
       <circle cx="120" cy="102" r="9" fill="#ffef8a"/>
       <circle cx="82" cy="102" r="4" fill="#2a1008"/>
       <circle cx="122" cy="102" r="4" fill="#2a1008"/>
       <path d="M66 130 Q100 156 134 130" fill="#2a1008"/>
       <path d="M22 208 Q48 148 74 196" fill="url(#${uid}-m)"/>
       <path d="M178 208 Q152 148 126 196" fill="url(#${uid}-m)"/>
       <path d="M84 148 L100 174 L116 148" fill="#ffb060"/>
       ${motes('#ff9a40', [[30, 70, 2], [170, 80, 2.4], [50, 40, 1.6], [140, 36, 1.8], [90, 24, 1.4, 0.5]])}`,
    );
  },

  tyrant(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#4a0808'], [40, '#1a0408'], [100, '#080204']]) +
        g(uid, 'd', '0', '0', '0', '1', [[0, '#ff6a3a'], [40, '#8a1020'], [100, '#1a0508']]) +
        g(uid, 'h', '0', '0', '0', '1', [[0, '#3a0a10'], [100, '#100408']]) +
        rg(uid, 'hell', '50%', '38%', '52%', [[0, '#ffb070', 0.85], [100, '#6a0000', 0]]),
      `${sky(uid)}
       <ellipse cx="100" cy="120" rx="96" ry="100" fill="url(#${uid}-hell)"/>
       <path d="M22 272 L46 124 Q100 58 154 124 L178 272 Z" fill="url(#${uid}-d)"/>
       <path d="M66 90 L48 22 L84 74 M134 90 L152 22 L116 74" fill="#1a0808"/>
       <ellipse cx="100" cy="108" rx="34" ry="36" fill="#4a1820"/>
       <path d="M64 94 L100 64 L136 94" fill="url(#${uid}-h)"/>
       <circle cx="86" cy="110" r="6.5" fill="#ffef7a" filter="url(#${uid}-bloom)"/>
       <circle cx="114" cy="110" r="6.5" fill="#ffef7a" filter="url(#${uid}-bloom)"/>
       <circle cx="86" cy="111" r="2.6" fill="#4a0000"/>
       <circle cx="114" cy="111" r="2.6" fill="#4a0000"/>
       <path d="M82 132 Q100 146 118 132" fill="#1a0000"/>
       <path d="M34 148 L8 210 L52 172" fill="#ff3a20"/>
       <path d="M158 136 L192 52 L204 68 L174 164 Z" fill="#c0a060"/>
       <circle cx="100" cy="170" r="18" fill="#ffb040" filter="url(#${uid}-bloom)"/>
       <path d="M100 152 L100 188 M84 170 H116" stroke="#6a1008" stroke-width="3.5"/>
       ${motes('#ff6a3a', [[20, 40, 2.2], [180, 30, 2], [40, 80, 1.6], [160, 90, 1.8]])}`,
    );
  },

  colossus(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#2a2410'], [100, '#0e0c06']]) +
        g(uid, 'g', '0', '0', '0', '1', [[0, '#fff6d0'], [40, '#e0c25a'], [100, '#6a5018']]) +
        rg(uid, 'core', '50%', '48%', '22%', [[0, '#fff'], [100, '#f0c040']]),
      `${sky(uid)}
       <rect x="44" y="68" width="112" height="178" rx="14" fill="url(#${uid}-g)"/>
       <rect x="58" y="30" width="84" height="56" rx="10" fill="url(#${uid}-g)"/>
       <rect x="74" y="44" width="52" height="24" rx="4" fill="#2a2410" opacity=".5"/>
       <circle cx="100" cy="54" r="7" fill="#fff6c0" filter="url(#${uid}-bloom)"/>
       <circle cx="100" cy="142" r="24" fill="url(#${uid}-core)" filter="url(#${uid}-bloom)"/>
       <path d="M100 118 L100 166 M78 142 H122" stroke="#a08030" stroke-width="4"/>
       <rect x="12" y="92" width="40" height="96" rx="10" fill="url(#${uid}-g)"/>
       <rect x="148" y="92" width="40" height="96" rx="10" fill="url(#${uid}-g)"/>
       <path d="M66 66 H134 M54 110 H146 M54 168 H146" stroke="#fff8d8" stroke-width="2.4" opacity=".55"/>
       <circle cx="62" cy="110" r="5" fill="#ffe27a"/>
       <circle cx="138" cy="110" r="5" fill="#ffe27a"/>
       ${motes('#ffe27a', [[30, 40, 1.6], [170, 36, 2], [100, 16, 1.4], [20, 160, 1.2, 0.5]])}`,
    );
  },

  witch(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#1a0828'], [100, '#080410']]) +
        g(uid, 'r', '0', '0', '0', '1', [[0, '#e0a0ff'], [100, '#2a0840']]) +
        g(uid, 'h', '0', '0', '0', '1', [[0, '#2a0820'], [100, '#000']]),
      `${sky(uid)}
       <path d="M34 272 L54 134 Q100 96 146 134 L166 272 Z" fill="url(#${uid}-r)"/>
       <ellipse cx="100" cy="110" rx="28" ry="32" fill="#e2b496"/>
       <path d="M54 106 C42 32 158 20 146 106 C124 64 76 64 54 106 Z" fill="url(#${uid}-h)"/>
       <path d="M42 94 L100 16 L158 94 L132 88 L100 44 L68 88 Z" fill="#1a0818"/>
       <circle cx="90" cy="112" r="3.6" fill="#c45cff" filter="url(#${uid}-bloom)"/>
       <circle cx="112" cy="112" r="3.6" fill="#c45cff" filter="url(#${uid}-bloom)"/>
       <path d="M90 128 Q100 136 110 128" stroke="#8a4060" stroke-width="2" fill="none"/>
       <path d="M150 148 L184 52 L174 154" fill="#6a208a"/>
       <circle cx="180" cy="48" r="14" fill="#b6ff7a" opacity=".85" filter="url(#${uid}-bloom)"/>
       <circle cx="52" cy="184" r="12" fill="#8d4dff" opacity=".7"/>
       <path d="M16 216 C58 168 36 250 16 216" fill="#3a1050"/>
       ${motes('#d48cff', [[30, 40, 2], [170, 80, 1.6], [60, 24, 1.4], [150, 30, 1.8, 0.5]])}`,
    );
  },

  stalker(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#101828'], [100, '#06080c']]) +
        g(uid, 'cl', '0', '0', '0', '1', [[0, '#7a8aaa'], [100, '#101820']]) +
        rg(uid, 'rift', '72%', '38%', '42%', [[0, '#8a6cff', 0.7], [100, '#201040', 0]]),
      `${sky(uid)}
       <ellipse cx="136" cy="108" rx="70" ry="78" fill="url(#${uid}-rift)"/>
       <path d="M68 272 L78 148 L100 122 L122 148 L132 272 Z" fill="url(#${uid}-cl)"/>
       <ellipse cx="100" cy="106" rx="24" ry="28" fill="#1c2430"/>
       <path d="M78 98 C82 62 122 58 122 98" fill="#0a1018"/>
       <circle cx="110" cy="106" r="4.4" fill="#7dffe2" filter="url(#${uid}-bloom)"/>
       <path d="M110 106 L158 84" stroke="#7dffe2" stroke-width="2.4"/>
       <path d="M128 138 L176 90 L184 104 L138 158 Z" fill="#c0c8d4"/>
       <path d="M60 168 L30 220 L74 186" fill="#2a3848"/>
       <path d="M88 64 L100 28 L112 64" fill="#7a5cff" opacity=".85"/>
       ${motes('#7dffe2', [[40, 50, 1.6, 0.5], [170, 40, 2], [24, 120, 1.4], [160, 150, 1.8, 0.45]])}`,
    );
  },

  choir(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#2a0810'], [100, '#0c0408']]) +
        g(uid, 'c', '0', '0', '0', '1', [[0, '#ff6a6a'], [100, '#5a0818']]) +
        g(uid, 'b', '0', '0', '0', '1', [[0, '#f8eedc'], [100, '#9a8a70']]),
      `${sky(uid)}
       <path d="M40 272 L56 122 Q100 78 144 122 L160 272 Z" fill="url(#${uid}-c)"/>
       <ellipse cx="100" cy="108" rx="32" ry="36" fill="url(#${uid}-b)"/>
       <path d="M74 84 L100 42 L126 84" fill="#ff3a3a"/>
       <ellipse cx="86" cy="108" rx="7" ry="9" fill="#101010"/>
       <ellipse cx="114" cy="108" rx="7" ry="9" fill="#101010"/>
       <circle cx="86" cy="108" r="2.6" fill="#ffd27a" filter="url(#${uid}-bloom)"/>
       <circle cx="114" cy="108" r="2.6" fill="#ffd27a" filter="url(#${uid}-bloom)"/>
       <path d="M84 130 Q100 142 116 130" fill="none" stroke="#5a4030" stroke-width="2.4"/>
       <path d="M66 168 L42 228 L82 186" fill="#ffd27a" opacity=".75"/>
       <path d="M132 158 L168 84 L178 98 L144 178 Z" fill="#f0d090"/>
       <path d="M70 176 Q100 210 130 176" fill="none" stroke="#ffb0a0" stroke-width="3" opacity=".4"/>
       ${motes('#ffd27a', [[30, 40, 1.6], [170, 50, 2], [50, 70, 1.3]])}`,
    );
  },

  wyvern(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#103828'], [100, '#061410']]) +
        g(uid, 'w', '0', '0', '1', '1', [[0, '#d8fff0'], [50, '#3cb88a'], [100, '#0a4030']]) +
        g(uid, 'mem', '0', '0', '0', '1', [[0, '#f0fff8'], [100, '#5ad0a0']]),
      `${sky(uid)}
       <path d="M-4 158 C46 28 88 62 100 108 C80 86 30 118 16 220 Z" fill="url(#${uid}-mem)"/>
       <path d="M204 158 C154 28 112 62 100 108 C120 86 170 118 184 220 Z" fill="url(#${uid}-mem)"/>
       <path d="M40 140 C70 80 90 90 100 120" fill="none" stroke="#e8fff4" stroke-width="3" opacity=".4"/>
       <path d="M100 80 C128 96 140 176 118 236 C106 266 94 266 82 236 C60 176 72 96 100 80 Z" fill="url(#${uid}-w)"/>
       <ellipse cx="112" cy="90" rx="30" ry="24" fill="#4ad0a0"/>
       <path d="M132 76 L178 56 L140 98 Z" fill="#d8ffe8"/>
       <circle cx="122" cy="86" r="5.5" fill="#e8ff6a"/>
       <circle cx="123" cy="84.5" r="2" fill="#082018"/>
       <path d="M66 214 C90 258 136 258 124 214" fill="#0e5a40"/>
       ${motes('#b8ffe0', [[30, 50, 2], [170, 44, 2.2], [50, 90, 1.4], [150, 100, 1.6, 0.5]])}`,
    );
  },

  countess(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#1a0830'], [50, '#3a1058'], [100, '#080414']]) +
        g(uid, 'g', '0', '0', '0', '1', [[0, '#f0d8ff'], [50, '#6a208a'], [100, '#1a0828']]) +
        g(uid, 'sk', '0', '0', '0', '1', [[0, '#f6d0e0'], [100, '#8a4060']]),
      `${sky(uid)}
       <path d="M30 272 L50 128 Q100 80 150 128 L170 272 Z" fill="url(#${uid}-g)"/>
       <path d="M8 214 C56 132 32 258 8 214" fill="#4a1060"/>
       <path d="M192 214 C144 132 168 258 192 214" fill="#4a1060"/>
       <ellipse cx="100" cy="106" rx="28" ry="32" fill="url(#${uid}-sk)"/>
       <path d="M70 98 C62 40 138 32 130 98 C118 74 82 74 70 98 Z" fill="#2a0820"/>
       <path d="M66 66 L100 18 L134 66 L120 62 L100 36 L80 62 Z" fill="#e8d27a"/>
       <circle cx="90" cy="108" r="3.8" fill="#7dffe2" filter="url(#${uid}-bloom)"/>
       <circle cx="112" cy="108" r="3.8" fill="#7dffe2" filter="url(#${uid}-bloom)"/>
       <path d="M88 126 Q100 136 112 126" stroke="#8a3050" fill="none" stroke-width="2"/>
       <path d="M150 148 L184 72 L194 86 L162 172 Z" fill="#d8b0ff"/>
       <circle cx="100" cy="168" r="14" fill="#ff6ad2" opacity=".8" filter="url(#${uid}-bloom)"/>
       ${motes('#e8c8ff', [[24, 40, 2], [176, 36, 2.2], [50, 24, 1.4], [150, 50, 1.6]])}`,
    );
  },

  golem(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#2a2010'], [100, '#100c08']]) +
        g(uid, 'st', '0', '0', '0', '1', [[0, '#e8d4a8'], [50, '#8a6a40'], [100, '#3a2a14']]) +
        g(uid, 'rn', '0', '0', '1', '1', [[0, '#7dffb0'], [100, '#1a6a48']]),
      `${sky(uid)}
       <rect x="46" y="76" width="108" height="158" rx="16" fill="url(#${uid}-st)"/>
       <rect x="60" y="30" width="80" height="60" rx="12" fill="url(#${uid}-st)"/>
       <rect x="76" y="46" width="48" height="22" rx="4" fill="#1a140c" opacity=".55"/>
       <circle cx="86" cy="56" r="5.5" fill="#7dffb0" filter="url(#${uid}-bloom)"/>
       <circle cx="114" cy="56" r="5.5" fill="#7dffb0" filter="url(#${uid}-bloom)"/>
       <path d="M66 118 H134 M66 150 H134 M66 184 H134" stroke="url(#${uid}-rn)" stroke-width="5"/>
       <rect x="10" y="98" width="42" height="90" rx="12" fill="url(#${uid}-st)"/>
       <rect x="148" y="98" width="42" height="90" rx="12" fill="url(#${uid}-st)"/>
       <circle cx="100" cy="154" r="16" fill="#1a4030"/>
       <circle cx="100" cy="154" r="8" fill="#7dffb0" filter="url(#${uid}-bloom)"/>
       ${motes('#7dffb0', [[28, 40, 1.6, 0.5], [172, 44, 2], [40, 80, 1.3]])}`,
    );
  },

  seraph(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#3a3010'], [100, '#141008']]) +
        g(uid, 'w', '0', '0', '0', '1', [[0, '#fff'], [100, '#d8c878']]) +
        g(uid, 'a', '0', '0', '0', '1', [[0, '#fff8e0'], [100, '#c8a050']]) +
        rg(uid, 'h', '50%', '28%', '44%', [[0, '#fffce8', 1], [100, '#f0d060', 0]]),
      `${sky(uid)}
       <ellipse cx="100" cy="86" rx="88" ry="74" fill="url(#${uid}-h)"/>
       <path d="M0 154 C40 28 80 64 100 108 C66 76 16 108 8 210 Z" fill="url(#${uid}-w)"/>
       <path d="M200 154 C160 28 120 64 100 108 C134 76 184 108 192 210 Z" fill="url(#${uid}-w)"/>
       <path d="M66 272 L76 148 L100 124 L124 148 L134 272 Z" fill="url(#${uid}-a)"/>
       <ellipse cx="100" cy="102" rx="26" ry="30" fill="#f6d8b8"/>
       <path d="M76 94 C78 56 122 52 124 94" fill="#f4e8a0"/>
       <circle cx="90" cy="104" r="3.2" fill="#4a3018"/>
       <circle cx="110" cy="104" r="3.2" fill="#4a3018"/>
       <path d="M90 122 Q100 130 110 122" stroke="#c08070" fill="none" stroke-width="2"/>
       <path d="M100 28 L110 66 L100 58 L90 66 Z" fill="#ffe27a" filter="url(#${uid}-bloom)"/>
       <rect x="150" y="118" width="12" height="118" fill="#e8d080"/>
       ${motes('#fff6c8', [[24, 36, 2], [176, 40, 2.2], [60, 20, 1.4], [140, 24, 1.6]])}`,
    );
  },

  plague(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#203010'], [100, '#0a1006']]) +
        g(uid, 'p', '0', '0', '0', '1', [[0, '#e0ff7a'], [50, '#5a8a20'], [100, '#203010']]) +
        rg(uid, 'tox', '40%', '40%', '48%', [[0, '#c6ff4a', 0.75], [100, '#305010', 0]]),
      `${sky(uid)}
       <ellipse cx="90" cy="130" rx="88" ry="96" fill="url(#${uid}-tox)"/>
       <path d="M100 40 C168 74 180 176 136 246 C104 276 48 244 44 168 C40 92 68 52 100 40 Z" fill="url(#${uid}-p)"/>
       <ellipse cx="96" cy="118" rx="36" ry="34" fill="#7aaa30"/>
       <circle cx="82" cy="114" r="8" fill="#e8ff8a"/>
       <circle cx="114" cy="116" r="7" fill="#e8ff8a"/>
       <circle cx="82" cy="114" r="3.2" fill="#203008"/>
       <circle cx="114" cy="116" r="2.8" fill="#203008"/>
       <path d="M74 140 Q96 164 122 136" fill="#305010"/>
       <circle cx="36" cy="86" r="18" fill="#b6ff4a" opacity=".8"/>
       <circle cx="156" cy="164" r="20" fill="#8ad14a" opacity=".75"/>
       <circle cx="56" cy="214" r="14" fill="#e8ff8a" opacity=".7"/>
       ${motes('#d8ff6a', [[20, 50, 2.4], [170, 70, 2], [40, 140, 1.6], [160, 110, 1.8, 0.5]])}`,
    );
  },

  drake(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#3a1408'], [100, '#120604']]) +
        g(uid, 's', '0', '0', '1', '1', [[0, '#ffe0a0'], [50, '#e05020'], [100, '#6a1208']]) +
        g(uid, 'w', '0', '0', '0', '1', [[0, '#ffefb0'], [100, '#c43010']]),
      `${sky(uid)}
       <path d="M8 188 C48 78 82 82 104 122 C78 108 32 142 20 230 Z" fill="url(#${uid}-w)"/>
       <path d="M100 84 C136 108 160 186 124 246 C110 270 90 254 82 224 C70 158 80 104 100 84 Z" fill="url(#${uid}-s)"/>
       <ellipse cx="128" cy="94" rx="32" ry="26" fill="#ff7a30"/>
       <path d="M148 80 L194 62 L158 104 Z" fill="#ffd27a"/>
       <circle cx="136" cy="92" r="5.5" fill="#fff2a0"/>
       <circle cx="137" cy="90.5" r="2" fill="#3a1008"/>
       <path d="M86 204 L64 258 L108 234" fill="#c43010"/>
       <path d="M108 148 L158 172 L112 176" fill="#ffb040"/>
       ${motes('#ff9a40', [[40, 50, 2], [160, 40, 2.2], [24, 90, 1.4], [170, 100, 1.6, 0.5]])}`,
    );
  },

  wraith(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#102838'], [100, '#061018']]) +
        g(uid, 'i', '0', '0', '0', '1', [[0, '#f4ffff'], [50, '#7ad0f0'], [100, '#1a4060']]) +
        rg(uid, 'c', '50%', '38%', '50%', [[0, '#f4ffff', 0.85], [100, '#8ad0ff', 0]]),
      `${sky(uid)}
       <ellipse cx="100" cy="118" rx="88" ry="96" fill="url(#${uid}-c)"/>
       <path d="M56 268 Q68 116 100 60 Q132 116 144 268 Q100 230 56 268 Z" fill="url(#${uid}-i)"/>
       <ellipse cx="100" cy="106" rx="30" ry="34" fill="#d8f0ff"/>
       <circle cx="88" cy="106" r="5.5" fill="#103048"/>
       <circle cx="114" cy="106" r="5.5" fill="#103048"/>
       <circle cx="89" cy="104.5" r="1.7" fill="#fff"/>
       <path d="M84 128 Q100 120 116 128" fill="none" stroke="#4a7088" stroke-width="2"/>
       <path d="M68 76 L54 28 L84 68 M132 76 L146 28 L116 68" fill="#c8f0ff"/>
       <path d="M34 172 C10 216 70 204 42 168" fill="#a8e0ff" opacity=".7"/>
       ${motes('#e8f8ff', [[30, 40, 2], [170, 48, 2.2], [50, 24, 1.4], [150, 80, 1.6, 0.5]])}`,
    );
  },

  shard(uid) {
    return wrap(
      uid,
      g(uid, 'sky', '0', '0', '0', '1', [[0, '#183048'], [100, '#081018']]) +
        g(uid, 'ice', '0', '0', '0', '1', [[0, '#f8ffff'], [40, '#9ad8f0'], [100, '#2a5080']]) +
        g(uid, 'arm', '0', '0', '1', '1', [[0, '#f0fbff'], [100, '#5a88b0']]),
      `${sky(uid)}
       <path d="M42 268 L54 136 L100 112 L146 136 L158 268 Z" fill="url(#${uid}-arm)"/>
       <path d="M74 92 L100 24 L126 92 L116 108 L100 62 L84 108 Z" fill="url(#${uid}-ice)"/>
       <rect x="82" y="88" width="36" height="36" rx="7" fill="#c8e8f8"/>
       <rect x="88" y="100" width="24" height="9" fill="#2a4860" opacity=".45"/>
       <path d="M30 118 L6 60 L50 128 Z" fill="url(#${uid}-ice)"/>
       <path d="M170 118 L194 60 L150 128 Z" fill="url(#${uid}-ice)"/>
       <path d="M152 268 L162 102 L176 102 L184 268" fill="#d0eefc"/>
       <circle cx="100" cy="156" r="14" fill="#e8ffff" filter="url(#${uid}-bloom)"/>
       <circle cx="100" cy="156" r="6" fill="#7ad8ff"/>
       ${motes('#e8f8ff', [[24, 36, 1.8], [176, 40, 2], [60, 20, 1.3], [140, 30, 1.5]])}`,
    );
  },
};

export function creatureSVG(artKey, uid) {
  const fn = ART[artKey] || ART.drake;
  return fn(uid);
}

export function cardBackSVG(uid) {
  return `<svg class="creature" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      ${g(uid, 'bk', '0', '0', '0', '1', [[0, '#5a3a18'], [50, '#2a180c'], [100, '#120804']])}
      ${rg(uid, 'sg', '50%', '46%', '42%', [[0, '#ffe27a', 1], [100, '#8a6010', 0.15]])}
      ${rg(uid, 'glow', '50%', '46%', '38%', [[0, '#e8c56b', 0.55], [100, '#e8c56b', 0]])}
    </defs>
    <rect width="200" height="280" fill="url(#${uid}-bk)"/>
    <rect x="10" y="10" width="180" height="260" rx="14" fill="none" stroke="#e8c56b" stroke-width="3"/>
    <rect x="20" y="20" width="160" height="240" rx="10" fill="none" stroke="#8a6a30" stroke-width="1.5"/>
    <circle cx="100" cy="128" r="62" fill="url(#${uid}-glow)"/>
    <circle cx="100" cy="128" r="50" fill="none" stroke="#e8c56b" stroke-width="2.4"/>
    <path d="M100 72 L114 116 L160 116 L122 144 L136 190 L100 162 L64 190 L78 144 L40 116 L86 116 Z" fill="url(#${uid}-sg)" stroke="#5a4010" stroke-width="2"/>
    <text x="100" y="228" text-anchor="middle" fill="#e8c56b" font-size="13" font-family="Cinzel, serif" letter-spacing="2">AETHERBOUND</text>
  </svg>`;
}

export function elementGlyph(element) {
  const icons = {
    fire: `<svg viewBox="0 0 32 32"><path d="M16 3 C19 12 8 14 11 23 C12 28 20 28 21 20 C24 11 14 12 16 3 Z" fill="#ff7a28" stroke="#7a1800" stroke-width="1.4"/><path d="M16 13 C18 18 13 19 14 23 C15 26 18 24 18 20" fill="#ffe08a"/></svg>`,
    ice: `<svg viewBox="0 0 32 32"><path d="M16 3 L16 29 M6 9 L26 23 M26 9 L6 23 M7 16 H25" stroke="#e8fbff" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="16" r="4.2" fill="#9ad8f0" stroke="#2a5080"/></svg>`,
    water: `<svg viewBox="0 0 32 32"><path d="M16 4 C16 4 5 16 5 22 C5 27.5 10 30 16 30 C22 30 27 27.5 27 22 C27 16 16 4 16 4 Z" fill="#4ec4ff" stroke="#0a4060" stroke-width="1.4"/><ellipse cx="12" cy="20" rx="3.2" ry="4.2" fill="#e8ffff" opacity=".75"/></svg>`,
    wind: `<svg viewBox="0 0 32 32"><path d="M5 11 H22 C27 11 27 5 21 6 M5 16 H25 C29 16 29 23 22 22 M5 21 H18" fill="none" stroke="#e8fff4" stroke-width="2.7" stroke-linecap="round"/></svg>`,
    earth: `<svg viewBox="0 0 32 32"><path d="M7 23 L16 6 L25 23 Z" fill="#d4b06a" stroke="#4a3010" stroke-width="1.4"/><path d="M12 23 L16 13 L20 23 Z" fill="#8a6a38"/><ellipse cx="16" cy="25" rx="11" ry="3.2" fill="#6a4a20"/></svg>`,
    thunder: `<svg viewBox="0 0 32 32"><path d="M18 2 L8 16 H16 L11 30 L26 12 H18 Z" fill="#ffe14d" stroke="#8a6a00" stroke-width="1.3"/></svg>`,
    holy: `<svg viewBox="0 0 32 32"><path d="M16 2 L18.5 12 L28 12 L20.5 18 L23 28 L16 22 L9 28 L11.5 18 L4 12 L13.5 12 Z" fill="#fff4c8" stroke="#a08030" stroke-width="1.2"/></svg>`,
    dark: `<svg viewBox="0 0 32 32"><path d="M19 5 C10 8 5 16 10 25 C16 31 27 27 27 18 C18 20 16 11 19 5 Z" fill="#3a2060" stroke="#d8b0ff" stroke-width="1.4"/><circle cx="21" cy="14" r="2.2" fill="#e8d27a"/></svg>`,
    poison: `<svg viewBox="0 0 32 32"><circle cx="12" cy="13" r="6.5" fill="#b6ff4a" stroke="#305010"/><circle cx="21" cy="20" r="7.2" fill="#7ad14a" stroke="#305010"/><circle cx="16" cy="9" r="4.2" fill="#e8ff8a"/></svg>`,
  };
  return icons[element] || '';
}

export function arrowGlyph(dir) {
  return `<svg class="arr-svg" viewBox="0 0 24 20" aria-hidden="true"><path d="M12 1.5 L22.5 18.5 H1.5 Z"/></svg>`;
}
