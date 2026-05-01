import { useState } from 'react'
import { API } from '../lib/api'

export default function FeedbackPopup({ onDong }) {
  const [da_chon, setDaChon] = useState(null)
  const [dang_gui, setDangGui] = useState(false)

  async function gui(liked) {
    if (dang_gui) return
    setDaChon(liked)
    setDangGui(true)
    try {
      await API.danhGia(liked)
    } catch {}
    setTimeout(onDong, 900)
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-end justify-center pb-28 px-4 pointer-events-none">
      <div
        className="pointer-events-auto bg-ho-sau/95 border border-ho-anh/25 rounded-2xl px-5 py-4 shadow-2xl max-w-xs w-full"
        style={{ backdropFilter: 'blur(14px)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-white font-semibold text-sm">Bạn thích Soundarium không?</div>
            <div className="text-ho-anh/50 text-xs mt-0.5">Giúp chúng mình cải thiện nhé 🙏</div>
          </div>
          <button
            onClick={onDong}
            className="text-ho-anh/30 hover:text-ho-anh/60 text-lg leading-none ml-2 transition"
          >✕</button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => gui(true)}
            disabled={dang_gui}
            className={`flex-1 py-2.5 rounded-xl text-xl transition ${
              da_chon === true
                ? 'bg-green-500/30 border border-green-400/50'
                : 'bg-ho-anh/10 hover:bg-ho-anh/20 border border-ho-anh/20'
            }`}
          >
            👍
          </button>
          <button
            onClick={() => gui(false)}
            disabled={dang_gui}
            className={`flex-1 py-2.5 rounded-xl text-xl transition ${
              da_chon === false
                ? 'bg-red-500/30 border border-red-400/50'
                : 'bg-ho-anh/10 hover:bg-ho-anh/20 border border-ho-anh/20'
            }`}
          >
            👎
          </button>
        </div>
      </div>
    </div>
  )
}
