import { useState } from 'react'
import { LOAI_CA } from '../constants/fishTypes'
import { API } from '../lib/api'

export default function FishInfoPanel({
  ca,
  x, y,
  dangPhat,       // boolean — cá này có đang phát không
  onTogglePhat,   // () => toggle play/pause cá này
  onCapNhat,      // (caMoi) => cập nhật state
  onXoa,          // (caId) => xóa khỏi danh sách
  onDong,         // () => đóng panel
}) {
  const [cheDoSua, setCheDoSua] = useState(false)
  const [nickname, setNickname]   = useState(ca.nickname || '')
  const [youtubeUrl, setYoutubeUrl] = useState(ca.youtube_url || '')
  const [dangLuu, setDangLuu]     = useState(false)
  const [loi, setLoi]             = useState('')

  const tenLoai = LOAI_CA[ca.loai_ca]?.ten || ca.loai_ca || 'Cá'
  const tenHienThi = ca.nickname || ca.ten_bai || tenLoai

  // Giữ panel trong màn hình
  const panelX = Math.min(x, window.innerWidth - 260)
  const panelY = Math.min(y + 10, window.innerHeight - 300)

  async function luuChinhSua() {
    setDangLuu(true)
    setLoi('')
    try {
      const data = await API.chinhSuaCa(ca.id, {
        nickname: nickname || undefined,
        youtube_url: youtubeUrl !== ca.youtube_url ? youtubeUrl : undefined,
      })
      onCapNhat?.(data.ca)
      setCheDoSua(false)
    } catch (err) {
      setLoi(err.message)
    } finally {
      setDangLuu(false)
    }
  }

  async function xacNhanXoa() {
    if (!confirm(`Xóa cá "${tenHienThi}"?`)) return
    await API.xoaCa(ca.id)
    onXoa?.(ca.id)
    onDong()
  }

  return (
    <div
      className="fixed z-50 w-56 bg-ho-sau/95 border border-ho-anh/20 rounded-2xl shadow-2xl overflow-hidden"
      style={{ left: panelX, top: panelY }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{tenHienThi}</div>
          <div className="text-ho-anh/50 text-xs truncate">{tenLoai}</div>
        </div>
        <button onClick={onDong} className="text-ho-anh/40 hover:text-white ml-2 text-lg leading-none">×</button>
      </div>

      {/* Tên nhạc */}
      <div className="px-4 pb-3">
        <div className="text-ho-anh/60 text-xs truncate">🎵 {ca.ten_bai}</div>
        {ca.ten_kenh && <div className="text-ho-anh/40 text-xs truncate">{ca.ten_kenh}</div>}
        <div className="text-ho-anh/30 text-xs mt-1">Lv.{ca.level} · {Math.round(ca.xp)} XP</div>
      </div>

      {!cheDoSua ? (
        /* Chế độ xem */
        <div className="px-3 pb-3 flex gap-2">
          <button
            onClick={onTogglePhat}
            className="flex-1 bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold py-2 rounded-xl text-sm transition"
          >
            {dangPhat ? '⏸ Dừng' : '▶ Nghe'}
          </button>
          <button
            onClick={() => setCheDoSua(true)}
            className="px-3 py-2 border border-ho-anh/30 hover:border-ho-anh text-ho-anh/70 hover:text-ho-anh rounded-xl text-sm transition"
          >
            Sửa
          </button>
        </div>
      ) : (
        /* Chế độ sửa */
        <div className="px-3 pb-3 space-y-2">
          <input
            className="w-full bg-ho-nong border border-ho-anh/20 rounded-lg px-3 py-2 text-sm text-white placeholder-ho-anh/30 focus:outline-none focus:border-ho-anh"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Tên cá..."
            maxLength={30}
          />
          <input
            className="w-full bg-ho-nong border border-ho-anh/20 rounded-lg px-3 py-2 text-sm text-white placeholder-ho-anh/30 focus:outline-none focus:border-ho-anh"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            placeholder="Link YouTube..."
          />
          {loi && <div className="text-red-400 text-xs">{loi}</div>}
          <div className="flex gap-2">
            <button
              onClick={luuChinhSua}
              disabled={dangLuu}
              className="flex-1 bg-ho-anh text-ho-sau font-semibold py-2 rounded-lg text-sm hover:bg-ho-accent transition disabled:opacity-50"
            >
              {dangLuu ? '...' : 'Lưu'}
            </button>
            <button
              onClick={() => { setCheDoSua(false); setLoi('') }}
              className="px-3 py-2 text-ho-anh/50 hover:text-ho-anh text-sm transition"
            >
              Huỷ
            </button>
          </div>
          <button onClick={xacNhanXoa} className="w-full text-red-400/60 hover:text-red-400 text-xs py-1 transition">
            Xóa cá này
          </button>
        </div>
      )}
    </div>
  )
}
