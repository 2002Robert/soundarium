import { useState, useEffect } from 'react'
import { LOAI_CA } from '../constants/fishTypes'
import { API } from '../lib/api'

const HUNGER_MS = 45 * 60 * 1000

const RARITY_MAP = {
  ca_vang: 'common',   ca_neon: 'common',
  ca_betta: 'uncommon', ca_clownfish: 'uncommon',
  ca_tang: 'rare',     ca_koi: 'rare',
  ca_chep: 'epic',     ca_dia: 'epic', sua_gai: 'epic',
}
const XP_TRUONG_THANH = { common: 10, uncommon: 15, rare: 20, epic: 30 }

function tinhMsNo(ca) {
  const fromProp = ca.lan_cho_an_cuoi ? new Date(ca.lan_cho_an_cuoi).getTime() : 0
  const fromLocal = Number(localStorage.getItem(`snd_an_${ca.id}`)) || 0
  const lastFed = Math.max(fromProp, fromLocal)
  return lastFed ? Math.max(0, HUNGER_MS - (Date.now() - lastFed)) : 0
}

export default function FishInfoPanel({
  ca, x, y,
  dangPhat, onTogglePhat,
  onCapNhat, onXoa, onDong, onMoQuanLyCa,
}) {
  const [cheDoSua, setCheDoSua] = useState(false)
  const [nickname, setNickname] = useState(ca.nickname || '')
  const [youtubeUrl, setYoutubeUrl] = useState(ca.youtube_url || '')
  const [dangLuu, setDangLuu]   = useState(false)
  const [loi, setLoi]           = useState('')
  const [msNo, setMsNo]         = useState(() => tinhMsNo(ca))

  // Cập nhật khi ca thay đổi (sau khi ăn)
  useEffect(() => { setMsNo(tinhMsNo(ca)) }, [ca.lan_cho_an_cuoi])

  // Đếm ngược no mỗi 30 giây
  useEffect(() => {
    if (!msNo) return
    const id = setInterval(() => {
      const left = tinhMsNo(ca)
      setMsNo(left)
      if (!left) clearInterval(id)
    }, 30_000)
    return () => clearInterval(id)
  }, [!!msNo, ca.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const tenLoai    = LOAI_CA[ca.loai_ca]?.ten || ca.loai_ca || 'Cá'
  const tenHienThi = ca.nickname || ca.ten_bai || tenLoai
  const isMature   = ca.truong_thanh === true
  const rarity     = RARITY_MAP[ca.loai_ca] || 'common'
  const xpNguong   = XP_TRUONG_THANH[rarity]
  const xpHienTai  = Math.round(ca.xp || 0)
  const phanTramXP = Math.min(100, Math.round((xpHienTai / xpNguong) * 100))
  const phutNo     = Math.ceil(msNo / 60_000)

  const panelX = Math.min(x, window.innerWidth - 260)
  const panelY = Math.min(y + 10, window.innerHeight - 320)

  async function luuChinhSua() {
    setDangLuu(true); setLoi('')
    try {
      const data = await API.chinhSuaCa(ca.id, {
        nickname: nickname || undefined,
        youtube_url: youtubeUrl !== ca.youtube_url ? youtubeUrl : undefined,
      })
      onCapNhat?.(data.ca)
      setCheDoSua(false)
    } catch (err) { setLoi(err.message) }
    finally { setDangLuu(false) }
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
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-1.5">
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{tenHienThi}</div>
          <div className="text-ho-anh/45 text-xs truncate">{tenLoai}</div>
        </div>
        <button onClick={onDong} className="text-ho-anh/35 hover:text-white ml-2 text-lg leading-none">×</button>
      </div>

      {/* ── Nhạc ── */}
      <div className="px-4 pb-2.5">
        <div className="text-ho-anh/55 text-xs truncate">♪ {ca.ten_bai || '—'}</div>
        {ca.ten_kenh && <div className="text-ho-anh/30 text-[11px] truncate">{ca.ten_kenh}</div>}
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-ho-anh/10" />

      {/* ── Trạng thái ── */}
      <div className="px-4 py-2.5 space-y-1.5">
        {/* Tên trạng thái + XP */}
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-xs font-medium">
            {isMature ? '🐠 Cá trưởng thành' : '🐟 Cá con'}
          </span>
          <span className="text-ho-anh/35 text-[11px] tabular-nums">
            {xpHienTai}&thinsp;/&thinsp;{xpNguong} XP
          </span>
        </div>

        {/* XP bar — chỉ khi chưa trưởng thành */}
        {!isMature && (
          <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${phanTramXP}%`, background: 'rgba(96,165,250,0.55)' }}
            />
          </div>
        )}

        {/* No / Đói */}
        <div className={`text-[11px] ${msNo > 0 ? 'text-ho-anh/40' : 'text-amber-400/80'}`}>
          {msNo > 0 ? `⏱ No còn: ${phutNo} phút` : '😋 Đang đói'}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-ho-anh/10" />

      {/* ── Actions ── */}
      {!cheDoSua ? (
        <div className="px-3 py-2.5">
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
            >✎</button>
            <button
              onClick={() => { onDong(); onMoQuanLyCa?.() }}
              className="px-3 py-2 border border-red-400/20 hover:border-red-400/50 text-red-400/50 hover:text-red-400 rounded-xl text-sm transition"
              title="Quản lý & xóa cá"
            >🗑</button>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2.5 space-y-2">
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
            >{dangLuu ? '...' : 'Lưu'}</button>
            <button
              onClick={() => { setCheDoSua(false); setLoi('') }}
              className="px-3 py-2 text-ho-anh/50 hover:text-ho-anh text-sm transition"
            >Huỷ</button>
          </div>
        </div>
      )}
    </div>
  )
}
