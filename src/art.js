/** Original SVG illustrations — dark-fantasy champions, no third-party assets. */

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

function wrap(uid, defs, body) {
  return `<svg class="creature" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>${defs}</defs>
    ${body}
  </svg>`;
}

const ART = {
  phoenix(uid) {
    return wrap(
      uid,
      g(uid, 'w', '0', '0', '1', '1', [[0, '#ffef9a'], [45, '#ff6a1a'], [100, '#8a1208']]) +
        g(uid, 'b', '0', '0', '0', '1', [[0, '#ffe7b0'], [100, '#c43a10']]) +
        rg(uid, 'gl', '50%', '42%', '45%', [[0, '#fff3c0', 0.95], [100, '#ff4d00', 0]]),
      `<ellipse cx="100" cy="150" rx="78" ry="90" fill="url(#${uid}-gl)"/>
       <path d="M18 168 C40 90 70 70 100 92 C78 118 48 150 34 210 Z" fill="url(#${uid}-w)"/>
       <path d="M182 168 C160 90 130 70 100 92 C122 118 152 150 166 210 Z" fill="url(#${uid}-w)"/>
       <path d="M100 70 C118 88 124 140 112 200 C104 232 96 232 88 200 C76 140 82 88 100 70 Z" fill="url(#${uid}-b)"/>
       <path d="M100 58 C112 44 128 52 132 68 C118 62 110 74 100 86 C90 74 82 62 68 68 C72 52 88 44 100 58 Z" fill="#ffd978"/>
       <ellipse cx="92" cy="108" rx="5" ry="6" fill="#1a0a04"/>
       <ellipse cx="93" cy="107" rx="2" ry="2" fill="#fff"/>
       <path d="M108 114 L132 122 L108 126 Z" fill="#ffb020"/>
       <path d="M86 198 C70 230 88 250 100 258 C112 250 130 230 114 198" fill="#ff4e12" opacity=".9"/>
       <circle cx="100" cy="168" r="10" fill="#ffefc2" opacity=".7"/>`,
    );
  },

  gravewing(uid) {
    return wrap(
      uid,
      g(uid, 'bone', '0', '0', '0', '1', [[0, '#efe6d2'], [100, '#8a7a62']]) +
        g(uid, 'wing', '0', '0', '1', '1', [[0, '#4a3a58'], [100, '#1a1018']]) +
        g(uid, 'cape', '0', '0', '0', '1', [[0, '#8b1d2c'], [100, '#3a0a12']]),
      `<path d="M20 150 C50 70 70 80 100 110 C80 140 40 170 24 220 Z" fill="url(#${uid}-wing)"/>
       <path d="M180 150 C150 70 130 80 100 110 C120 140 160 170 176 220 Z" fill="url(#${uid}-wing)"/>
       <path d="M78 90 L100 48 L122 90 L112 100 L100 70 L88 100 Z" fill="url(#${uid}-bone)"/>
       <ellipse cx="100" cy="118" rx="28" ry="32" fill="url(#${uid}-bone)"/>
       <circle cx="90" cy="114" r="5" fill="#7cffd4"/>
       <circle cx="110" cy="114" r="5" fill="#7cffd4"/>
       <path d="M88 132 Q100 142 112 132" fill="none" stroke="#3a2a1a" stroke-width="3"/>
       <path d="M70 150 L100 140 L130 150 L140 250 L60 250 Z" fill="url(#${uid}-cape)"/>
       <rect x="88" y="148" width="24" height="70" rx="6" fill="url(#${uid}-bone)"/>
       <path d="M40 168 L70 158 L66 176 Z" fill="#d7c6a4"/>
       <path d="M160 168 L130 158 L134 176 Z" fill="#d7c6a4"/>`,
    );
  },

  serpent(uid) {
    return wrap(
      uid,
      g(uid, 'sc', '0', '0', '1', '1', [[0, '#7dffd2'], [50, '#1f8f8a'], [100, '#0b3a48']]) +
        rg(uid, 'sea', '50%', '70%', '50%', [[0, '#5ad0ff', 0.45], [100, '#083040', 0]]),
      `<rect width="200" height="280" fill="url(#${uid}-sea)"/>
       <path d="M40 240 C70 200 40 160 80 140 C120 120 90 90 120 70 C150 50 160 90 130 110 C90 140 150 160 120 200 C96 230 150 236 110 258" fill="none" stroke="url(#${uid}-sc)" stroke-width="28" stroke-linecap="round"/>
       <ellipse cx="128" cy="64" rx="32" ry="26" fill="#2ec9b0"/>
       <path d="M150 50 L188 40 L156 70 Z" fill="#b6ffe8"/>
       <circle cx="140" cy="60" r="5" fill="#e8ff6a"/>
       <circle cx="141" cy="59" r="2" fill="#082018"/>
       <path d="M70 210 L40 250 L80 230" fill="#145e5a"/>
       <circle cx="92" cy="168" r="6" fill="#7bffea" opacity=".8"/>
       <circle cx="118" cy="128" r="5" fill="#7bffea" opacity=".8"/>`,
    );
  },

  oracle(uid) {
    return wrap(
      uid,
      g(uid, 'robe', '0', '0', '0', '1', [[0, '#c9b6ff'], [100, '#3a1e8a']]) +
        g(uid, 'hair', '0', '0', '0', '1', [[0, '#f4e27a'], [100, '#c47a10']]) +
        rg(uid, 'bolt', '70%', '28%', '30%', [[0, '#fffbe8', 1], [60, '#ffe14d', 0.7], [100, '#ffb000', 0]]),
      `<ellipse cx="140" cy="70" rx="50" ry="44" fill="url(#${uid}-bolt)"/>
       <path d="M148 28 L132 78 L150 74 L126 130 L168 68 L148 74 Z" fill="#fff4a8" stroke="#c9a020" stroke-width="2"/>
       <path d="M62 250 L70 140 Q100 120 130 140 L138 250 Z" fill="url(#${uid}-robe)"/>
       <ellipse cx="100" cy="108" rx="26" ry="30" fill="#f3d2b0"/>
       <path d="M74 104 C70 60 130 52 126 104 C118 92 82 92 74 104 Z" fill="url(#${uid}-hair)"/>
       <circle cx="92" cy="110" r="3.5" fill="#1c1030"/>
       <circle cx="110" cy="110" r="3.5" fill="#1c1030"/>
       <circle cx="93" cy="109" r="1.2" fill="#fff"/>
       <path d="M92 124 Q100 130 108 124" fill="none" stroke="#a06050" stroke-width="2"/>
       <circle cx="100" cy="168" r="14" fill="#8d6bff" opacity=".85"/>
       <circle cx="100" cy="168" r="6" fill="#fff4a0"/>`,
    );
  },

  paladin(uid) {
    return wrap(
      uid,
      g(uid, 'arm', '0', '0', '0', '1', [[0, '#f2e4b8'], [50, '#c9a24a'], [100, '#6a4a18']]) +
        g(uid, 'cape', '0', '0', '1', '0', [[0, '#f4f0e0'], [100, '#b8a060']]) +
        rg(uid, 'holy', '50%', '30%', '40%', [[0, '#fff6c8', 0.9], [100, '#d4b050', 0]]),
      `<ellipse cx="100" cy="90" rx="70" ry="60" fill="url(#${uid}-holy)"/>
       <path d="M40 250 L46 150 L100 128 L154 150 L160 250 Z" fill="url(#${uid}-cape)"/>
       <rect x="78" y="128" width="44" height="80" rx="6" fill="url(#${uid}-arm)"/>
       <path d="M70 86 L100 48 L130 86 L124 100 L100 78 L76 100 Z" fill="url(#${uid}-arm)"/>
       <rect x="84" y="86" width="32" height="36" rx="8" fill="#d8c48a"/>
       <rect x="90" y="98" width="20" height="10" rx="2" fill="#3a2a12" opacity=".35"/>
       <circle cx="100" cy="92" r="4" fill="#ffe27a"/>
       <circle cx="52" cy="168" r="22" fill="url(#${uid}-arm)"/>
       <path d="M52 150 L52 128 M40 140 H64" stroke="#f7e7b0" stroke-width="5"/>
       <path d="M150 250 L158 120 L170 118 L176 250" fill="#c4a050"/>
       <path d="M154 108 L174 108 L164 78 Z" fill="#f4e27a"/>`,
    );
  },

  lich(uid) {
    return wrap(
      uid,
      g(uid, 'r', '0', '0', '0', '1', [[0, '#7a5cff'], [100, '#1a1030']]) +
        g(uid, 'sk', '0', '0', '0', '1', [[0, '#e8f0d8'], [100, '#8a9a70']]),
      `<path d="M48 260 L60 130 Q100 96 140 130 L152 260 Z" fill="url(#${uid}-r)"/>
       <ellipse cx="100" cy="108" rx="30" ry="34" fill="url(#${uid}-sk)"/>
       <path d="M78 88 L100 58 L122 88" fill="#2a1848"/>
       <ellipse cx="90" cy="108" rx="6" ry="8" fill="#1a0a18"/>
       <ellipse cx="110" cy="108" rx="6" ry="8" fill="#1a0a18"/>
       <circle cx="90" cy="108" r="3" fill="#7dffb2"/>
       <circle cx="110" cy="108" r="3" fill="#7dffb2"/>
       <path d="M88 128 L100 136 L112 128" fill="none" stroke="#4a5a38" stroke-width="2"/>
       <path d="M70 168 Q100 200 130 168" fill="none" stroke="#c9b6ff" stroke-width="3"/>
       <circle cx="54" cy="176" r="16" fill="#5dffc8" opacity=".55"/>
       <circle cx="54" cy="176" r="6" fill="#e8ffe8"/>
       <path d="M140 150 L168 80 L176 86 L150 160 Z" fill="#cbb6ff"/>`,
    );
  },

  duelist(uid) {
    return wrap(
      uid,
      g(uid, 'l', '0', '0', '0', '1', [[0, '#ff6b7a'], [100, '#4a1020']]) +
        g(uid, 'skin', '0', '0', '0', '1', [[0, '#e8b890'], [100, '#8a4a38']]),
      `<path d="M70 250 L78 150 L100 130 L122 150 L130 250 Z" fill="url(#${uid}-l)"/>
       <ellipse cx="100" cy="104" rx="24" ry="28" fill="url(#${uid}-skin)"/>
       <path d="M78 100 C76 64 124 60 122 100 C114 86 86 86 78 100 Z" fill="#1a0a10"/>
       <path d="M78 112 C70 128 86 138 100 122" fill="#1a0a10"/>
       <circle cx="108" cy="108" r="3.4" fill="#f4e8c8"/>
       <circle cx="108.5" cy="107" r="1.2" fill="#1a0808"/>
       <path d="M130 150 L186 92 L190 102 L140 168 Z" fill="#e8e0d0"/>
       <path d="M186 84 L198 70 L192 96 Z" fill="#c0a060"/>
       <path d="M60 168 L40 210 L70 180" fill="#7a1020"/>
       <circle cx="100" cy="156" r="8" fill="#ff4d62"/>`,
    );
  },

  matron(uid) {
    return wrap(
      uid,
      g(uid, 'p', '0', '0', '0', '1', [[0, '#c6e86a'], [50, '#3d7a28'], [100, '#1a3010']]) +
        g(uid, 'f', '0', '0', '1', '1', [[0, '#f2d278'], [100, '#8a4a10']]),
      `<path d="M100 40 C150 70 176 140 150 230 C130 260 70 260 50 230 C24 140 50 70 100 40 Z" fill="url(#${uid}-p)"/>
       <ellipse cx="100" cy="120" rx="36" ry="40" fill="#5ea33a"/>
       <circle cx="88" cy="118" r="6" fill="#e8ff8a"/>
       <circle cx="116" cy="118" r="6" fill="#e8ff8a"/>
       <circle cx="88" cy="118" r="3" fill="#1a2808"/>
       <circle cx="116" cy="118" r="3" fill="#1a2808"/>
       <path d="M84 140 Q100 156 116 140" fill="#204010"/>
       <path d="M40 90 L70 120 L44 128 Z" fill="url(#${uid}-f)"/>
       <path d="M160 90 L130 120 L156 128 Z" fill="url(#${uid}-f)"/>
       <path d="M100 168 L88 250 L112 250 Z" fill="#2a4a16"/>
       <circle cx="64" cy="200" r="14" fill="#8ad14a"/>
       <circle cx="140" cy="210" r="12" fill="#c6e86a"/>`,
    );
  },

  behemoth(uid) {
    return wrap(
      uid,
      g(uid, 'h', '0', '0', '0', '1', [[0, '#e09050'], [100, '#4a1808']]) +
        g(uid, 'm', '0', '0', '1', '0', [[0, '#ffd27a'], [100, '#a05020']]),
      `<ellipse cx="100" cy="180" rx="78" ry="62" fill="url(#${uid}-h)"/>
       <ellipse cx="100" cy="108" rx="52" ry="44" fill="url(#${uid}-h)"/>
       <path d="M58 86 L40 40 L70 78 Z" fill="#5a2010"/>
       <path d="M142 86 L160 40 L130 78 Z" fill="#5a2010"/>
       <circle cx="82" cy="104" r="8" fill="#ffef8a"/>
       <circle cx="118" cy="104" r="8" fill="#ffef8a"/>
       <circle cx="84" cy="104" r="3.5" fill="#2a1008"/>
       <circle cx="120" cy="104" r="3.5" fill="#2a1008"/>
       <path d="M70 128 Q100 148 130 128" fill="#2a1008"/>
       <path d="M30 200 Q50 150 70 190" fill="url(#${uid}-m)"/>
       <path d="M170 200 Q150 150 130 190" fill="url(#${uid}-m)"/>
       <path d="M86 148 L100 168 L114 148" fill="#ffb060"/>`,
    );
  },

  tyrant(uid) {
    return wrap(
      uid,
      g(uid, 'd', '0', '0', '0', '1', [[0, '#ff5a3a'], [40, '#8a1020'], [100, '#1a0508']]) +
        g(uid, 'h', '0', '0', '0', '1', [[0, '#3a0a10'], [100, '#100408']]) +
        rg(uid, 'hell', '50%', '40%', '50%', [[0, '#ffb070', 0.8], [100, '#8a0000', 0]]),
      `<ellipse cx="100" cy="130" rx="90" ry="100" fill="url(#${uid}-hell)"/>
       <path d="M30 250 L50 130 Q100 70 150 130 L170 250 Z" fill="url(#${uid}-d)"/>
       <path d="M70 92 L56 36 L86 78 M130 92 L144 36 L114 78" fill="#1a0808"/>
       <ellipse cx="100" cy="108" rx="32" ry="34" fill="#4a1820"/>
       <path d="M68 96 L100 70 L132 96" fill="url(#${uid}-h)"/>
       <circle cx="88" cy="110" r="6" fill="#ffef7a"/>
       <circle cx="112" cy="110" r="6" fill="#ffef7a"/>
       <circle cx="88" cy="111" r="2.5" fill="#4a0000"/>
       <circle cx="112" cy="111" r="2.5" fill="#4a0000"/>
       <path d="M84 130 Q100 142 116 130" fill="#1a0000"/>
       <path d="M40 150 L18 200 L52 170" fill="#ff3a20"/>
       <path d="M160 140 L188 70 L198 82 L172 160" fill="#c0a060"/>
       <circle cx="100" cy="168" r="16" fill="#ffb040"/>
       <path d="M100 152 L100 184 M86 168 H114" stroke="#6a1008" stroke-width="3"/>`,
    );
  },

  colossus(uid) {
    return wrap(
      uid,
      g(uid, 'g', '0', '0', '0', '1', [[0, '#fff4c8'], [40, '#e0c25a'], [100, '#6a5018']]) +
        rg(uid, 'core', '50%', '48%', '20%', [[0, '#fff'], [100, '#f0c040']]),
      `<rect x="48" y="70" width="104" height="170" rx="12" fill="url(#${uid}-g)"/>
       <rect x="62" y="36" width="76" height="52" rx="8" fill="url(#${uid}-g)"/>
       <rect x="78" y="48" width="44" height="22" rx="4" fill="#2a2410" opacity=".45"/>
       <circle cx="100" cy="58" r="6" fill="#fff6c0"/>
       <circle cx="100" cy="140" r="22" fill="url(#${uid}-core)"/>
       <path d="M100 118 L100 162 M80 140 H120" stroke="#a08030" stroke-width="4"/>
       <rect x="18" y="96" width="36" height="90" rx="8" fill="url(#${uid}-g)"/>
       <rect x="146" y="96" width="36" height="90" rx="8" fill="url(#${uid}-g)"/>
       <path d="M70 70 H130" stroke="#fff8d8" stroke-width="3"/>
       <circle cx="64" cy="112" r="5" fill="#ffe27a"/>
       <circle cx="136" cy="112" r="5" fill="#ffe27a"/>`,
    );
  },

  witch(uid) {
    return wrap(
      uid,
      g(uid, 'r', '0', '0', '0', '1', [[0, '#d48cff'], [100, '#2a0840']]) +
        g(uid, 'h', '0', '0', '0', '1', [[0, '#2a0820'], [100, '#000']]),
      `<path d="M40 260 L58 140 Q100 110 142 140 L160 260 Z" fill="url(#${uid}-r)"/>
       <ellipse cx="100" cy="112" rx="26" ry="30" fill="#e2b496"/>
       <path d="M60 108 C50 40 150 28 140 108 C120 70 80 70 60 108 Z" fill="url(#${uid}-h)"/>
       <path d="M48 96 L100 28 L152 96 L130 92 L100 54 L70 92 Z" fill="#1a0818"/>
       <circle cx="92" cy="114" r="3.2" fill="#c45cff"/>
       <circle cx="110" cy="114" r="3.2" fill="#c45cff"/>
       <path d="M92 128 Q100 134 108 128" stroke="#8a4060" stroke-width="2" fill="none"/>
       <path d="M150 150 L176 70 L168 150" fill="#6a208a"/>
       <circle cx="174" cy="64" r="12" fill="#b6ff7a" opacity=".8"/>
       <circle cx="58" cy="180" r="10" fill="#8d4dff" opacity=".7"/>
       <path d="M24 210 C60 170 40 240 24 210" fill="#3a1050"/>`,
    );
  },

  stalker(uid) {
    return wrap(
      uid,
      g(uid, 'cl', '0', '0', '0', '1', [[0, '#6a7a9a'], [100, '#101820']]) +
        rg(uid, 'rift', '70%', '40%', '40%', [[0, '#7a5cff', 0.65], [100, '#201040', 0]]),
      `<ellipse cx="130" cy="110" rx="60" ry="70" fill="url(#${uid}-rift)"/>
       <path d="M72 250 L80 150 L100 128 L118 150 L128 250 Z" fill="url(#${uid}-cl)"/>
       <ellipse cx="100" cy="108" rx="22" ry="26" fill="#1c2430"/>
       <path d="M80 100 C84 70 120 68 120 100" fill="#0a1018"/>
       <circle cx="108" cy="108" r="4" fill="#7dffe2"/>
       <path d="M108 108 L150 90" stroke="#7dffe2" stroke-width="2"/>
       <path d="M128 140 L170 100 L176 112 L136 156" fill="#c0c8d4"/>
       <path d="M64 168 L40 210 L72 184" fill="#2a3848"/>
       <path d="M90 70 L100 40 L110 70" fill="#7a5cff" opacity=".8"/>`,
    );
  },

  choir(uid) {
    return wrap(
      uid,
      g(uid, 'c', '0', '0', '0', '1', [[0, '#ff5a5a'], [100, '#5a0818']]) +
        g(uid, 'b', '0', '0', '0', '1', [[0, '#f0e6d2'], [100, '#9a8a70']]),
      `<path d="M46 255 L62 128 Q100 88 138 128 L154 255 Z" fill="url(#${uid}-c)"/>
       <ellipse cx="100" cy="108" rx="30" ry="34" fill="url(#${uid}-b)"/>
       <path d="M78 86 L100 50 L122 86" fill="#ff3a3a"/>
       <ellipse cx="88" cy="108" rx="6" ry="8" fill="#101010"/>
       <ellipse cx="112" cy="108" rx="6" ry="8" fill="#101010"/>
       <circle cx="88" cy="108" r="2.4" fill="#ffd27a"/>
       <circle cx="112" cy="108" r="2.4" fill="#ffd27a"/>
       <path d="M86 128 Q100 138 114 128" fill="none" stroke="#5a4030" stroke-width="2"/>
       <path d="M70 168 L50 220 L80 184" fill="#ffd27a" opacity=".7"/>
       <path d="M130 160 L160 96 L168 108 L140 176" fill="#f0d090"/>`,
    );
  },

  wyvern(uid) {
    return wrap(
      uid,
      g(uid, 'w', '0', '0', '1', '1', [[0, '#b8ffe0'], [50, '#3cb88a'], [100, '#0a4030']]) +
        g(uid, 'mem', '0', '0', '0', '1', [[0, '#e8fff4'], [100, '#5ad0a0']]),
      `<path d="M16 150 C50 40 90 70 100 110 C84 90 40 120 28 210 Z" fill="url(#${uid}-mem)"/>
       <path d="M184 150 C150 40 110 70 100 110 C116 90 160 120 172 210 Z" fill="url(#${uid}-mem)"/>
       <path d="M100 86 C124 100 132 170 114 230 C104 258 96 258 86 230 C68 170 76 100 100 86 Z" fill="url(#${uid}-w)"/>
       <ellipse cx="108" cy="92" rx="28" ry="22" fill="#4ad0a0"/>
       <path d="M128 80 L168 64 L134 96 Z" fill="#d8ffe8"/>
       <circle cx="118" cy="88" r="5" fill="#e8ff6a"/>
       <circle cx="119" cy="87" r="2" fill="#082018"/>
       <path d="M70 210 C90 250 130 250 120 210" fill="#0e5a40"/>`,
    );
  },

  countess(uid) {
    return wrap(
      uid,
      g(uid, 'g', '0', '0', '0', '1', [[0, '#e8c8ff'], [50, '#6a208a'], [100, '#1a0828']]) +
        g(uid, 'sk', '0', '0', '0', '1', [[0, '#f0c8d8'], [100, '#8a4060']]),
      `<path d="M36 260 L54 136 Q100 92 146 136 L164 260 Z" fill="url(#${uid}-g)"/>
       <path d="M20 210 C60 140 40 250 20 210" fill="#4a1060"/>
       <path d="M180 210 C140 140 160 250 180 210" fill="#4a1060"/>
       <ellipse cx="100" cy="108" rx="26" ry="30" fill="url(#${uid}-sk)"/>
       <path d="M74 100 C68 48 132 40 126 100 C116 78 84 78 74 100 Z" fill="#2a0820"/>
       <path d="M70 70 L100 28 L130 70 L118 66 L100 44 L82 66 Z" fill="#e8d27a"/>
       <circle cx="92" cy="110" r="3.4" fill="#7dffe2"/>
       <circle cx="110" cy="110" r="3.4" fill="#7dffe2"/>
       <path d="M90 126 Q100 134 110 126" stroke="#8a3050" fill="none" stroke-width="2"/>
       <path d="M148 150 L176 88 L184 98 L158 168" fill="#d8b0ff"/>
       <circle cx="100" cy="168" r="12" fill="#ff6ad2" opacity=".75"/>`,
    );
  },

  golem(uid) {
    return wrap(
      uid,
      g(uid, 'st', '0', '0', '0', '1', [[0, '#d8c090'], [50, '#8a6a40'], [100, '#3a2a14']]) +
        g(uid, 'rn', '0', '0', '1', '1', [[0, '#7dffb0'], [100, '#1a6a48']]),
      `<rect x="50" y="78" width="100" height="150" rx="16" fill="url(#${uid}-st)"/>
       <rect x="64" y="36" width="72" height="56" rx="10" fill="url(#${uid}-st)"/>
       <rect x="78" y="50" width="44" height="20" rx="4" fill="#1a140c" opacity=".5"/>
       <circle cx="88" cy="60" r="5" fill="#7dffb0"/>
       <circle cx="112" cy="60" r="5" fill="#7dffb0"/>
       <path d="M70 120 H130 M70 150 H130 M70 180 H130" stroke="url(#${uid}-rn)" stroke-width="4"/>
       <rect x="16" y="100" width="38" height="86" rx="10" fill="url(#${uid}-st)"/>
       <rect x="146" y="100" width="38" height="86" rx="10" fill="url(#${uid}-st)"/>
       <circle cx="100" cy="152" r="14" fill="#1a4030"/>
       <circle cx="100" cy="152" r="7" fill="#7dffb0"/>`,
    );
  },

  seraph(uid) {
    return wrap(
      uid,
      g(uid, 'w', '0', '0', '0', '1', [[0, '#fff'], [100, '#d8c878']]) +
        g(uid, 'a', '0', '0', '0', '1', [[0, '#fff6d8'], [100, '#c8a050']]) +
        rg(uid, 'h', '50%', '30%', '40%', [[0, '#fffce8', 1], [100, '#f0d060', 0]]),
      `<ellipse cx="100" cy="90" rx="80" ry="70" fill="url(#${uid}-h)"/>
       <path d="M10 150 C40 40 80 70 100 110 C70 80 24 110 18 200 Z" fill="url(#${uid}-w)"/>
       <path d="M190 150 C160 40 120 70 100 110 C130 80 176 110 182 200 Z" fill="url(#${uid}-w)"/>
       <path d="M70 250 L78 150 L100 130 L122 150 L130 250 Z" fill="url(#${uid}-a)"/>
       <ellipse cx="100" cy="104" rx="24" ry="28" fill="#f6d8b8"/>
       <path d="M78 96 C80 62 120 60 122 96" fill="#f4e8a0"/>
       <circle cx="92" cy="106" r="3" fill="#4a3018"/>
       <circle cx="108" cy="106" r="3" fill="#4a3018"/>
       <path d="M92 122 Q100 128 108 122" stroke="#c08070" fill="none" stroke-width="2"/>
       <path d="M100 40 L108 70 L100 64 L92 70 Z" fill="#ffe27a"/>
       <rect x="148" y="120" width="10" height="110" fill="#e8d080"/>`,
    );
  },

  plague(uid) {
    return wrap(
      uid,
      g(uid, 'p', '0', '0', '0', '1', [[0, '#d8ff6a'], [50, '#5a8a20'], [100, '#203010']]) +
        rg(uid, 'tox', '40%', '40%', '40%', [[0, '#c6ff4a', 0.8], [100, '#305010', 0]]),
      `<ellipse cx="90" cy="130" rx="80" ry="90" fill="url(#${uid}-tox)"/>
       <path d="M100 50 C160 80 170 170 130 240 C100 270 50 240 48 170 C46 100 70 60 100 50 Z" fill="url(#${uid}-p)"/>
       <ellipse cx="96" cy="120" rx="34" ry="32" fill="#7aaa30"/>
       <circle cx="84" cy="116" r="7" fill="#e8ff8a"/>
       <circle cx="112" cy="118" r="6" fill="#e8ff8a"/>
       <circle cx="84" cy="116" r="3" fill="#203008"/>
       <circle cx="112" cy="118" r="2.5" fill="#203008"/>
       <path d="M78 140 Q96 160 118 138" fill="#305010"/>
       <circle cx="40" cy="90" r="16" fill="#b6ff4a" opacity=".8"/>
       <circle cx="150" cy="160" r="18" fill="#8ad14a" opacity=".75"/>
       <circle cx="60" cy="210" r="12" fill="#e8ff8a" opacity=".7"/>`,
    );
  },

  drake(uid) {
    return wrap(
      uid,
      g(uid, 's', '0', '0', '1', '1', [[0, '#ffd27a'], [50, '#e05020'], [100, '#6a1208']]) +
        g(uid, 'w', '0', '0', '0', '1', [[0, '#ffefb0'], [100, '#c43010']]),
      `<path d="M20 180 C48 90 80 90 100 120 C78 110 40 140 32 220 Z" fill="url(#${uid}-w)"/>
       <path d="M100 90 C130 110 150 180 120 240 C108 264 92 250 86 220 C76 160 84 110 100 90 Z" fill="url(#${uid}-s)"/>
       <ellipse cx="124" cy="96" rx="30" ry="24" fill="#ff7a30"/>
       <path d="M144 84 L184 70 L152 102 Z" fill="#ffd27a"/>
       <circle cx="132" cy="94" r="5" fill="#fff2a0"/>
       <circle cx="133" cy="93" r="2" fill="#3a1008"/>
       <path d="M90 200 L70 250 L104 230" fill="#c43010"/>
       <path d="M108 150 L150 168 L110 172" fill="#ffb040"/>`,
    );
  },

  wraith(uid) {
    return wrap(
      uid,
      g(uid, 'i', '0', '0', '0', '1', [[0, '#e8f8ff'], [50, '#7ad0f0'], [100, '#1a4060']]) +
        rg(uid, 'c', '50%', '40%', '50%', [[0, '#f4ffff', 0.85], [100, '#8ad0ff', 0]]),
      `<ellipse cx="100" cy="120" rx="80" ry="90" fill="url(#${uid}-c)"/>
       <path d="M60 250 Q70 120 100 70 Q130 120 140 250 Q100 220 60 250 Z" fill="url(#${uid}-i)"/>
       <ellipse cx="100" cy="108" rx="28" ry="32" fill="#d8f0ff"/>
       <circle cx="90" cy="108" r="5" fill="#103048"/>
       <circle cx="112" cy="108" r="5" fill="#103048"/>
       <circle cx="91" cy="107" r="1.6" fill="#fff"/>
       <path d="M86 128 Q100 122 114 128" fill="none" stroke="#4a7088" stroke-width="2"/>
       <path d="M70 80 L60 40 L84 72 M130 80 L140 40 L116 72" fill="#c8f0ff"/>
       <path d="M40 170 C20 210 70 200 48 168" fill="#a8e0ff" opacity=".7"/>`,
    );
  },

  shard(uid) {
    return wrap(
      uid,
      g(uid, 'ice', '0', '0', '0', '1', [[0, '#f4ffff'], [40, '#9ad8f0'], [100, '#2a5080']]) +
        g(uid, 'arm', '0', '0', '1', '1', [[0, '#e8f8ff'], [100, '#5a88b0']]),
      `<path d="M48 250 L58 140 L100 118 L142 140 L152 250 Z" fill="url(#${uid}-arm)"/>
       <path d="M78 96 L100 36 L122 96 L114 108 L100 70 L86 108 Z" fill="url(#${uid}-ice)"/>
       <rect x="84" y="90" width="32" height="34" rx="6" fill="#c8e8f8"/>
       <rect x="90" y="100" width="20" height="8" fill="#2a4860" opacity=".4"/>
       <path d="M36 120 L16 70 L48 128 Z" fill="url(#${uid}-ice)"/>
       <path d="M164 120 L184 70 L152 128 Z" fill="url(#${uid}-ice)"/>
       <path d="M150 250 L158 108 L170 108 L176 250" fill="#d0eefc"/>
       <circle cx="100" cy="156" r="12" fill="#e8ffff"/>
       <circle cx="100" cy="156" r="5" fill="#7ad8ff"/>`,
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
      ${g(uid, 'bk', '0', '0', '0', '1', [[0, '#4a3018'], [100, '#1a1008']])}
      ${rg(uid, 'sg', '50%', '48%', '40%', [[0, '#f0d27a', 0.95], [100, '#8a6010', 0.1]])}
    </defs>
    <rect x="10" y="10" width="180" height="260" rx="12" fill="url(#${uid}-bk)" stroke="#d4b06a" stroke-width="4"/>
    <rect x="22" y="22" width="156" height="236" rx="8" fill="none" stroke="#8a6a30" stroke-width="2"/>
    <circle cx="100" cy="130" r="54" fill="none" stroke="#e8c56b" stroke-width="3"/>
    <path d="M100 78 L112 118 L154 118 L120 142 L132 184 L100 158 L68 184 L80 142 L46 118 L88 118 Z" fill="url(#${uid}-sg)" stroke="#5a4010" stroke-width="2"/>
    <text x="100" y="230" text-anchor="middle" fill="#e8c56b" font-size="14" font-family="Cinzel, serif">AETHERBOUND</text>
  </svg>`;
}

export function elementGlyph(element) {
  const icons = {
    fire: `<svg viewBox="0 0 32 32"><path d="M16 4 C18 12 10 14 12 22 C13 26 19 26 20 20 C22 12 14 12 16 4 Z" fill="#ff6a1a" stroke="#7a1800" stroke-width="1.5"/><path d="M16 14 C17 18 14 18 15 22 C16 24 18 23 18 20" fill="#ffd27a"/></svg>`,
    ice: `<svg viewBox="0 0 32 32"><path d="M16 4 L16 28 M6 10 L26 22 M26 10 L6 22 M8 16 H24" stroke="#d8f8ff" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="16" r="4" fill="#9ad8f0" stroke="#2a5080"/></svg>`,
    water: `<svg viewBox="0 0 32 32"><path d="M16 5 C16 5 6 16 6 21 C6 26 10.5 29 16 29 C21.5 29 26 26 26 21 C26 16 16 5 16 5 Z" fill="#4ec4ff" stroke="#0a4060" stroke-width="1.5"/><ellipse cx="13" cy="20" rx="3" ry="4" fill="#e8ffff" opacity=".7"/></svg>`,
    wind: `<svg viewBox="0 0 32 32"><path d="M6 12 H22 C26 12 26 6 21 7 M6 16 H24 C28 16 28 22 22 21 M6 20 H18" fill="none" stroke="#d8ffe8" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    earth: `<svg viewBox="0 0 32 32"><path d="M8 22 L16 8 L24 22 Z" fill="#c4a060" stroke="#4a3010" stroke-width="1.5"/><path d="M12 22 L16 14 L20 22 Z" fill="#8a6a38"/><ellipse cx="16" cy="24" rx="10" ry="3" fill="#6a4a20"/></svg>`,
    thunder: `<svg viewBox="0 0 32 32"><path d="M18 4 L10 16 H16 L12 28 L24 12 H18 Z" fill="#ffe14d" stroke="#8a6a00" stroke-width="1.4"/></svg>`,
    holy: `<svg viewBox="0 0 32 32"><path d="M16 4 L18 12 L26 12 L20 17 L22 26 L16 21 L10 26 L12 17 L6 12 L14 12 Z" fill="#fff4c8" stroke="#a08030" stroke-width="1.3"/></svg>`,
    dark: `<svg viewBox="0 0 32 32"><path d="M18 6 C10 8 6 16 10 24 C16 30 26 26 26 18 C18 20 16 12 18 6 Z" fill="#3a2060" stroke="#d8b0ff" stroke-width="1.4"/><circle cx="20" cy="14" r="2" fill="#e8d27a"/></svg>`,
    poison: `<svg viewBox="0 0 32 32"><circle cx="12" cy="14" r="6" fill="#b6ff4a" stroke="#305010"/><circle cx="20" cy="20" r="7" fill="#7ad14a" stroke="#305010"/><circle cx="16" cy="10" r="4" fill="#e8ff8a"/></svg>`,
  };
  return icons[element] || '';
}
