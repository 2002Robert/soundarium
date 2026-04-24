import { useState } from 'react'
import BuyFishModal from '../components/BuyFishModal'

// Danh sách cá cảnh cơ bản — tạm thời hardcode, sau gọi từ API
const LOAI_CA_SHOP = [
  { loai_ca: 'ca_vang',      ten: 'Cá Vàng',        mo_ta: 'Cá vàng hiền lành, dễ nuôi',      mau_demo: '#FFD700' },
  { loai_ca: 'ca_neon',      ten: 'Cá Neon',         mo_ta: 'Sọc xanh đỏ rực rỡ',              mau_demo: '#00BFFF' },
  { loai_ca: 'ca_betta',     ten: 'Cá Betta',        mo_ta: 'Đuôi dài, màu sắc đẹp',           mau_demo: '#9B59B6' },
  { loai_ca: 'ca_clownfish', ten: 'Cá Hề',           mo_ta: 'Cam trắng quen thuộc',             mau_demo: '#FF6B35' },
  { loai_ca: 'ca_tang',      ten: 'Cá Tang',         mo_ta: 'Tròn trĩnh, màu xanh dương',      mau_demo: '#2ECC71' },
  { loai_ca: 'ca_angel',     ten: 'Cá Thiên Thần',   mo_ta: 'Vây dài thanh thoát',              mau_demo: '#F39C12' },
  { loai_ca: 'ca_guppy',     ten: 'Cá Guppy',        mo_ta: 'Nhỏ nhắn, đuôi quạt',             mau_demo: '#E91E63' },
  { loai_ca: 'ca_tetra',     ten: 'Cá Tetra',        mo_ta: 'Bơi theo đàn, rất linh hoạt',     mau_demo: '#1ABC9C' },
]

export default function Shop() {
  const [modal, setModal] = useState(null)  // { loai_ca, ten }

  function khiMuaXong(ca) {
    // Gửi cá mới về Home qua localStorage event (cross-tab/cross-component)
    localStorage.setItem('snd_ca_moi', JSON.stringify(ca))
    setTimeout(() => localStorage.removeItem('snd_ca_moi'), 100)
    setModal(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-ho-sau text-white">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <a href="/" className="text-ho-anh/60 hover:text-ho-anh text-sm transition">← Hồ của tôi</a>
          <h1 className="text-xl font-bold">Cửa hàng cá</h1>
        </div>

        <p className="text-ho-anh/50 text-sm mb-6">
          Mỗi con cá mang theo một bài nhạc. Chọn loài cá, paste link YouTube là xong.
        </p>

        {/* Danh sách cá */}
        <div className="space-y-3">
          {LOAI_CA_SHOP.map(item => (
            <div
              key={item.loai_ca}
              className="flex items-center gap-4 bg-ho-nong border border-ho-anh/10 rounded-2xl px-4 py-4 hover:border-ho-anh/30 transition"
            >
              {/* Avatar cá (vẽ tạm bằng emoji circle màu) */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${item.mau_demo}22`, border: `2px solid ${item.mau_demo}66` }}
              >
                🐟
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{item.ten}</div>
                <div className="text-ho-anh/50 text-xs mt-0.5">{item.mo_ta}</div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-green-400 text-sm font-semibold">Miễn phí</span>
                <button
                  onClick={() => setModal({ loai_ca: item.loai_ca, ten: item.ten })}
                  className="bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold px-4 py-2 rounded-xl text-sm transition"
                >
                  Chọn
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-ho-anh/30 text-xs text-center mt-8">
          {/* TODO STRIPE: Thêm cá premium và thanh toán thật tại đây */}
          Thêm nhiều loài cá đặc biệt sắp ra mắt ✨
        </p>
      </div>

      {/* Modal paste link sau khi chọn loài */}
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
