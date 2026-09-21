import { useId } from 'react'
import { useTenant } from '../../store/TenantContext'

/**
 * Ürün "stüdyo çekimi" yerine geçen SVG ambalaj çizimleri.
 * Gerçek fotoğraflar geldiğinde bu bileşen <img> ile değiştirilir;
 * arayüzün geri kalanı aynı kalır.
 */

const TONES = {
  steel: { deep: '#161B20', base: '#2F3842', mid: '#4E5A67', light: '#7D8894', foil: '#C4122F' },
  copper: { deep: '#6E3A1F', base: '#8C4A28', mid: '#B4633A', light: '#D08A5E', foil: '#F0DFA8' },
  crimson: { deep: '#6C0A19', base: '#8E0C21', mid: '#C4122F', light: '#E4636F', foil: '#F6F7F8' },
  clay: { deep: '#6E2C27', base: '#8B3A33', mid: '#A8443C', light: '#C4695F', foil: '#F0DFA8' },
  ink: { deep: '#0E1114', base: '#191D21', mid: '#2F3842', light: '#4E5A67', foil: '#C4122F' },
}

/* --------------------------------------------------- ortak parçalar */

function Backdrop({ id, tone }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="60%" stopColor="#F6F0E5" />
          <stop offset="100%" stopColor="#E1E4E8" />
        </radialGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor={tone.base} />
          <stop offset="42%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.deep} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tone.foil} stopOpacity="0.95" />
          <stop offset="50%" stopColor={tone.foil} />
          <stop offset="100%" stopColor={tone.foil} stopOpacity="0.75" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#232930" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#232930" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#232930" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}-bg)`} />
      <ellipse cx="200" cy="332" rx="118" ry="20" fill={`url(#${id}-shadow)`} />
    </>
  )
}

/** Küçük altın rozet — ambalaj etiketi */
function Seal({ id, x, y, r = 22, tone, text = '1299' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="none" stroke={`url(#${id}-foil)`} strokeWidth="1.2" opacity="0.9" />
      <circle r={Math.max(1, r - 4)} fill="none" stroke={`url(#${id}-foil)`} strokeWidth="0.6" opacity="0.55" />
      <text
        y={r * 0.22}
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize={r * 0.72}
        fontWeight="700"
        fill={tone.foil}
      >
        {text}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------ kahve paketi */

function Bag({ id, tone, labels }) {
  return (
    <>
      {/* gövde */}
      <path
        d="M126 128 L274 128 L286 316 Q286 324 278 324 L122 324 Q114 324 114 316 Z"
        fill={`url(#${id}-face)`}
      />
      {/* yan kıvrım */}
      <path d="M126 128 L146 128 L156 324 L122 324 Q114 324 114 316 Z" fill="#000" opacity="0.16" />
      <path d="M258 128 L274 128 L286 316 Q286 324 278 324 L262 324 Z" fill="#fff" opacity="0.06" />
      <path
        d="M126 128 L274 128 L286 316 Q286 324 278 324 L122 324 Q114 324 114 316 Z"
        fill={`url(#${id}-sheen)`}
      />
      {/* üst kıvrım / tin-tie */}
      <path d="M118 104 L282 104 L280 130 L120 130 Z" fill={tone.deep} />
      <path d="M118 104 L282 104 L281 112 L119 112 Z" fill="#fff" opacity="0.10" />
      <g stroke={tone.foil} strokeWidth="1" opacity="0.35">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={i} x1={126 + i * 11} y1="106" x2={126 + i * 11} y2="128" />
        ))}
      </g>
      {/* etiket alanı */}
      <rect x="146" y="168" width="108" height="112" rx="3" fill="#F6F7F8" opacity="0.96" />
      <rect x="150" y="172" width="100" height="104" rx="2" fill="none" stroke={tone.base} strokeWidth="0.8" opacity="0.45" />
      <line x1="160" y1="196" x2="240" y2="196" stroke={tone.foil} strokeWidth="1" opacity="0.8" />
      <path d="M196 193 l4 3 -4 3 -4 -3 z" fill={tone.foil} />
      <text
        x="200" y="188" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="13" fontWeight="700" letterSpacing="2.4"
        fill={tone.base}
      >
        {labels.pack}
      </text>
      <text x="200" y="222" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fill="#67707A" letterSpacing="1.6">
        {labels.packSub}
      </text>
      <text x="200" y="238" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" fill="#8A939D" letterSpacing="1.2">
        %100 ARABICA
      </text>
      <Seal id={id} x={200} y={258} r={15} tone={{ ...tone, foil: tone.base }} text={labels.emblem} />
      {/* valf */}
      <circle cx="200" cy="300" r="9" fill={tone.deep} opacity="0.55" />
      <circle cx="200" cy="300" r="4" fill={tone.deep} />
    </>
  )
}

/* --------------------------------------------------------- hediye kutusu */

function GiftSet({ id, tone, labels }) {
  return (
    <>
      {/* kutu gövdesi */}
      <path d="M104 186 L296 186 L286 314 Q285 322 277 322 L123 322 Q115 322 114 314 Z" fill={`url(#${id}-face)`} />
      <path d="M104 186 L136 186 L146 322 L123 322 Q115 322 114 314 Z" fill="#000" opacity="0.14" />
      <path d="M104 186 L296 186 L286 314 Q285 322 277 322 L123 322 Q115 322 114 314 Z" fill={`url(#${id}-sheen)`} />
      {/* kapak */}
      <path d="M96 152 L304 152 L300 192 L100 192 Z" fill={tone.deep} />
      <path d="M96 152 L304 152 L303 160 L97 160 Z" fill="#fff" opacity="0.12" />
      {/* kurdele — dikey */}
      <rect x="186" y="152" width="28" height="170" fill={tone.foil} opacity="0.92" />
      <rect x="186" y="152" width="9" height="170" fill="#fff" opacity="0.20" />
      {/* fiyonk */}
      <path d="M200 150 q-34 -26 -50 -6 q-8 12 14 16 q18 4 36 -10 z" fill={tone.foil} />
      <path d="M200 150 q34 -26 50 -6 q8 12 -14 16 q-18 4 -36 -10 z" fill={tone.foil} />
      <path d="M200 150 q34 -26 50 -6 q8 12 -14 16 z" fill="#000" opacity="0.12" />
      <circle cx="200" cy="150" r="9" fill={tone.foil} />
      <circle cx="200" cy="150" r="9" fill="#000" opacity="0.10" />
      {/* fincanlar */}
      <g transform="translate(0 6)">
        <path d="M138 250 q0 32 22 32 q22 0 22 -32 z" fill="#F6F7F8" />
        <ellipse cx="160" cy="250" rx="22" ry="6" fill="#fff" />
        <ellipse cx="160" cy="250" rx="16" ry="4" fill={tone.deep} opacity="0.85" />
        <path d="M138 252 h44" stroke={tone.foil} strokeWidth="1.6" />
        <path d="M218 250 q0 32 22 32 q22 0 22 -32 z" fill="#F6F7F8" />
        <ellipse cx="240" cy="250" rx="22" ry="6" fill="#fff" />
        <ellipse cx="240" cy="250" rx="16" ry="4" fill={tone.deep} opacity="0.85" />
        <path d="M218 252 h44" stroke={tone.foil} strokeWidth="1.6" />
      </g>
      <text x="200" y="212" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" letterSpacing="2.6" fill={tone.foil}>
        HEDİYE SETİ
      </text>
    </>
  )
}

/* ------------------------------------------------------------- fincanlar */

function Cups({ id, tone, labels }) {
  const cup = (cx, cy, s) => (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {/* tabak */}
      <ellipse cx="0" cy="62" rx="62" ry="15" fill="#F0E9DC" />
      <ellipse cx="0" cy="59" rx="62" ry="15" fill="#FBFCFC" />
      <ellipse cx="0" cy="59" rx="46" ry="10" fill="#F2ECE0" />
      <ellipse cx="0" cy="59" rx="54" ry="12.5" fill="none" stroke={tone.foil} strokeWidth="1.2" opacity="0.85" />
      {/* kulp */}
      <path d="M38 14 q26 4 24 22 q-2 16 -24 16" fill="none" stroke="#FBFCFC" strokeWidth="9" strokeLinecap="round" />
      <path d="M38 14 q26 4 24 22 q-2 16 -24 16" fill="none" stroke={tone.foil} strokeWidth="1.4" opacity="0.6" />
      {/* gövde */}
      <path d="M-40 0 q2 52 40 52 q38 0 40 -52 z" fill="#FBFCFC" />
      <path d="M6 0 q-2 52 -6 52 q38 0 40 -52 z" fill="#EFE8DA" opacity="0.7" />
      <ellipse cx="0" cy="0" rx="40" ry="11" fill="#fff" />
      <ellipse cx="0" cy="0" rx="33" ry="8.5" fill={tone.deep} />
      <ellipse cx="0" cy="-1" rx="33" ry="8.5" fill="none" stroke="#C08A4A" strokeWidth="1" opacity="0.5" />
      {/* altın bordür */}
      <path d="M-40 6 q1 4 1 6 q40 8 78 0 q1 -2 1 -6" fill="none" stroke={tone.foil} strokeWidth="2" opacity="0.9" />
      <ellipse cx="0" cy="0" rx="40" ry="11" fill="none" stroke={tone.foil} strokeWidth="1.6" />
    </g>
  )
  return (
    <>
      {cup(146, 214, 0.78)}
      {cup(252, 190, 0.92)}
    </>
  )
}

/* ----------------------------------------------------------------- cezve */

function Cezve({ id, tone, labels }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-cu`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8C4A28" />
          <stop offset="22%" stopColor="#E0A574" />
          <stop offset="45%" stopColor="#B4633A" />
          <stop offset="72%" stopColor="#D89465" />
          <stop offset="100%" stopColor="#7A3E20" />
        </linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7B5433" />
          <stop offset="45%" stopColor="#5C3D24" />
          <stop offset="100%" stopColor="#422C1A" />
        </linearGradient>
      </defs>
      {/* sap */}
      <rect x="252" y="176" width="118" height="13" rx="6" fill={`url(#${id}-wood)`} transform="rotate(-9 252 176)" />
      <rect x="252" y="176" width="118" height="4" rx="2" fill="#fff" opacity="0.10" transform="rotate(-9 252 176)" />
      <rect x="246" y="172" width="18" height="21" rx="3" fill="#6E3A1F" transform="rotate(-9 246 172)" />
      {/* gövde */}
      <path d="M132 176 L268 176 L246 300 Q244 314 230 314 L170 314 Q156 314 154 300 Z" fill={`url(#${id}-cu)`} />
      {/* ağız */}
      <ellipse cx="200" cy="176" rx="68" ry="17" fill="#C87B4A" />
      <ellipse cx="200" cy="176" rx="68" ry="17" fill="none" stroke="#8C4A28" strokeWidth="1.5" />
      <ellipse cx="200" cy="177" rx="58" ry="13" fill="#3E2314" />
      <ellipse cx="200" cy="177" rx="52" ry="11" fill="#5A3620" />
      {/* köpük */}
      <ellipse cx="200" cy="176" rx="44" ry="9" fill="#C08A52" opacity="0.85" />
      <ellipse cx="186" cy="174" rx="16" ry="4.5" fill="#D8AC79" opacity="0.9" />
      {/* emzik */}
      <path d="M132 176 q-22 -4 -26 8 q14 4 26 2 z" fill="#B4633A" />
      {/* çekiç izleri */}
      <g fill="#fff" opacity="0.11">
        {Array.from({ length: 22 }, (_, i) => (
          <ellipse key={i} cx={152 + (i % 6) * 19} cy={200 + Math.floor(i / 6) * 26} rx="7" ry="4.5" />
        ))}
      </g>
      <path d="M132 176 L268 176 L246 300 Q244 314 230 314 L170 314 Q156 314 154 300 Z" fill={`url(#${id}-sheen)`} />
      {/* taban */}
      <ellipse cx="200" cy="312" rx="44" ry="9" fill="#7A3E20" />
    </>
  )
}

/* ----------------------------------------------------------------- lokum */

function Lokum({ id, tone, labels }) {
  const cube = (x, y, s = 1, r = 0) => (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
      <path d="M-22 -14 L22 -14 L22 16 L-22 16 Z" fill={tone.mid} />
      <path d="M-22 -14 L-8 -24 L36 -24 L22 -14 Z" fill={tone.light} />
      <path d="M22 -14 L36 -24 L36 6 L22 16 Z" fill={tone.deep} />
      {/* pudra şekeri */}
      <path d="M-22 -14 L22 -14 L22 16 L-22 16 Z" fill="#fff" opacity="0.30" />
      <path d="M-22 -14 L-8 -24 L36 -24 L22 -14 Z" fill="#fff" opacity="0.42" />
      {/* fıstık */}
      <ellipse cx="-6" cy="0" rx="6" ry="4.5" fill="#5E8C3A" opacity="0.85" transform="rotate(-18)" />
      <ellipse cx="10" cy="8" rx="5" ry="4" fill="#6E9C45" opacity="0.8" transform="rotate(24)" />
    </g>
  )
  return (
    <>
      {/* kutu */}
      <path d="M92 214 L308 214 L296 316 Q295 324 287 324 L113 324 Q105 324 104 316 Z" fill={`url(#${id}-face)`} />
      <path d="M92 214 L124 214 L134 324 L113 324 Q105 324 104 316 Z" fill="#000" opacity="0.16" />
      {/* kutu iç kenarı */}
      <path d="M92 214 L308 214 L302 232 L98 232 Z" fill="#000" opacity="0.28" />
      {/* açık kapak arkada */}
      <path d="M104 214 L296 214 L286 158 L114 158 Z" fill={tone.deep} opacity="0.9" />
      <path d="M104 214 L296 214 L286 158 L114 158 Z" fill={`url(#${id}-sheen)`} />
      <text x="200" y="192" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" letterSpacing="3" fill={tone.foil}>
        {labels.lokum}
      </text>
      <line x1="152" y1="200" x2="248" y2="200" stroke={tone.foil} strokeWidth="0.9" opacity="0.7" />
      {/* küpler */}
      {cube(150, 258, 1, -3)}
      {cube(204, 254, 1, 2)}
      {cube(256, 260, 1, -1)}
      {cube(176, 296, 0.94, 4)}
      {cube(232, 298, 0.94, -4)}
      {/* pudra tozu */}
      <g fill="#fff" opacity="0.45">
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={112 + ((i * 37) % 180)} cy={240 + ((i * 53) % 78)} r={(i % 3) * 0.7 + 0.7} />
        ))}
      </g>
      <path d="M92 214 L308 214 L296 316 Q295 324 287 324 L113 324 Q105 324 104 316 Z" fill={`url(#${id}-sheen)`} />
    </>
  )
}

/* --------------------------------------------------------------- kolonya */

function Kolonya({ id, tone, labels }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={tone.deep} stopOpacity="0.85" />
          <stop offset="18%" stopColor={tone.light} stopOpacity="0.55" />
          <stop offset="42%" stopColor={tone.mid} stopOpacity="0.75" />
          <stop offset="78%" stopColor={tone.base} stopOpacity="0.9" />
          <stop offset="100%" stopColor={tone.deep} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      {/* mantar */}
      <rect x="182" y="70" width="36" height="26" rx="4" fill="#C9A46B" />
      <rect x="182" y="70" width="12" height="26" rx="4" fill="#fff" opacity="0.20" />
      <rect x="178" y="92" width="44" height="10" rx="3" fill="#8E0C21" />
      {/* boyun */}
      <path d="M186 100 L214 100 L214 138 L186 138 Z" fill={`url(#${id}-glass)`} />
      {/* omuz + gövde */}
      <path d="M186 136 Q186 152 160 168 Q142 180 142 204 L142 300 Q142 316 158 316 L242 316 Q258 316 258 300 L258 204 Q258 180 240 168 Q214 152 214 136 Z" fill={`url(#${id}-glass)`} />
      {/* cam parlaması */}
      <path d="M158 186 q-8 12 -8 26 l0 92 q0 6 6 6 l8 0 l0 -124 z" fill="#fff" opacity="0.28" />
      <path d="M242 190 l0 118 q0 6 -6 6 l-4 0 l0 -126 z" fill="#fff" opacity="0.12" />
      {/* sıvı seviyesi */}
      <path d="M144 220 L256 220 L256 300 Q256 314 242 314 L158 314 Q144 314 144 300 Z" fill={tone.light} opacity="0.28" />
      {/* etiket */}
      <rect x="150" y="214" width="100" height="72" rx="3" fill="#F6F7F8" opacity="0.97" />
      <rect x="154" y="218" width="92" height="64" rx="2" fill="none" stroke={tone.base} strokeWidth="0.7" opacity="0.5" />
      <text x="200" y="238" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" letterSpacing="1.8" fill={tone.base}>
        {labels.kolonya}
      </text>
      <line x1="166" y1="246" x2="234" y2="246" stroke={tone.base} strokeWidth="0.8" opacity="0.5" />
      <text x="200" y="262" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8.5" letterSpacing="1.4" fill="#67707A">
        {labels.cityLine} · 80°
      </text>
      <text x="200" y="276" textAnchor="middle" fontFamily="Georgia, serif" fontSize="7.5" letterSpacing="1.2" fill="#8A939D">
        200 ml
      </text>
    </>
  )
}

/* ---------------------------------------------------------------- şerbet */

function Serbet({ id, tone, labels }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-liq`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5E2B12" />
          <stop offset="30%" stopColor="#9A4A1E" />
          <stop offset="60%" stopColor="#7A3714" />
          <stop offset="100%" stopColor="#4A2210" />
        </linearGradient>
      </defs>
      {/* kapak */}
      <rect x="184" y="66" width="32" height="14" rx="3" fill="#C4122F" />
      <rect x="188" y="78" width="24" height="8" rx="2" fill="#A80E27" />
      {/* boyun */}
      <path d="M188 84 L212 84 L212 124 L188 124 Z" fill="#D8C9A8" opacity="0.55" />
      {/* gövde */}
      <path d="M188 122 Q188 140 166 154 Q148 166 148 192 L148 302 Q148 316 162 316 L238 316 Q252 316 252 302 L252 192 Q252 166 234 154 Q212 140 212 122 Z" fill="#EDE3CE" opacity="0.6" />
      {/* içerik */}
      <path d="M152 176 Q152 168 160 162 L240 162 Q248 168 248 176 L248 300 Q248 312 236 312 L164 312 Q152 312 152 300 Z" fill={`url(#${id}-liq)`} />
      <path d="M168 172 l0 132 q0 4 4 4 l6 0 l0 -136 z" fill="#fff" opacity="0.18" />
      {/* etiket */}
      <rect x="156" y="206" width="88" height="70" rx="3" fill="#F6F7F8" opacity="0.97" />
      <text x="200" y="228" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10.5" fontWeight="700" letterSpacing="1.6" fill="#7A3714">
        {labels.serbet}
      </text>

      <line x1="172" y1="250" x2="228" y2="250" stroke="#C4122F" strokeWidth="1" />
      <text x="200" y="266" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" letterSpacing="1.3" fill="#67707A">
        DEMİRHİNDİ · 500 ml
      </text>
      {/* buz/çiy */}
      <g fill="#fff" opacity="0.32">
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={158 + ((i * 43) % 84)} cy={286 + ((i * 29) % 22)} r={(i % 3) * 0.9 + 1} />
        ))}
      </g>
    </>
  )
}

/* ----------------------------------------------------------------- sepet */

function Hamper({ id, tone, labels }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wicker`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8A6836" />
          <stop offset="35%" stopColor="#C09B5E" />
          <stop offset="70%" stopColor="#A5824A" />
          <stop offset="100%" stopColor="#75572C" />
        </linearGradient>
      </defs>
      {/* arkadaki ürünler */}
      <g transform="translate(0 -8)">
        <path d="M136 156 L182 156 L188 236 L130 236 Z" fill={tone.base} />
        <path d="M136 156 L150 156 L154 236 L130 236 Z" fill="#000" opacity="0.18" />
        <rect x="142" y="178" width="34" height="34" rx="2" fill="#F6F7F8" opacity="0.95" />
        <text x="159" y="200" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fontWeight="700" fill={tone.base}>{labels.initial}</text>

        <path d="M218 148 L264 148 L270 236 L212 236 Z" fill="#8B3A33" />
        <path d="M218 148 L232 148 L236 236 L212 236 Z" fill="#000" opacity="0.18" />
        <rect x="224" y="172" width="34" height="34" rx="2" fill="#F6F7F8" opacity="0.95" />
        <text x="241" y="194" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fontWeight="700" fill="#8B3A33">{labels.initial}</text>

        {/* kolonya şişesi */}
        <rect x="272" y="168" width="26" height="68" rx="4" fill="#3E4954" opacity="0.9" />
        <rect x="280" y="154" width="10" height="16" rx="2" fill="#C9A46B" />
        <rect x="276" y="188" width="18" height="24" rx="2" fill="#F6F7F8" opacity="0.9" />
      </g>
      {/* sepet gövdesi */}
      <path d="M96 232 L304 232 L286 314 Q284 324 274 324 L126 324 Q116 324 114 314 Z" fill={`url(#${id}-wicker)`} />
      {/* örgü dokusu */}
      <g stroke="#6B4E27" strokeWidth="1.3" opacity="0.5">
        {Array.from({ length: 5 }, (_, r) => (
          <path key={r} d={`M${100 + r * 2} ${248 + r * 16} L${300 - r * 2} ${248 + r * 16}`} />
        ))}
      </g>
      <g stroke="#6B4E27" strokeWidth="1.1" opacity="0.35">
        {Array.from({ length: 17 }, (_, c) => (
          <line key={c} x1={104 + c * 12} y1="234" x2={110 + c * 11.4} y2="322" />
        ))}
      </g>
      {/* kenar bandı */}
      <rect x="94" y="224" width="212" height="16" rx="8" fill="#B08B4E" />
      <rect x="94" y="224" width="212" height="6" rx="3" fill="#fff" opacity="0.18" />
      {/* kurdele */}
      <rect x="186" y="232" width="28" height="92" fill="#C4122F" opacity="0.9" />
      <rect x="186" y="232" width="9" height="92" fill="#fff" opacity="0.22" />
      <path d="M96 232 L304 232 L286 314 Q284 324 274 324 L126 324 Q116 324 114 314 Z" fill={`url(#${id}-sheen)`} />
    </>
  )
}

/* ------------------------------------------------------------------ ana */

const SHAPES = {
  bag: Bag,
  giftset: GiftSet,
  cups: Cups,
  cezve: Cezve,
  lokum: Lokum,
  kolonya: Kolonya,
  serbet: Serbet,
  hamper: Hamper,
}

export default function ProductImage({ art = 'bag', tone = 'steel', className = '', title }) {
  const uid = useId().replace(/:/g, '')
  const { brand } = useTenant()
  const palette = TONES[tone] ?? TONES.steel
  const Shape = SHAPES[art] ?? Bag
  // Ambalaj üstündeki yazılar markadan gelir
  const labels = {
    ...brand.packLabels,
    emblem: brand.emblemText,
    initial: brand.emblemText.slice(0, 1),
  }

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label={title ? `${title} ürün görseli` : 'Ürün görseli'}
      preserveAspectRatio="xMidYMid slice"
    >
      {title ? <title>{title}</title> : null}
      <Backdrop id={uid} tone={palette} />
      <Shape id={uid} tone={palette} labels={labels} />
    </svg>
  )
}

export { TONES }
