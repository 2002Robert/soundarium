import { useState } from 'react'
import { API } from '../lib/api'

export default function FishEditMenu({ ca, x, y, onDong, onCapNhat, onXoa }) {
  const [nickname, setNickname] = useState(ca.nickname || '')
  const [youtubeUrl, setYoutubeUrl] = useState(ca.youtube_url || '')
  const [dangLuu, setDangLuu] = useState(false)
  const [hienCanhBao, setHienCanhBao] = useState(false)

  async function luuThayDoi() {
    setDangLuu(true)
    try {
      const data = await API.chinhSuaCa(ca.id, {
        nickname:    nickname || undefined,
        youtube_url: youtubeUrl !== ca.youtube_url ? youtubeUrl : undefined,
      })
      onCapNhat?.(data.ca)
      onDong()
    } catch (err) {
      alert(err.message)
    } finally {
      setDangLuu(false)
    }
  }

  async function xacNhanXoa() {
    if (!confirm(`Xóa cá "${ca.nickname || ca.ten_bai}"? Hành động này không hoàn tác được.`)) return
    await API.xoaCa(ca.id)
    onXoa?.(ca.id)
    onDong()
  }

  // Vị trí menu không vượt ra ngoài màn hình
  const menuX = Math.min(x, window.innerWidth  - 280)
  const menuY = Math.min(y, window.innerHeight - 320)

  return (
    <div
      className="fixed z-50 bg-ho-sau/95 border border-ho-anh/30 rounded-xl p-4 w-64 shadow-2xl"
      style={{ left: menuX, top: menuY }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-ho-anh font-semibold text-sm">
          {ca.nickname || ca.ten_bai}
        </span>
        <button
          onClick={onDong}
          className="text-ho-anh/50 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="text-xs text-ho-anh/50 mb-3">
        Level {ca.level} · {Math.round(ca.xp)} XP
      </div>

      <label className="block text-xs text-ho-anh/70 mb-1">Tên cá</label>
      <input
        className="w-full bg-ho-nong border border-ho-anh/20 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-ho-anh"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        placeholder="Đặt tên cho cá..."
        maxLength={30}
      />

      <label className="block text-xs text-ho-anh/70 mb-1">Link YouTube</label>
      {hienCanhBao ? (
        <div className="text-xs text-amber-400 bg-amber-400/10 rounded-lg p-2 mb-2">
          Level và XP sẽ giữ nguyên khi đổi bài nhạc.
        </div>
      ) : null}
      <input
        className="w-full bg-ho-nong border border-ho-anh/20 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-ho-anh"
        value={youtubeUrl}
        onChange={e => { setYoutubeUrl(e.target.value); setHienCanhBao(true) }}
        placeholder="https://youtube.com/watch?v=..."
      />

      <button
        onClick={luuThayDoi}
        disabled={dangLuu}
        className="w-full bg-ho-anh text-ho-sau font-semibold py-2 rounded-lg text-sm hover:bg-ho-accent transition mb-2 disabled:opacity-50"
      >
        {dangLuu ? 'Đang lưu...' : 'Lưu'}
      </button>

      <button
        onClick={xacNhanXoa}
        className="w-full text-red-400 hover:text-red-300 text-sm py-1 transition"
      >
        Xóa cá này
      </button>
    </div>
  )
}
