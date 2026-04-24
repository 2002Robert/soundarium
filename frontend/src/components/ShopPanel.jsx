import { useState, useRef, useEffect } from 'react'
import BuyFishModal from './BuyFishModal'
import FishIcon from './FishIcon'

const LOAI_CA_SHOP = [
  { loai_ca: 'ca_vang',      ma: '#CA001', ten: 'Cá Vàng',    mo_ta: 'Hiền lành, dễ nuôi' },
  { loai_ca: 'ca_neon',      ma: '#CA002', ten: 'Cá Neon',    mo_ta: 'Sọc xanh đỏ rực rỡ' },
  { loai_ca: 'ca_betta',     ma: '#CA003', ten: 'Cá Betta',   mo_ta: 'Đuôi dài, màu đẹp' },
  { loai_ca: 'ca_clownfish', ma: '#CA004', ten: 'Cá Hề',      mo_ta: 'Cam trắng quen thuộc' },
  { loai_ca: 'ca_tang',      ma: '#CA005', ten: 'Cá Tang',    mo_ta: 'Tròn trĩnh, xanh dương' },
  { loai_ca: 'ca_koi',       ma: '#CA006', ten: 'Cá Koi',     mo_ta: 'Dài, đốm cam trắng' },
  { loai_ca: 'ca_chep',      ma: '#CA007', ten: 'Cá Chép',    mo_ta: 'Vảy bạc, to khỏe' },
  { loai_ca: 'ca_dia',       ma: '#CA008', ten: 'Cá Đĩa',     mo_ta: 'Tròn dẹt, kẻ sọc' },
]

const BACKGROUNDS = [
  { id: 'ocean-shallow', ten: 'Đại dương',   mau1: '#1a3a5c', mau2: '#0a1628' },
  { id: 'ocean-deep',    ten: 'Biển thẳm',   mau1: '#0a1628', mau2: '#050d1a' },
  { id: 'coral-reef',    ten: 'Rạn san hô',  mau1: '#1a3a5c', mau2: '#2d1810' },
  { id: 'twilight',      ten: 'Hoàng hôn',   mau1: '#1a1a3a', mau2: '#0a0a1a' },
  { id: 'tropical',      ten: 'Nhiệt đới',   mau1: '#0a2e3a', mau2: '#061820' },
  { id: 'sunset',        ten: 'Đêm muộn',    mau1: '#2a1a0a', mau2: '#0a0505' },
]

const DAY_HO_LIST = [
  { id: 'cat_trang', ten: 'Cát trắng', mau: '#c8b89a' },
  { id: 'cat_vang',  ten: 'Cát vàng',  mau: '#d4a84a' },
  { id: 'soi_den',   ten: 'Sỏi đen',   mau: '#3a3a4a' },
  { id: 'san_ho',    ten: 'San hô',     mau: '#cc6655' },
]

const TRANG_TRI = [
  { id: 'rong_bien',  ten: 'Rong biển',   icon: '🌿' },
  { id: 'san_ho_cay', ten: 'San hô cây',  icon: '🪸' },
  { id: 'da_cuoi',    ten: 'Đá cuội',     icon: '🪨' },
  { id: 'kho_bau',    ten: 'Kho báu',     icon: '🏺' },
  { id: 'vo_oc',      ten: 'Vỏ ốc',       icon: '🐚' },
  { id: 'hai_quy',    ten: 'Hải quỳ',     icon: '🌺' },
]

function phuHop(item, q) {
  if (!q) return true
  const k = q.toLowerCase()
  return item.ten.toLowerCase().includes(k) || item.ma?.toLowerCase().includes(k)
}

export default function ShopPanel({
  onThemCa, onDong,
  nenHo, dayHo,
  onChonNen, onChonDay,
}) {
  const [tab, setTab]       = useState('ca')
  const [modal, setModal]   = useState(null)
  const [tuKhoa, setTuKhoa] = useState('')
  const cardRefs            = useRef({})

  useEffect(() => {
    if (!tuKhoa || tab !== 'ca') return
    const match = LOAI_CA_SHOP.find(item => phuHop(item, tuKhoa))
    if (match && cardRefs.current[match.loai_ca]) {
      cardRefs.current[match.loai_ca].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [tuKhoa, tab])

  function khiMuaXong(ca) {
    onThemCa(ca)
    setModal(null)
  }

  const coTimKiem = tuKhoa.trim().length > 0

  const TABS = [
    { id: 'ca',       label: '🐠 Cá' },
    { id: 'nen',      label: '🌊 Nền' },
    { id: 'trang_tri',label: '✨ Trang trí' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onDong} />

      <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-ho-sau border-l border-ho-anh/15 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ho-anh/10 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Cửa hàng</h2>
            <p className="text-ho-anh/45 text-xs mt-0.5">Trang trí hồ cá của bạn</p>
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
        <div className="flex-1 overflow-y-auto shop-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(96,165,250,0.3) transparent' }}>

          {/* ── Tab: Cá ── */}
          {tab === 'ca' && (
            <div className="px-4 pb-6">
              {/* Search */}
              <div className="relative mt-3 mb-3">
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
                  const matched  = coTimKiem && phuHop(item, tuKhoa)
                  const notMatch = coTimKiem && !phuHop(item, tuKhoa)
                  return (
                    <div
                      key={item.loai_ca}
                      ref={el => { cardRefs.current[item.loai_ca] = el }}
                      className="flex flex-col items-center bg-ho-nong border rounded-2xl px-3 py-4 transition-all duration-300"
                      style={{
                        borderColor: matched ? 'rgba(96,165,250,0.7)' : 'rgba(96,165,250,0.1)',
                        opacity:     notMatch ? 0.35 : 1,
                        boxShadow:   matched ? '0 0 18px 4px rgba(96,165,250,0.22)' : 'none',
                      }}
                    >
                      <FishIcon loaiCa={item.loai_ca} size={68} />
                      <div className="font-semibold text-white text-sm text-center mt-1 leading-tight">{item.ten}</div>
                      <div className="text-ho-anh/45 text-[11px] font-mono mt-0.5 mb-2">{item.ma}</div>
                      <div className="text-green-400 text-xs font-semibold mb-2">Miễn phí</div>
                      <button
                        onClick={() => setModal({ loai_ca: item.loai_ca, ten: item.ten })}
                        className="w-full bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold py-1.5 rounded-xl text-xs transition"
                      >
                        Chọn
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

              {/* Background */}
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
                        {/* Gradient preview */}
                        <div
                          className="h-14 w-full"
                          style={{ background: `linear-gradient(to bottom, ${bg.mau1}, ${bg.mau2})` }}
                        />
                        <div className="bg-ho-nong px-2 py-1.5 flex items-center justify-between">
                          <span className="text-white text-xs font-medium">{bg.ten}</span>
                          {selected && <span className="text-ho-anh text-sm">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Đáy hồ */}
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
                  <div
                    key={item.id}
                    className="flex flex-col items-center bg-ho-nong border border-ho-anh/10 rounded-2xl px-3 py-4 relative"
                  >
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
