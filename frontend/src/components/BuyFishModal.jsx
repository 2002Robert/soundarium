import { useState } from 'react'
import { API } from '../lib/api'

export default function BuyFishModal({ loaiCa, tenLoai, onXong, onDong }) {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [nickname, setNickname]     = useState('')
  const [dangThem, setDangThem]     = useState(false)
  const [loi, setLoi]               = useState('')

  async function xacNhan(e) {
    e.preventDefault()
    if (!youtubeUrl.trim()) return
    setDangThem(true)
    setLoi('')
    try {
      const { ca } = await API.themCa(youtubeUrl.trim(), nickname.trim() || undefined, loaiCa)
      onXong(ca)
    } catch (err) {
      setLoi(err.message || 'Link không hợp lệ')
    } finally {
      setDangThem(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-ho-sau border border-ho-anh/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Thêm nhạc cho {tenLoai}</h2>
          <button onClick={onDong} className="text-ho-anh/40 hover:text-white text-xl leading-none">×</button>
        </div>

        <p className="text-ho-anh/60 text-sm mb-5">
          Mỗi con cá là một bài nhạc. Paste link YouTube để con {tenLoai} của bạn mang theo bài nhạc đó.
        </p>

        <form onSubmit={xacNhan} className="space-y-3">
          <div>
            <label className="text-ho-anh/60 text-xs mb-1 block">Link YouTube *</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              required
              className="w-full bg-ho-nong border border-ho-anh/20 rounded-xl px-4 py-3 text-white placeholder-ho-anh/30 focus:outline-none focus:border-ho-anh text-sm"
            />
          </div>

          <div>
            <label className="text-ho-anh/60 text-xs mb-1 block">Tên cá (không bắt buộc)</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Đặt tên cho cá..."
              maxLength={30}
              className="w-full bg-ho-nong border border-ho-anh/20 rounded-xl px-4 py-3 text-white placeholder-ho-anh/30 focus:outline-none focus:border-ho-anh text-sm"
            />
          </div>

          {loi && (
            <div className="text-red-400 text-sm bg-red-400/10 rounded-xl p-3">{loi}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onDong}
              className="flex-1 border border-ho-anh/20 text-ho-anh/60 hover:text-ho-anh py-3 rounded-xl text-sm transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={dangThem || !youtubeUrl.trim()}
              className="flex-1 bg-ho-anh hover:bg-ho-accent text-ho-sau font-bold py-3 rounded-xl text-sm transition disabled:opacity-50"
            >
              {dangThem ? '...' : 'Thêm cá vào hồ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
