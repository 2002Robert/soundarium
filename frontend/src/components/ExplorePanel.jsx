import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ExplorePanel({ onDong }) {
  const navigate = useNavigate()
  const [tuKhoa, setTuKhoa]   = useState('')
  const [xacNhan, setXacNhan] = useState(null)

  function timHo(e) {
    e.preventDefault()
    const un = tuKhoa.trim()
    if (!un) return
    setXacNhan(un)
  }

  function thamHo() {
    navigate(`/u/${xacNhan}`)
    onDong()
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onDong} />

      <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-ho-sau border-l border-ho-anh/15 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ho-anh/10 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Khám phá</h2>
            <p className="text-ho-anh/45 text-xs mt-0.5">Thăm hồ cá của người khác</p>
          </div>
          <button onClick={onDong} className="text-ho-anh/40 hover:text-white text-2xl leading-none transition">×</button>
        </div>

        {/* Search username */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="text-ho-anh/50 text-xs font-semibold uppercase tracking-wide mb-2">Tìm theo username</div>
          <form onSubmit={timHo} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ho-anh/35 text-sm pointer-events-none">@</span>
              <input
                type="text"
                placeholder="username..."
                value={tuKhoa}
                onChange={e => setTuKhoa(e.target.value)}
                className="w-full bg-ho-nong border border-ho-anh/20 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder-ho-anh/30 focus:outline-none focus:border-ho-anh/50 transition"
              />
            </div>
            <button
              type="submit"
              disabled={!tuKhoa.trim()}
              className="px-4 py-2.5 bg-ho-anh hover:bg-ho-accent disabled:opacity-40 disabled:cursor-not-allowed text-ho-sau font-semibold rounded-xl text-sm transition"
            >
              Thăm
            </button>
          </form>
        </div>

        {/* Random list placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center text-ho-anh/25 gap-2">
          <div className="text-6xl">🌊</div>
          <p className="text-sm font-medium">Danh sách ngẫu nhiên</p>
          <p className="text-xs">Sắp ra mắt</p>
        </div>

        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          <p className="text-ho-anh/20 text-xs text-center">
            Nhập username để thăm hồ cá của bạn bè
          </p>
        </div>
      </div>

      {/* Confirmation dialog */}
      {xacNhan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/55" onClick={() => setXacNhan(null)} />
          <div className="relative bg-ho-sau border border-ho-anh/20 rounded-2xl p-6 w-full max-w-[290px] shadow-2xl">
            <div className="text-2xl text-center mb-3">🐟</div>
            <div className="text-white font-bold text-base text-center mb-1">Thăm hồ cá?</div>
            <p className="text-ho-anh/60 text-sm text-center mb-5">
              Bạn có muốn thăm hồ của{' '}
              <span className="text-white font-semibold">@{xacNhan}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setXacNhan(null)}
                className="flex-1 py-2.5 border border-ho-anh/20 text-ho-anh/50 hover:text-ho-anh hover:border-ho-anh/40 rounded-xl text-sm transition"
              >
                Huỷ
              </button>
              <button
                onClick={thamHo}
                className="flex-1 py-2.5 bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold rounded-xl text-sm transition"
              >
                Thăm hồ →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
