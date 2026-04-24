import { useState, useRef, useEffect } from 'react'
import BuyFishModal from '../components/BuyFishModal'
import FishIcon from '../components/FishIcon'

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

function phuHop(item, tuKhoa) {
  if (!tuKhoa) return true
  const q = tuKhoa.toLowerCase()
  return item.ten.toLowerCase().includes(q) || item.ma.toLowerCase().includes(q)
}

export default function Shop() {
  const [modal, setModal]   = useState(null)
  const [tuKhoa, setTuKhoa] = useState('')
  const cardRefs            = useRef({})

  // Scroll to + highlight the first match when search changes
  useEffect(() => {
    if (!tuKhoa) return
    const match = LOAI_CA_SHOP.find(item => phuHop(item, tuKhoa))
    if (match && cardRefs.current[match.loai_ca]) {
      cardRefs.current[match.loai_ca].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [tuKhoa])

  function khiMuaXong(ca) {
    localStorage.setItem('snd_ca_moi', JSON.stringify(ca))
    setTimeout(() => localStorage.removeItem('snd_ca_moi'), 100)
    setModal(null)
    window.location.href = '/'
  }

  const coTimKiem = tuKhoa.trim().length > 0

  return (
    <div className="bg-ho-sau text-white flex flex-col" style={{ height: '100dvh' }}>
      <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-4 flex-shrink-0">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <a href="/" className="text-ho-anh/60 hover:text-ho-anh text-sm transition">← Hồ của tôi</a>
          <h1 className="text-xl font-bold">Cửa hàng cá</h1>
        </div>

        <p className="text-ho-anh/50 text-xs mb-4">
          Mỗi con cá mang theo một bài nhạc. Chọn loài, paste link YouTube là xong.
        </p>

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ho-anh/40 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Tìm tên cá hoặc mã số (#CA001...)"
            value={tuKhoa}
            onChange={e => setTuKhoa(e.target.value)}
            className="w-full bg-ho-nong border border-ho-anh/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-ho-anh/35 focus:outline-none focus:border-ho-anh/50 transition"
          />
          {tuKhoa && (
            <button
              onClick={() => setTuKhoa('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ho-anh/40 hover:text-ho-anh text-lg leading-none"
            >×</button>
          )}
        </div>
      </div>

      {/* Scrollable grid area */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-8 shop-scroll"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(96,165,250,0.35) transparent' }}
      >
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LOAI_CA_SHOP.map(item => {
            const matched   = coTimKiem && phuHop(item, tuKhoa)
            const notMatch  = coTimKiem && !phuHop(item, tuKhoa)
            return (
              <div
                key={item.loai_ca}
                ref={el => { cardRefs.current[item.loai_ca] = el }}
                className="relative flex flex-col items-center bg-ho-nong border rounded-2xl px-3 py-4 transition-all duration-300 cursor-default"
                style={{
                  borderColor:  matched  ? 'rgba(96,165,250,0.7)'  : 'rgba(96,165,250,0.1)',
                  opacity:      notMatch ? 0.35 : 1,
                  boxShadow:    matched  ? '0 0 18px 4px rgba(96,165,250,0.25)' : 'none',
                }}
              >
                {/* Fish icon */}
                <div className="mb-2">
                  <FishIcon loaiCa={item.loai_ca} size={72} />
                </div>

                {/* Name */}
                <div className="font-semibold text-white text-sm text-center leading-tight">{item.ten}</div>

                {/* Code */}
                <div className="text-ho-anh/50 text-xs mt-0.5 mb-3 font-mono">{item.ma}</div>

                {/* Price + button */}
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

        <p className="text-ho-anh/25 text-xs text-center mt-8">
          Thêm nhiều loài cá đặc biệt sắp ra mắt ✨
        </p>
      </div>

      {modal && (
        <BuyFishModal
          loaiCa={modal.loai_ca}
          tenLoai={modal.ten}
          onXong={khiMuaXong}
          onDong={() => setModal(null)}
        />
      )}
    </div>
  )
}
