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

const TRANG_TRI_SHOP = [
  { id: 'rong_bien',  ten: 'Rong biển',  icon: '🌿', gia: 50  },
  { id: 'san_ho_cay', ten: 'San hô cây', icon: '🪸', gia: 80  },
  { id: 'da_cuoi',    ten: 'Đá cuội',    icon: '🪨', gia: 30  },
  { id: 'kho_bau',    ten: 'Kho báu',    icon: '🏺', gia: 200 },
  { id: 'vo_oc',      ten: 'Vỏ ốc',      icon: '🐚', gia: 40  },
  { id: 'hai_quy',    ten: 'Hải quỳ',    icon: '🌺', gia: 120 },
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
                      <span className="text-2xl">{item.icon}</span>
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
