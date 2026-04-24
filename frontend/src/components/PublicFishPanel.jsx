import { useState } from 'react'
import { LOAI_CA } from '../constants/fishTypes'

export default function PublicFishPanel({ ca, x, y, onDong }) {
  const [daCopy, setDaCopy] = useState(false)

  const tenHienThi = ca.nickname || ca.ten_bai || 'Không tên'
  const tenLoai    = LOAI_CA[ca.loai_ca]?.ten || ca.loai_ca || 'Cá'

  const panelX = Math.min(x, window.innerWidth - 230)
  const panelY = Math.min(y + 10, window.innerHeight - 220)

  async function copyLink() {
    const link = ca.youtube_url || `https://www.youtube.com/watch?v=${ca.video_id}`
    try {
      await navigator.clipboard.writeText(link)
      setDaCopy(true)
      setTimeout(() => setDaCopy(false), 2500)
    } catch {
      // fallback nếu clipboard API không khả dụng
      const ta = document.createElement('textarea')
      ta.value = link
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setDaCopy(true)
      setTimeout(() => setDaCopy(false), 2500)
    }
  }

  return (
    <div
      className="fixed z-50 w-52 bg-ho-sau/95 border border-ho-anh/20 rounded-2xl shadow-2xl overflow-hidden"
      style={{ left: panelX, top: panelY }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{tenHienThi}</div>
          <div className="text-ho-anh/50 text-xs">{tenLoai}</div>
        </div>
        <button onClick={onDong} className="text-ho-anh/40 hover:text-white ml-2 text-lg leading-none">×</button>
      </div>

      {/* Thông tin nhạc */}
      <div className="px-4 pb-3">
        <div className="text-ho-anh/60 text-xs truncate">🎵 {ca.ten_bai}</div>
        {ca.ten_kenh && (
          <div className="text-ho-anh/40 text-xs truncate">{ca.ten_kenh}</div>
        )}
        <div className="text-ho-anh/25 text-xs mt-1">Lv.{ca.level}</div>
      </div>

      {/* Nút Copy nhạc */}
      <div className="px-3 pb-3">
        <button
          onClick={copyLink}
          className={`w-full font-semibold py-2 rounded-xl text-sm transition ${
            daCopy
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-ho-anh hover:bg-ho-accent text-ho-sau'
          }`}
        >
          {daCopy ? '✓ Đã copy link!' : '📋 Copy link nhạc'}
        </button>
      </div>
    </div>
  )
}
