import { useState, useEffect } from 'react'
import { LOAI_CA } from '../constants/fishTypes'
import { API } from '../lib/api'

const DELAY_AN_MS = 15 * 60 * 1000  // 15 phút

function tinhCooldown(caId) {
  const raw = localStorage.getItem(`snd_an_${caId}`)
  if (!raw) return null
  const t = Number(raw)
  const now = Date.now()
  const diff = DELAY_AN_MS - (now - t)
  return diff > 0 ? diff : null
}

function formatCooldown(ms) {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function FishInfoPanel({
  ca,
  x, y,
  dangPhat,
  onTogglePhat,
  onCapNhat,
  onXoa,
  onDong,
  onMoQuanLyCa,
  onCoinGain,
}) {
  const [cheDoSua, setCheDoSua]       = useState(false)
  const [nickname, setNickname]       = useState(ca.nickname || '')
  const [youtubeUrl, setYoutubeUrl]   = useState(ca.youtube_url || '')
  const [dangLuu, setDangLuu]         = useState(false)
  const [loi, setLoi]                 = useState('')
  const [dangAn, setDangAn]           = useState(false)
  const [cdMs, setCdMs]               = useState(() => tinhCooldown(ca.id))

  useEffect(() => {
    if (!cdMs) return
    const id = setInterval(() => {
      const left = tinhCooldown(ca.id)
      setCdMs(left)
      if (!left) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [cdMs, ca.id])

  const tenLoai = LOAI_CA[ca.loai_ca]?.ten || ca.loai_ca || 'Cá'
  const tenHienThi = ca.nickname || ca.ten_bai || tenLoai

  const XP_NGUONG = [0, 0, 60, 180, 420, 900]
  const xpHienTai = ca.xp || 0
  const level     = ca.level || 1
  const xpDauLv   = XP_NGUONG[level] ?? 0
  const xpSauLv   = level < 5 ? (XP_NGUONG[level + 1] ?? null) : null
  const phanTramXP = xpSauLv
    ? Math.min(100, Math.round(((xpHienTai - xpDauLv) / (xpSauLv - xpDauLv)) * 100))
    : 100

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

  async function choAn() {
    if (cdMs || dangAn) return
    setDangAn(true)
    try {
      const res = await API.choAnCa(ca.id)
      onCapNhat?.(res.ca)
      onCoinGain?.(res.coins_hien_tai)
      localStorage.setItem(`snd_an_${ca.id}`, String(Date.now()))
      setCdMs(DELAY_AN_MS)
    } catch {}
    setDangAn(false)
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
        <div className="mt-1.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-ho-anh/40 text-xs">Lv.{level}</span>
            {ca.truong_thanh && (
              <span className="text-[10px] bg-amber-400/15 text-amber-300/90 border border-amber-400/25 rounded px-1 leading-[1.5]">
                ★ Trưởng thành
              </span>
            )}
            <span className="text-ho-anh/25 text-[10px] ml-auto">{Math.round(xpHienTai)} XP</span>
          </div>
          {xpSauLv && (
            <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${phanTramXP}%`, background: 'rgba(96,165,250,0.55)' }}
              />
            </div>
          )}
        </div>
      </div>

      {!cheDoSua ? (
        /* Chế độ xem */
        <div className="px-3 pb-3 space-y-2">
          {/* Feed button */}
          <button
            onClick={choAn}
            disabled={!!cdMs || dangAn}
            title={cdMs ? `Đang tiêu hoá (${formatCooldown(cdMs)})` : 'Cho cá ăn (+1 XP)'}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition mb-2 ${
              cdMs
                ? 'bg-ho-nong text-ho-anh/40 cursor-not-allowed'
                : 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400'
            }`}
          >
            {cdMs ? `⏳ ${formatCooldown(cdMs)}` : dangAn ? '...' : '🍖 Cho ăn (+1 XP)'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onTogglePhat}
              className="flex-1 bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold py-2 rounded-xl text-sm transition"
            >
              {dangPhat ? '⏸ Dừng' : '▶ Nghe'}
            </button>
            <button
              onClick={() => setCheDoSua(true)}
              className="px-3 py-2 border border-ho-anh/30 hover:border-ho-anh text-ho-anh/70 hover:text-ho-anh rounded-xl text-sm transition"
              title="Sửa cá"
            >
              ✎
            </button>
            <button
              onClick={() => { onDong(); onMoQuanLyCa?.() }}
              className="px-3 py-2 border border-red-400/20 hover:border-red-400/50 text-red-400/50 hover:text-red-400 rounded-xl text-sm transition"
              title="Quản lý & xóa cá"
            >
              🗑
            </button>
          </div>
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
        </div>
      )}
    </div>
  )
}
