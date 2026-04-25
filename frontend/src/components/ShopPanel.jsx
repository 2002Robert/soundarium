import { useState, useRef, useEffect } from 'react'
import BuyFishModal from './BuyFishModal'
import FishIcon from './FishIcon'
import { API } from '../lib/api'

const HIEM = {
  common:    { nhan: 'Phổ thông',   mau: '#6b7280' },
  rare:      { nhan: 'Hiếm',        mau: '#818cf8' },
  epic:      { nhan: 'Sử thi',      mau: '#f59e0b' },
  legendary: { nhan: 'Huyền thoại', mau: '#ef4444' },
}

const LOAI_CA_SHOP = [
  { loai_ca: 'ca_vang',      ma: '#CA001', ten: 'Cá Vàng',  mo_ta: 'Hiền lành, dễ nuôi',     hiem: 'common',    gia: 0   },
  { loai_ca: 'ca_neon',      ma: '#CA002', ten: 'Cá Neon',  mo_ta: 'Sọc xanh đỏ rực rỡ',    hiem: 'common',    gia: 0   },
  { loai_ca: 'ca_betta',     ma: '#CA003', ten: 'Cá Betta', mo_ta: 'Đuôi dài, màu đẹp',      hiem: 'rare',      gia: 50  },
  { loai_ca: 'ca_clownfish', ma: '#CA004', ten: 'Cá Hề',    mo_ta: 'Cam trắng quen thuộc',   hiem: 'rare',      gia: 50  },
  { loai_ca: 'ca_tang',      ma: '#CA005', ten: 'Cá Tang',  mo_ta: 'Tròn trĩnh, xanh dương', hiem: 'rare',      gia: 50  },
  { loai_ca: 'ca_koi',       ma: '#CA006', ten: 'Cá Koi',   mo_ta: 'Dài, đốm cam trắng',     hiem: 'epic',      gia: 150 },
  { loai_ca: 'ca_chep',      ma: '#CA007', ten: 'Cá Chép',  mo_ta: 'Vảy bạc, to khỏe',       hiem: 'epic',      gia: 150 },
  { loai_ca: 'ca_dia',       ma: '#CA008', ten: 'Cá Đĩa',   mo_ta: 'Tròn dẹt, kẻ sọc',       hiem: 'legendary', gia: 500 },
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

function phuHop(item, q) {
  if (!q) return true
  const k = q.toLowerCase()
  return item.ten.toLowerCase().includes(k) || item.ma?.toLowerCase().includes(k)
}

function NhanHiem({ hiem }) {
  const cfg = HIEM[hiem]
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ color: cfg.mau, background: cfg.mau + '22', border: `1px solid ${cfg.mau}44` }}
    >
      {cfg.nhan}
    </span>
  )
}

function HienGia({ gia, hiem }) {
  if (gia === 0) return <span className="text-green-400 text-xs font-semibold">Miễn phí</span>
  const mau = HIEM[hiem]?.mau || '#60a5fa'
  return <span className="text-xs font-bold" style={{ color: mau }}>🪙 {gia}</span>
}

export default function ShopPanel({
  onThemCa, onDong,
  nenHo, dayHo,
  onChonNen, onChonDay,
  coins = 0,
  playerLevel = 1,
  onCoinsUpdate,
  onThemSua,
}) {
  const [tab, setTab]         = useState('ca')
  const [modal, setModal]     = useState(null)
  const [tuKhoa, setTuKhoa]   = useState('')
  const [dangMuaSua, setDangMuaSua] = useState(false)
  const cardRefs              = useRef({})

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

  async function khiMuaSua() {
    setDangMuaSua(true)
    try {
      const res = await API.muaSua()
      onCoinsUpdate?.(res.coins_con_lai)
      onThemSua?.()
    } catch (err) {
      alert(err.message || 'Không mua được sứa')
    } finally {
      setDangMuaSua(false)
    }
  }

  const coTimKiem = tuKhoa.trim().length > 0

  const TABS = [
    { id: 'ca',        label: '🐠 Cá' },
    { id: 'nen',       label: '🌊 Nền' },
    { id: 'trang_tri', label: '✨ Trang trí' },
  ]

  const suaCanMua = playerLevel < 3
  const suaDuCoins = coins >= 100

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
            <div className="px-4 pb-6">

              {/* Sứa gai */}
              <div className="mt-3 mb-4 bg-ho-nong border border-ho-anh/15 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="text-3xl shrink-0">🪼</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold text-sm">Sứa Gai</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ color: '#a78bfa', background: '#a78bfa22', border: '1px solid #a78bfa44' }}>
                      Lv.3 unlock
                    </span>
                  </div>
                  <div className="text-ho-anh/50 text-xs mt-0.5">Bơi trong hồ, click để nhận ngọc trai</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-purple-400 text-xs font-bold mb-1.5">🪙 100</div>
                  <button
                    onClick={khiMuaSua}
                    disabled={dangMuaSua || suaCanMua || !suaDuCoins}
                    title={
                      suaCanMua ? `Cần Lv.3 (đang Lv.${playerLevel})` :
                      !suaDuCoins ? 'Cần 100 coins' : ''
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      suaCanMua || !suaDuCoins
                        ? 'bg-ho-nong/50 text-ho-anh/30 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {dangMuaSua ? '…' : suaCanMua ? `Lv.${playerLevel}/3` : !suaDuCoins ? 'Thiếu coin' : 'Mua'}
                  </button>
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-3">
                {LOAI_CA_SHOP.map(item => {
                  const matched    = coTimKiem && phuHop(item, tuKhoa)
                  const notMatch   = coTimKiem && !phuHop(item, tuKhoa)
                  const duCoins    = coins >= item.gia
                  const coTheMua   = duCoins
                  const tooltip    = !duCoins ? `Cần ${item.gia} coins (đang có ${coins})` : ''

                  return (
                    <div
                      key={item.loai_ca}
                      ref={el => { cardRefs.current[item.loai_ca] = el }}
                      className="flex flex-col items-center bg-ho-nong border rounded-2xl px-3 py-4 transition-all duration-300"
                      style={{
                        borderColor: matched
                          ? 'rgba(96,165,250,0.7)'
                          : HIEM[item.hiem].mau + '33',
                        opacity:   notMatch ? 0.3 : 1,
                        boxShadow: matched ? `0 0 18px 4px ${HIEM[item.hiem].mau}33` : 'none',
                      }}
                    >
                      <div className={coTheMua ? '' : 'opacity-60'}>
                        <FishIcon loaiCa={item.loai_ca} size={68} />
                      </div>
                      <div className="font-semibold text-white text-sm text-center mt-1 leading-tight">{item.ten}</div>
                      <div className="text-ho-anh/35 text-[11px] font-mono mt-0.5">{item.ma}</div>
                      <div className="mt-1.5 mb-2">
                        <NhanHiem hiem={item.hiem} />
                      </div>
                      <div className="mb-2.5">
                        <HienGia gia={item.gia} hiem={item.hiem} />
                      </div>
                      <button
                        onClick={() => coTheMua && setModal({ loai_ca: item.loai_ca, ten: item.ten })}
                        disabled={!coTheMua}
                        title={tooltip}
                        className={`w-full font-semibold py-1.5 rounded-xl text-xs transition ${
                          coTheMua
                            ? 'bg-ho-anh hover:bg-ho-accent text-ho-sau cursor-pointer'
                            : 'bg-ho-nong/60 text-ho-anh/30 cursor-not-allowed'
                        }`}
                      >
                        {!duCoins ? `Cần ${item.gia} 🪙` : item.gia === 0 ? 'Chọn' : 'Mua'}
                      </button>
                    </div>
                  )
                })}
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
