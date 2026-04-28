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
  { id: 'ocean-shallow', ten: 'Đại dương',  mau1: '#1a3a5c', mau2: '#0a1628' },
  { id: 'ocean-deep',    ten: 'Biển thẳm',  mau1: '#0a1628', mau2: '#050d1a' },
  { id: 'coral-reef',    ten: 'Rạn san hô', mau1: '#1a3a5c', mau2: '#2d1810' },
  { id: 'twilight',      ten: 'Hoàng hôn',  mau1: '#1a1a3a', mau2: '#0a0a1a' },
  { id: 'tropical',      ten: 'Nhiệt đới',  mau1: '#0a2e3a', mau2: '#061820' },
  { id: 'sunset',        ten: 'Đêm muộn',   mau1: '#2a1a0a', mau2: '#0a0505' },
]

const DAY_HO_LIST = [
  { id: 'cat_trang', ten: 'Cát trắng', mau: '#c8b89a' },
  { id: 'cat_vang',  ten: 'Cát vàng',  mau: '#d4a84a' },
  { id: 'soi_den',   ten: 'Sỏi đen',   mau: '#3a3a4a' },
  { id: 'san_ho',    ten: 'San hô',     mau: '#cc6655' },
]

const TRANG_TRI = [
  { id: 'rong_bien',  ten: 'Rong biển',  icon: '🌿' },
  { id: 'san_ho_cay', ten: 'San hô cây', icon: '🪸' },
  { id: 'da_cuoi',    ten: 'Đá cuội',    icon: '🪨' },
  { id: 'kho_bau',    ten: 'Kho báu',    icon: '🏺' },
  { id: 'vo_oc',      ten: 'Vỏ ốc',      icon: '🐚' },
  { id: 'hai_quy',    ten: 'Hải quỳ',    icon: '🌺' },
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
                        <div className="h-14 w-full" style={{ background: `linear-gradient(to bottom, ${bg.mau1}, ${bg.mau2})` }} />
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
                        <div className="h-10 w-full" style={{ backgroundColor: day.mau }} />
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
            <div className="px-4 pb-6 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {TRANG_TRI.map(item => (
                  <div key={item.id} className="flex flex-col items-center bg-ho-nong border border-ho-anh/10 rounded-2xl px-3 py-4">
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="font-semibold text-white text-sm text-center">{item.ten}</div>
                    <div className="mt-3 w-full bg-ho-anh/10 border border-ho-anh/15 text-ho-anh/40 font-semibold py-1.5 rounded-xl text-xs text-center">
                      Sắp ra mắt
                    </div>
                  </div>
                ))}
              </div>
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
