import { useState, useRef, useEffect, forwardRef } from 'react'
import BuyFishModal from './BuyFishModal'
import FishIcon from './FishIcon'
import { API } from '../lib/api'
import { tinhLevel } from '../utils/playerLevel'

const HIEM = {
  common:    { nhan: 'Phổ biến',       mau: '#9ca3af' },
  uncommon:  { nhan: 'Không phổ biến', mau: '#4ade80' },
  rare:      { nhan: 'Hiếm',           mau: '#3b82f6' },
  epic:      { nhan: 'Sử thi',         mau: '#a855f7' },
  legendary: { nhan: 'Huyền thoại',    mau: '#ef4444' },
}

// common→uncommon→rare→epic
const LOAI_CA_SHOP = [
  { loai_ca: 'ca_vang',      ten: 'Cá Vàng',  hiem: 'common',   gia: 0,   coin5ph: 1 },
  { loai_ca: 'ca_neon',      ten: 'Cá Neon',  hiem: 'common',   gia: 0,   coin5ph: 1 },
  { loai_ca: 'ca_betta',     ten: 'Cá Betta', hiem: 'uncommon', gia: 80,  coin5ph: 2 },
  { loai_ca: 'ca_clownfish', ten: 'Cá Hề',    hiem: 'uncommon', gia: 80,  coin5ph: 2 },
  { loai_ca: 'ca_tang',      ten: 'Cá Tang',  hiem: 'rare',     gia: 200, coin5ph: 4 },
  { loai_ca: 'ca_koi',       ten: 'Cá Koi',   hiem: 'rare',     gia: 200, coin5ph: 4 },
  { loai_ca: 'ca_chep',      ten: 'Cá Chép',  hiem: 'epic',     gia: 450, coin5ph: 8 },
  { loai_ca: 'ca_dia',       ten: 'Cá Đĩa',   hiem: 'epic',     gia: 450, coin5ph: 8 },
]

const BACKGROUNDS = [
  { id: 'ocean-shallow', ten: 'Đại dương',  nuoc: ['#0a1628','#0d2240','#0f2d4a'], tia: [100,180,255,0.033] },
  { id: 'ocean-deep',    ten: 'Biển thẳm',  nuoc: ['#020818','#041030','#060c20'], tia: [60, 120,200,0.022] },
  { id: 'coral-reef',    ten: 'Rạn san hô', nuoc: ['#1a0a2e','#2d1b4e','#3d1a0a'], tia: [180,100,255,0.028] },
  { id: 'twilight',      ten: 'Hoàng hôn',  nuoc: ['#3d2010','#0a0a1a','#2d1040'], tia: [255,150,80, 0.022] },
  { id: 'tropical',      ten: 'Nhiệt đới',  nuoc: ['#0a2818','#0d3d20','#0a2d18'], tia: [80, 200,100,0.028] },
  { id: 'sunset',        ten: 'Đêm muộn',   nuoc: ['#050508','#0a0a10','#080810'], tia: [100,80, 200,0.018] },
]

const DAY_HO_LIST = [
  { id: 'cat_trang', ten: 'Cát trắng', s1: '#c4a882', s2: '#a08660' },
  { id: 'cat_vang',  ten: 'Cát vàng',  s1: '#d4a853', s2: '#b8863a' },
  { id: 'soi_den',   ten: 'Sỏi đen',   s1: '#4a4a5a', s2: '#2a2a38' },
  { id: 'san_ho',    ten: 'San hô',     s1: '#cc6655', s2: '#994040' },
]

// ── Decoration SVG icons — colours match AquariumCanvas draw functions ──

function RongBienIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 64" fill="none">
      {/* left stalk */}
      <path d="M 21 62 Q 15 48 23 30" stroke="rgba(25,130,55,0.92)" strokeWidth="3.5" strokeLinecap="round"/>
      <ellipse cx="20.5" cy="42" rx="7" ry="2.6" transform="rotate(22 20.5 42)" fill="rgba(30,150,60,0.78)"/>
      <ellipse cx="22.5" cy="32" rx="5.5" ry="2" transform="rotate(-18 22.5 32)" fill="rgba(30,150,60,0.68)"/>
      {/* right stalk (taller) */}
      <path d="M 37 62 Q 45 44 39 16" stroke="rgba(35,110,45,0.88)" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="41" cy="42" rx="6.5" ry="2.2" transform="rotate(28 41 42)" fill="rgba(40,130,50,0.75)"/>
      <ellipse cx="40" cy="27" rx="5" ry="1.8" transform="rotate(-14 40 27)" fill="rgba(40,130,50,0.65)"/>
    </svg>
  )
}

function SanHoCayIcon({ size = 48 }) {
  // depth 3 → rgba(166,139,90), depth 2 → rgba(184,111,90), depth 1 → rgba(202,83,90)
  return (
    <svg width={size} height={size} viewBox="0 0 60 64" fill="none">
      <line x1="30" y1="62" x2="30" y2="44" stroke="rgba(166,139,90,0.75)" strokeWidth="5" strokeLinecap="round"/>
      <line x1="30" y1="46" x2="17" y2="30" stroke="rgba(184,111,90,0.82)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="30" y1="46" x2="43" y2="30" stroke="rgba(184,111,90,0.82)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="17" y1="30" x2="8"  y2="16" stroke="rgba(202,83,90,0.88)"  strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="17" y1="30" x2="26" y2="16" stroke="rgba(202,83,90,0.88)"  strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="43" y1="30" x2="34" y2="16" stroke="rgba(202,83,90,0.88)"  strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="43" y1="30" x2="52" y2="16" stroke="rgba(202,83,90,0.88)"  strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
}

function DaCuoiIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="dcA" cx="28%" cy="28%"><stop offset="0%" stopColor="#909aa8"/><stop offset="100%" stopColor="#4a5265"/></radialGradient>
        <radialGradient id="dcB" cx="28%" cy="28%"><stop offset="0%" stopColor="#909aa8"/><stop offset="100%" stopColor="#4a5265"/></radialGradient>
        <radialGradient id="dcC" cx="28%" cy="28%"><stop offset="0%" stopColor="#909aa8"/><stop offset="100%" stopColor="#4a5265"/></radialGradient>
      </defs>
      <ellipse cx="20" cy="40" rx="14" ry="9"  transform="rotate(12 20 40)"  fill="url(#dcA)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6"/>
      <ellipse cx="42" cy="41" rx="12" ry="8"  transform="rotate(-10 42 41)" fill="url(#dcB)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6"/>
      <ellipse cx="30" cy="30" rx="10" ry="7"  transform="rotate(5 30 30)"   fill="url(#dcC)" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6"/>
    </svg>
  )
}

function KhoBauIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <ellipse cx="30" cy="56" rx="23" ry="5" fill="rgba(0,0,0,0.15)"/>
      {/* body */}
      <rect x="5" y="36" width="50" height="16" rx="2" fill="#6b3d15"/>
      <rect x="11" y="39" width="38" height="11" rx="1" fill="#8a4f1a"/>
      {/* dome lid */}
      <path d="M 5 36 C 5 14 55 14 55 36 Z" fill="#7a4018"/>
      {/* gold band across hinge */}
      <line x1="5" y1="36" x2="55" y2="36" stroke="rgba(230,175,20,0.9)" strokeWidth="2.8"/>
      {/* gold arc on lid */}
      <path d="M 5 36 C 5 14 55 14 55 36" stroke="rgba(230,175,20,0.85)" strokeWidth="2.8" fill="none"/>
      {/* lock */}
      <circle cx="30" cy="36" r="5" fill="rgba(230,185,25,0.95)"/>
      {/* shine on lid */}
      <ellipse cx="20" cy="24" rx="10" ry="4" transform="rotate(-18 20 24)" fill="rgba(255,230,100,0.28)"/>
    </svg>
  )
}

function VoOcIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="vocG" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#e0c8a0"/>
          <stop offset="100%" stopColor="#b09070"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-17 30 36)">
        {/* cone body */}
        <path
          d="M 30 10 C 37 17 44 30 40 38 C 37 43 23 43 20 38 C 16 30 23 17 30 10 Z"
          fill="url(#vocG)"
        />
        {/* stripe arcs (upper half-ellipses, canvas draws 0→π = bottom half in screen coords) */}
        <path d="M 24.5 27 A 5.5 1.4 0 0 0 35.5 27" stroke="rgba(140,100,60,0.38)" strokeWidth="1.3" fill="none"/>
        <path d="M 24.0 31 A 6.0 1.4 0 0 0 36.0 31" stroke="rgba(140,100,60,0.38)" strokeWidth="1.3" fill="none"/>
        <path d="M 24.5 35 A 5.5 1.4 0 0 0 35.5 35" stroke="rgba(140,100,60,0.38)" strokeWidth="1.3" fill="none"/>
        <path d="M 26.0 39 A 4.0 1.2 0 0 0 34.0 39" stroke="rgba(140,100,60,0.38)" strokeWidth="1.3" fill="none"/>
        {/* highlight */}
        <ellipse cx="24" cy="20" rx="4.5" ry="2.5" transform="rotate(-25 24 20)" fill="rgba(255,245,220,0.38)"/>
      </g>
    </svg>
  )
}

function HaiQuyIcon({ size = 48 }) {
  // 8 tentacles: hue 280/305/330 cycling, bulb tips, radial-gradient center
  const NUM = 8
  const tentacles = Array.from({ length: NUM }, (_, i) => {
    const baseA = (i / NUM) * Math.PI * 2 - Math.PI / 2
    const len = 18
    const ex = 30 + Math.cos(baseA) * len
    const ey = 30 + Math.sin(baseA) * len - 3
    const cpx = 30 + Math.cos(baseA) * (len * 0.48)
    const cpy = 30 + Math.sin(baseA) * (len * 0.48) - 1.5
    const hue = 280 + (i % 3) * 25
    return { ex, ey, cpx, cpy, hue }
  })
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="hqC" cx="38%" cy="38%">
          <stop offset="0%" stopColor="rgba(210,130,190,0.95)"/>
          <stop offset="100%" stopColor="rgba(160,60,130,0.88)"/>
        </radialGradient>
      </defs>
      {tentacles.map((t, i) => (
        <g key={i}>
          <path
            d={`M 30 30 Q ${t.cpx.toFixed(1)} ${t.cpy.toFixed(1)} ${t.ex.toFixed(1)} ${t.ey.toFixed(1)}`}
            stroke={`hsla(${t.hue},65%,62%,0.82)`}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <circle cx={t.ex.toFixed(1)} cy={t.ey.toFixed(1)} r="3.2" fill={`hsla(${t.hue + 20},70%,70%,0.9)`}/>
        </g>
      ))}
      <circle cx="30" cy="30" r="8.5" fill="url(#hqC)"/>
    </svg>
  )
}

function DenLongIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 64" fill="none">
      {/* string */}
      <line x1="30" y1="2" x2="30" y2="10" stroke="rgba(200,140,60,0.7)" strokeWidth="1.2" strokeLinecap="round"/>
      {/* top cap */}
      <ellipse cx="30" cy="12" rx="10" ry="3.5" fill="rgba(200,40,40,0.95)"/>
      {/* body */}
      <ellipse cx="30" cy="33" rx="13" ry="20" fill="rgba(220,40,30,0.92)"/>
      {/* glow */}
      <ellipse cx="30" cy="33" rx="16" ry="23" fill="rgba(255,100,20,0.10)"/>
      {/* ribs */}
      <ellipse cx="30" cy="22" rx="13" ry="2" fill="none" stroke="rgba(255,180,60,0.35)" strokeWidth="1"/>
      <ellipse cx="30" cy="33" rx="13" ry="2" fill="none" stroke="rgba(255,180,60,0.35)" strokeWidth="1"/>
      <ellipse cx="30" cy="44" rx="13" ry="2" fill="none" stroke="rgba(255,180,60,0.35)" strokeWidth="1"/>
      {/* bottom cap */}
      <ellipse cx="30" cy="52" rx="10" ry="3.5" fill="rgba(200,40,40,0.95)"/>
      {/* tassel */}
      <line x1="27" y1="55" x2="25" y2="62" stroke="rgba(220,160,20,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="30" y1="55" x2="30" y2="63" stroke="rgba(220,160,20,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="33" y1="55" x2="35" y2="62" stroke="rgba(220,160,20,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function RuongGoIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 56" fill="none">
      <defs>
        <linearGradient id="rgBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5A2B"/>
          <stop offset="100%" stopColor="#5D3A1A"/>
        </linearGradient>
        <linearGradient id="rgLid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A0693A"/>
          <stop offset="100%" stopColor="#7A4820"/>
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="30" cy="54" rx="22" ry="4" fill="rgba(0,0,0,0.18)"/>
      {/* body */}
      <rect x="6" y="28" width="48" height="22" rx="2" fill="url(#rgBody)"/>
      {/* lid */}
      <rect x="6" y="16" width="48" height="14" rx="2" fill="url(#rgLid)"/>
      {/* metal bands */}
      <rect x="6" y="36" width="48" height="3" rx="1" fill="rgba(200,165,50,0.6)"/>
      <rect x="6" y="22" width="48" height="3" rx="1" fill="rgba(200,165,50,0.6)"/>
      {/* corner rivets */}
      <circle cx="12" cy="37.5" r="2" fill="rgba(230,190,60,0.85)"/>
      <circle cx="48" cy="37.5" r="2" fill="rgba(230,190,60,0.85)"/>
      <circle cx="12" cy="23.5" r="2" fill="rgba(230,190,60,0.85)"/>
      <circle cx="48" cy="23.5" r="2" fill="rgba(230,190,60,0.85)"/>
      {/* center lock */}
      <rect x="26" y="33" width="8" height="6" rx="1.5" fill="rgba(210,175,50,0.9)"/>
      <circle cx="30" cy="33" r="3" fill="none" stroke="rgba(210,175,50,0.9)" strokeWidth="2"/>
    </svg>
  )
}

function CotDaCoIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 64" fill="none">
      <defs>
        <linearGradient id="cdcShaft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b7280"/>
          <stop offset="50%" stopColor="#9ca3af"/>
          <stop offset="100%" stopColor="#4b5563"/>
        </linearGradient>
      </defs>
      {/* base slab */}
      <rect x="10" y="54" width="40" height="8" rx="2" fill="#4b5563"/>
      {/* shaft */}
      <rect x="20" y="14" width="20" height="42" rx="2" fill="url(#cdcShaft)"/>
      {/* capital */}
      <rect x="14" y="8" width="32" height="8" rx="2" fill="#6b7280"/>
      {/* moss patches */}
      <ellipse cx="23" cy="32" rx="5" ry="3" fill="rgba(55,105,45,0.55)"/>
      <ellipse cx="37" cy="44" rx="4" ry="2.5" fill="rgba(55,105,45,0.45)"/>
      {/* cracks */}
      <path d="M 28 20 L 26 30 L 30 35" stroke="rgba(0,0,0,0.25)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M 34 42 L 33 50" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function CungDienIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 64" fill="none">
      <defs>
        <linearGradient id="cdHall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8edf5"/>
          <stop offset="100%" stopColor="#b0bcd0"/>
        </linearGradient>
      </defs>
      {/* tier 3 (bottom wide) */}
      <rect x="4" y="48" width="52" height="14" rx="1" fill="#c8d4e8"/>
      {/* tier 2 */}
      <rect x="10" y="36" width="40" height="14" rx="1" fill="#d0daea"/>
      {/* hall body */}
      <rect x="14" y="20" width="32" height="18" rx="1" fill="url(#cdHall)"/>
      {/* pediment */}
      <polygon points="14,20 30,8 46,20" fill="#d8e2f0"/>
      {/* columns */}
      <rect x="16" y="22" width="4" height="16" rx="1" fill="#b0bcd0"/>
      <rect x="24" y="22" width="4" height="16" rx="1" fill="#b0bcd0"/>
      <rect x="32" y="22" width="4" height="16" rx="1" fill="#b0bcd0"/>
      <rect x="40" y="22" width="4" height="16" rx="1" fill="#b0bcd0"/>
      {/* door arch */}
      <path d="M 25 38 L 25 28 Q 30 22 35 28 L 35 38 Z" fill="rgba(80,110,170,0.4)"/>
      {/* windows */}
      <path d="M 18 28 Q 20 24 22 28" fill="rgba(80,110,170,0.3)" stroke="none"/>
      <path d="M 38 28 Q 40 24 42 28" fill="rgba(80,110,170,0.3)" stroke="none"/>
    </svg>
  )
}

function XacTauIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="xtHull" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A3520"/>
          <stop offset="100%" stopColor="#2A1A0A"/>
        </linearGradient>
      </defs>
      {/* hull */}
      <path d="M 5 48 Q 8 30 12 24 L 48 24 Q 52 30 55 48 Q 40 54 30 54 Q 20 54 5 48 Z" fill="url(#xtHull)"/>
      {/* plank lines */}
      <path d="M 10 34 Q 30 32 50 34" stroke="rgba(255,200,130,0.2)" strokeWidth="1" fill="none"/>
      <path d="M 8 42 Q 30 40 52 42" stroke="rgba(255,200,130,0.2)" strokeWidth="1" fill="none"/>
      {/* broken mast */}
      <line x1="22" y1="24" x2="18" y2="6" stroke="rgba(120,80,40,0.85)" strokeWidth="3" strokeLinecap="round"/>
      <line x1="18" y1="12" x2="10" y2="16" stroke="rgba(120,80,40,0.7)" strokeWidth="1.8" strokeLinecap="round"/>
      {/* hull hole */}
      <ellipse cx="38" cy="40" rx="7" ry="4" fill="rgba(0,0,0,0.35)"/>
      {/* algae tufts */}
      <path d="M 44 24 Q 42 18 44 14" stroke="rgba(34,120,55,0.65)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 48 24 Q 50 16 47 12" stroke="rgba(34,120,55,0.55)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function NamPhatSangIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 64" fill="none">
      <defs>
        <radialGradient id="npsCap" cx="38%" cy="35%">
          <stop offset="0%" stopColor="rgba(245,160,255,0.98)"/>
          <stop offset="100%" stopColor="rgba(120,20,185,0.95)"/>
        </radialGradient>
      </defs>
      {/* outer glow */}
      <ellipse cx="30" cy="30" rx="22" ry="18" fill="rgba(180,0,220,0.08)"/>
      {/* stem */}
      <path d="M 24 56 Q 26 42 30 36" stroke="rgba(220,180,240,0.7)" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M 36 56 Q 34 42 30 36" stroke="rgba(220,180,240,0.6)" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* cap */}
      <ellipse cx="30" cy="28" rx="20" ry="12" fill="url(#npsCap)"/>
      {/* spots */}
      <circle cx="22" cy="26" r="2.5" fill="rgba(255,255,255,0.75)"/>
      <circle cx="30" cy="20" r="2" fill="rgba(255,255,255,0.65)"/>
      <circle cx="38" cy="26" r="2.5" fill="rgba(255,255,255,0.75)"/>
      <circle cx="33" cy="31" r="1.5" fill="rgba(255,255,255,0.55)"/>
    </svg>
  )
}

const TRANG_TRI_SHOP = [
  { id: 'rong_bien',    ten: 'Rong biển',     Icon: RongBienIcon,    gia: 50  },
  { id: 'san_ho_cay',   ten: 'San hô cây',    Icon: SanHoCayIcon,    gia: 80  },
  { id: 'da_cuoi',      ten: 'Đá cuội',       Icon: DaCuoiIcon,      gia: 30  },
  { id: 'kho_bau',      ten: 'Kho báu',       Icon: KhoBauIcon,      gia: 200 },
  { id: 'vo_oc',        ten: 'Vỏ ốc',         Icon: VoOcIcon,        gia: 40  },
  { id: 'hai_quy',      ten: 'Hải quỳ',       Icon: HaiQuyIcon,      gia: 120 },
  { id: 'den_long',     ten: 'Đèn lồng',      Icon: DenLongIcon,     gia: 150 },
  { id: 'ruong_go',     ten: 'Rương gỗ',      Icon: RuongGoIcon,     gia: 100 },
  { id: 'cot_da_co',    ten: 'Cột đá cổ',     Icon: CotDaCoIcon,     gia: 80  },
  { id: 'cung_dien',    ten: 'Cung điện nhỏ', Icon: CungDienIcon,    gia: 300 },
  { id: 'xac_tau',      ten: 'Xác tàu',       Icon: XacTauIcon,      gia: 250 },
  { id: 'nam_phat_sang',ten: 'Nấm phát sáng', Icon: NamPhatSangIcon, gia: 120 },
]

// ── SVG icons for special shop items ─────────────────────────────
function JellyfishShopIcon({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="jfBell" cx="38%" cy="32%">
          <stop offset="0%"   stopColor="#ffb3f0" />
          <stop offset="45%"  stopColor="#d246ff" />
          <stop offset="100%" stopColor="#b464ff" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id="jfGlow" cx="50%" cy="40%">
          <stop offset="0%"   stopColor="rgba(210,70,255,0.28)" />
          <stop offset="100%" stopColor="rgba(210,70,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="38" r="44" fill="url(#jfGlow)" />
      <path d="M 8 42 Q 8 6 50 6 Q 92 6 92 42 Q 92 58 50 54 Q 8 58 8 42Z" fill="url(#jfBell)" />
      <path d="M 8 42 Q 8 6 50 6 Q 92 6 92 42" stroke="rgba(255,180,245,0.65)" strokeWidth="2" />
      <ellipse cx="36" cy="25" rx="16" ry="9" fill="rgba(255,255,255,0.3)" transform="rotate(-15,36,25)" />
      <path d="M 22 54 Q 17 68 22 82" stroke="rgba(210,80,255,0.85)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 34 55 Q 28 70 34 86" stroke="rgba(255,100,210,0.85)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 50 56 Q 47 72 51 87" stroke="rgba(210,80,255,0.85)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 66 55 Q 72 70 66 86" stroke="rgba(255,100,210,0.85)" strokeWidth="2" strokeLinecap="round" />
      <path d="M 78 54 Q 83 68 78 82" stroke="rgba(210,80,255,0.85)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function OysterShopIcon({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="osPearl" cx="35%" cy="35%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="40%"  stopColor="#dde8ff" />
          <stop offset="100%" stopColor="#9bb5d8" />
        </radialGradient>
        <radialGradient id="osPearlGlow" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="rgba(180,210,255,0.6)" />
          <stop offset="100%" stopColor="rgba(180,210,255,0)" />
        </radialGradient>
        <radialGradient id="osTop" cx="50%" cy="65%">
          <stop offset="0%"   stopColor="#b8c4cc" />
          <stop offset="100%" stopColor="#7a8a92" />
        </radialGradient>
        <radialGradient id="osBot" cx="50%" cy="28%">
          <stop offset="0%"   stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#6b7280" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="57" rx="24" ry="18" fill="url(#osPearlGlow)" />
      {/* Bottom shell */}
      <path d="M 10 68 Q 12 52 50 50 Q 88 52 90 68 Q 88 82 50 84 Q 12 82 10 68Z" fill="url(#osBot)" />
      <line x1="28" y1="78" x2="33" y2="55" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="82" x2="50" y2="53" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="72" y1="78" x2="67" y2="55" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Top shell (open) */}
      <path d="M 10 46 Q 10 14 50 12 Q 90 14 90 46 Q 88 54 50 50 Q 12 54 10 46Z" fill="url(#osTop)" />
      <line x1="28" y1="30" x2="35" y2="50" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="18" x2="50" y2="50" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="72" y1="30" x2="65" y2="50" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="50" cy="50" rx="6" ry="4" fill="#4b5563" />
      {/* Pearl */}
      <circle cx="50" cy="59" r="13" fill="url(#osPearl)" />
      <ellipse cx="44" cy="53" rx="4" ry="2.5" fill="rgba(255,255,255,0.72)" transform="rotate(-25,44,53)" />
    </svg>
  )
}

const SHOP_SPECIAL_ITEMS = [
  {
    id:          'sua_gai',
    ten:         'Sứa Gai',
    hiem:        'epic',
    gia:         500,
    coin5ph:     8,
    levelYeuCau: 3,
    Icon:        JellyfishShopIcon,
    tooltip:     'Buff +8 🪙/5 phút cho cá xung quanh',
  },
  {
    id:          'ngoc_trai',
    ten:         'Ngọc Trai',
    hiem:        'epic',
    gia:         600,
    coin5ph:     null,
    levelYeuCau: 0,
    Icon:        OysterShopIcon,
    tooltip:     'Con trai đáy hồ, mở mỗi 15 phút → +50 🪙/click',
  },
]

function NenThumbnail({ nuoc, tia }) {
  const ref  = useRef(null)
  const bRef = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      x:   (i + 0.5) / 5 + (Math.random() - 0.5) * 0.06,
      y:   0.15 + Math.random() * 0.65,
      r:   0.7 + Math.random() * 1.1,
      spd: 0.010 + Math.random() * 0.014,
      pha: Math.random() * Math.PI * 2,
    }))
  )
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, t = 0, last = null
    function tick(ts) {
      if (last === null) last = ts
      t += Math.min(ts - last, 50) / 1000; last = ts
      const w = canvas.width, h = canvas.height
      const sandY = Math.round(h * 0.68)
      const wg = ctx.createLinearGradient(0, 0, 0, h)
      nuoc.forEach((c, i) => wg.addColorStop(i / (nuoc.length - 1), c))
      ctx.fillStyle = wg; ctx.fillRect(0, 0, w, h)
      const [tr, tg, tb, ta] = tia
      const rx = w * 0.5 + Math.sin(t * 0.28) * w * 0.18
      const rg = ctx.createLinearGradient(0, 0, 0, h * 0.72)
      rg.addColorStop(0, `rgba(${tr},${tg},${tb},${(ta * 2).toFixed(3)})`)
      rg.addColorStop(1, `rgba(${tr},${tg},${tb},0)`)
      ctx.fillStyle = rg
      ctx.beginPath()
      ctx.moveTo(rx - w * 0.022, 0); ctx.lineTo(rx + w * 0.022, 0)
      ctx.lineTo(rx + w * 0.09, h * 0.72); ctx.lineTo(rx - w * 0.09, h * 0.72)
      ctx.closePath(); ctx.fill()
      const sg = ctx.createLinearGradient(0, sandY, 0, h)
      sg.addColorStop(0, '#c4a882'); sg.addColorStop(1, '#a08660')
      ctx.fillStyle = sg
      ctx.beginPath(); ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 3)
        ctx.lineTo(x, sandY + Math.sin(x * 0.12 + t * 0.35) * 1.5 + Math.sin(x * 0.06 + t * 0.22) * 2)
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill()
      bRef.current.forEach(b => {
        b.y -= b.spd; if (b.y < -0.06) b.y = 1.04
        const bx = b.x * w + Math.sin(b.y * 18 + b.pha) * 2.5
        ctx.beginPath(); ctx.arc(bx, b.y * h, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.48)'; ctx.lineWidth = 0.6; ctx.stroke()
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} width={180} height={56} style={{ width: '100%', height: '56px', display: 'block' }} />
}

function DayThumbnail({ s1, s2 }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, t = 0, last = null
    function tick(ts) {
      if (last === null) last = ts
      t += Math.min(ts - last, 50) / 1000; last = ts
      const w = canvas.width, h = canvas.height
      const sandY = Math.round(h * 0.28)
      ctx.fillStyle = '#070d18'; ctx.fillRect(0, 0, w, h)
      const sg = ctx.createLinearGradient(0, sandY, 0, h)
      sg.addColorStop(0, s1); sg.addColorStop(1, s2)
      ctx.fillStyle = sg
      ctx.beginPath(); ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 3)
        ctx.lineTo(x, sandY + Math.sin(x * 0.12 + t * 0.35) * 1.5)
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill()
      ;[0.22, 0.55, 0.78].forEach((xf, i) => {
        const bx = xf * w + Math.sin(t * 0.7 + i * 2.1) * 3
        const by = sandY - 6 - Math.abs(Math.sin(t * 0.4 + i)) * 7
        ctx.beginPath(); ctx.arc(bx, by, 1.2, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.5; ctx.stroke()
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} width={180} height={40} style={{ width: '100%', height: '40px', display: 'block' }} />
}

function phuHop(item, q) {
  if (!q) return true
  const k = q.toLowerCase()
  return item.ten.toLowerCase().includes(k) || item.ma?.toLowerCase().includes(k)
}

// ── Unified card (4-column) ───────────────────────────────────────
const ShopCard = forwardRef(function ShopCard(
  { Icon, ten, hiem, gia, coin5ph, levelYeuCau, coins, playerLevel, onMua, dangMua, isDisabled, isHighlighted, dimmed },
  ref,
) {
  const duCoins  = gia === 0 || coins >= gia
  const duLevel  = !levelYeuCau || playerLevel >= levelYeuCau
  const coTheMua = duCoins && duLevel && !isDisabled && !dangMua
  const hiemCfg  = HIEM[hiem] || HIEM.common
  const hiemMau  = hiemCfg.mau

  let btnLabel
  if (dangMua)         btnLabel = '…'
  else if (isDisabled) btnLabel = 'Đã có'
  else if (!duLevel)   btnLabel = `Lv.${playerLevel}/${levelYeuCau}`
  else if (!duCoins)   btnLabel = `${gia}🪙`
  else if (gia === 0)  btnLabel = 'Chọn'
  else                 btnLabel = 'Mua'

  const tooltip = !duLevel
    ? `Cần Lv.${levelYeuCau} (đang Lv.${playerLevel})`
    : !duCoins ? `Cần ${gia} coins (đang có ${coins})` : ''

  return (
    <div
      ref={ref}
      title={tooltip}
      className="relative flex flex-col items-center bg-ho-nong border rounded-2xl px-2 py-3 gap-1 transition-all duration-300"
      style={{
        borderColor: isHighlighted ? hiemMau + 'bb' : hiemMau + '35',
        opacity:     dimmed ? 0.25 : 1,
        boxShadow:   isHighlighted ? `0 0 16px 3px ${hiemMau}33` : 'none',
      }}
    >
      {/* Rarity badge */}
      <div
        className="absolute top-1.5 right-1.5 px-1 py-px rounded text-[8px] font-bold leading-tight"
        style={{ background: hiemMau + '28', color: hiemMau }}
      >
        {hiemCfg.nhan}
      </div>

      <div className={`mt-1 ${duCoins && duLevel ? '' : 'opacity-50'}`}>{Icon}</div>
      <div className="text-white text-[10px] font-semibold text-center leading-tight w-full truncate px-0.5">{ten}</div>

      {/* Giá */}
      <div className="text-center">
        {gia === 0
          ? <span className="text-green-400 text-[10px] font-semibold">Miễn phí</span>
          : <span className="text-[10px] font-bold" style={{ color: hiemMau }}>🪙 {gia}</span>
        }
      </div>

      {/* Coin/5 phút */}
      {coin5ph != null && (
        <div className="text-[9px] text-white/35 leading-none">
          💰 +{coin5ph} / 5 phút
        </div>
      )}

      <button
        onClick={e => { e.stopPropagation(); if (coTheMua) onMua() }}
        disabled={!coTheMua}
        className={`w-full py-1 rounded-lg text-[10px] font-semibold transition mt-0.5 ${
          coTheMua
            ? 'bg-ho-anh hover:bg-ho-accent text-ho-sau cursor-pointer'
            : 'bg-ho-nong/60 text-ho-anh/30 cursor-not-allowed'
        }`}
      >
        {btnLabel}
      </button>
    </div>
  )
})

export default function ShopPanel({
  onThemCa, onDong,
  nenHo, dayHo,
  onChonNen, onChonDay,
  coins = 0,
  playerExp = 0,
  onCoinsUpdate,
  onThemConTrai,
  conTrai = [],
  danhSachDecor = [],
  onMuaDecor,
  onDatDecor,
}) {
  const playerLevel = tinhLevel(playerExp)
  const [tab, setTab]              = useState('ca')
  const [modal, setModal]          = useState(null)
  const [tuKhoa, setTuKhoa]        = useState('')
  const [dangMuaCT, setDangMuaCT]  = useState(false)
  const cardRefs                   = useRef({})

  useEffect(() => {
    if (!tuKhoa || tab !== 'ca') return
    const match = LOAI_CA_SHOP.find(item => phuHop(item, tuKhoa))
    if (match && cardRefs.current[match.loai_ca]) {
      cardRefs.current[match.loai_ca].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [tuKhoa, tab])

  function khiMuaXong(ca, coinsConLai) {
    onThemCa(ca)
    if (coinsConLai != null) onCoinsUpdate?.(coinsConLai)
    setModal(null)
  }

  async function khiMuaConTrai() {
    setDangMuaCT(true)
    try {
      const res = await API.muaConTrai()
      onCoinsUpdate?.(res.coins_con_lai)
      onThemConTrai?.()
    } catch (err) {
      alert(err.message || 'Không mua được ngọc trai')
    } finally {
      setDangMuaCT(false)
    }
  }

  const coTimKiem = tuKhoa.trim().length > 0

  const TABS = [
    { id: 'ca',        label: '🐠 Cá' },
    { id: 'nen',       label: '🌊 Nền' },
    { id: 'trang_tri', label: '✨ Trang trí' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onDong} />

      <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-ho-sau border-l border-ho-anh/15 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ho-anh/10 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Cửa hàng</h2>
            <p className="text-ho-anh/45 text-xs mt-0.5">
              Số dư: <span className="text-yellow-400 font-semibold">🪙 {coins.toLocaleString()}</span>
            </p>
          </div>
          <button onClick={onDong} className="text-ho-anh/40 hover:text-white text-2xl leading-none transition">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ho-anh/10 flex-shrink-0 px-2 pt-2 gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-t-xl text-xs font-semibold transition ${
                tab === t.id
                  ? 'bg-ho-nong text-white border-b-2 border-ho-anh'
                  : 'text-ho-anh/45 hover:text-ho-anh/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(96,165,250,0.3) transparent' }}>

          {/* ── Tab: Cá ── */}
          {tab === 'ca' && (
            <div className="px-4 pb-6 pt-3">
              {/* Search */}
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ho-anh/35 text-sm pointer-events-none">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm tên cá hoặc mã số..."
                  value={tuKhoa}
                  onChange={e => setTuKhoa(e.target.value)}
                  className="w-full bg-ho-nong border border-ho-anh/20 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-ho-anh/30 focus:outline-none focus:border-ho-anh/50 transition"
                />
                {tuKhoa && (
                  <button onClick={() => setTuKhoa('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ho-anh/40 hover:text-ho-anh text-lg leading-none">×</button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {/* Fish — common → uncommon → rare → epic */}
                {LOAI_CA_SHOP.map(item => {
                  const matched  = coTimKiem && phuHop(item, tuKhoa)
                  const notMatch = coTimKiem && !phuHop(item, tuKhoa)
                  return (
                    <ShopCard
                      key={item.loai_ca}
                      ref={el => { cardRefs.current[item.loai_ca] = el }}
                      Icon={<FishIcon loaiCa={item.loai_ca} size={48} />}
                      ten={item.ten}
                      hiem={item.hiem}
                      gia={item.gia}
                      coin5ph={item.coin5ph}
                      coins={coins}
                      playerLevel={playerLevel}
                      onMua={() => setModal({ loai_ca: item.loai_ca, ten: item.ten })}
                      isHighlighted={matched}
                      dimmed={notMatch}
                    />
                  )
                })}

                {/* Special epic items — hidden during fish search */}
                {!coTimKiem && SHOP_SPECIAL_ITEMS.map(item => (
                  <ShopCard
                    key={item.id}
                    Icon={<item.Icon size={48} />}
                    ten={item.ten}
                    hiem={item.hiem}
                    gia={item.gia}
                    coin5ph={item.coin5ph}
                    levelYeuCau={item.levelYeuCau || 0}
                    coins={coins}
                    playerLevel={playerLevel}
                    onMua={
                      item.id === 'sua_gai'
                        ? () => {
                            console.log(`Shop level check: player_exp=${playerExp}, level=${playerLevel}`)
                            setModal({ loai_ca: 'sua_gai', ten: 'Sứa Gai' })
                          }
                        : khiMuaConTrai
                    }
                    dangMua={item.id === 'ngoc_trai' ? dangMuaCT : false}
                    isDisabled={item.id === 'ngoc_trai' && conTrai.length > 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Nền ── */}
          {tab === 'nen' && (
            <div className="px-4 pb-6">
              <div className="mt-4 mb-5">
                <div className="text-ho-anh/60 text-xs font-semibold uppercase tracking-wide mb-2">🌌 Nước &amp; Background</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {BACKGROUNDS.map(bg => {
                    const selected = nenHo === bg.id
                    return (
                      <button
                        key={bg.id}
                        onClick={() => onChonNen?.(bg.id)}
                        className="relative rounded-xl overflow-hidden border-2 transition-all"
                        style={{
                          borderColor: selected ? '#4a9eda' : 'rgba(96,165,250,0.12)',
                          boxShadow:   selected ? '0 0 14px rgba(74,158,218,0.35)' : 'none',
                        }}
                      >
                        <NenThumbnail nuoc={bg.nuoc} tia={bg.tia} />
                        <div className="bg-ho-nong px-2 py-1.5 flex items-center justify-between">
                          <span className="text-white text-xs font-medium">{bg.ten}</span>
                          {selected && <span className="text-ho-anh text-sm">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="text-ho-anh/60 text-xs font-semibold uppercase tracking-wide mb-2">🏖 Đáy hồ</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {DAY_HO_LIST.map(day => {
                    const selected = dayHo === day.id
                    return (
                      <button
                        key={day.id}
                        onClick={() => onChonDay?.(day.id)}
                        className="relative rounded-xl overflow-hidden border-2 transition-all"
                        style={{
                          borderColor: selected ? '#4a9eda' : 'rgba(96,165,250,0.12)',
                          boxShadow:   selected ? '0 0 14px rgba(74,158,218,0.35)' : 'none',
                        }}
                      >
                        <DayThumbnail s1={day.s1} s2={day.s2} />
                        <div className="bg-ho-nong px-2 py-1.5 flex items-center justify-between">
                          <span className="text-white text-xs font-medium">{day.ten}</span>
                          {selected && <span className="text-ho-anh text-sm">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Trang trí ── */}
          {tab === 'trang_tri' && (
            <div className="px-4 pb-6 mt-3 space-y-2.5">
              {TRANG_TRI_SHOP.map(item => {
                const owned   = danhSachDecor.filter(d => d.loai === item.id)
                const visible = owned.filter(d => !d.an)
                const canBuy  = coins >= item.gia
                return (
                  <div key={item.id} className="bg-ho-nong border border-ho-anh/10 rounded-2xl overflow-hidden">
                    {/* Shop row */}
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <item.Icon size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold">{item.ten}</div>
                        <div className="text-ho-anh/40 text-xs">
                          🪙 {item.gia}
                          {owned.length > 0 && (
                            <span className="ml-2 text-ho-anh/55">
                              · Có {owned.length} ({visible.length} đặt)
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onMuaDecor?.(item.id)}
                        disabled={!canBuy}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          canBuy
                            ? 'bg-ho-anh hover:bg-ho-accent text-ho-sau cursor-pointer'
                            : 'bg-ho-anh/10 text-ho-anh/25 cursor-not-allowed'
                        }`}
                      >
                        Mua
                      </button>
                    </div>

                    {/* Owned instances */}
                    {owned.length > 0 && (
                      <div className="border-t border-ho-anh/8">
                        {owned.map((d, idx) => (
                          <div key={d.id} className="flex items-center gap-2 px-3 py-1.5 border-b border-ho-anh/5 last:border-0">
                            <span className="text-[11px] text-ho-anh/35 tabular-nums w-4">{idx + 1}</span>
                            {d.an ? (
                              <span className="text-ho-anh/35 text-xs flex-1">Chưa đặt</span>
                            ) : (
                              <span className="text-green-400/80 text-xs flex-1">✓ Tầng {d.layer}</span>
                            )}
                            {d.an ? (
                              <button
                                onClick={() => { onDatDecor?.(d.id); onDong() }}
                                className="px-2.5 py-1 bg-ho-anh/15 hover:bg-ho-anh/25 text-ho-anh text-xs rounded-lg transition"
                              >
                                Đặt vào hồ
                              </button>
                            ) : (
                              <button
                                onClick={() => onDatDecor?.(d.id)}
                                className="px-2.5 py-1 bg-ho-anh/10 hover:bg-ho-anh/20 text-ho-anh/60 hover:text-ho-anh text-xs rounded-lg transition"
                              >
                                Đặt lại
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {modal && (
        <BuyFishModal
          loaiCa={modal.loai_ca}
          tenLoai={modal.ten}
          onXong={khiMuaXong}
          onDong={() => setModal(null)}
        />
      )}
    </>
  )
}
