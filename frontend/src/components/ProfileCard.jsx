import { useState, useEffect, useRef } from 'react'
import { API } from '../lib/api'
import { supabase } from '../lib/supabase'
import FishIcon from './FishIcon'
import { tinhLevelTuExp, expTrongLevel, expCanLenLevel } from '../constants/playerLevel'

const LOAI_CA = [
  { loai_ca: 'ca_vang',      ten: 'Cá Vàng',  mau: '#FFB300' },
  { loai_ca: 'ca_neon',      ten: 'Cá Neon',   mau: '#1E88E5' },
  { loai_ca: 'ca_betta',     ten: 'Cá Betta',  mau: '#8E24AA' },
  { loai_ca: 'ca_clownfish', ten: 'Cá Hề',     mau: '#FF5722' },
  { loai_ca: 'ca_tang',      ten: 'Cá Tang',   mau: '#1565C0' },
  { loai_ca: 'ca_koi',       ten: 'Cá Koi',    mau: '#FF6D00' },
  { loai_ca: 'ca_chep',      ten: 'Cá Chép',   mau: '#78909C' },
  { loai_ca: 'ca_dia',       ten: 'Cá Đĩa',    mau: '#00838F' },
]

function getMau(loaiCa) {
  return LOAI_CA.find(x => x.loai_ca === loaiCa)?.mau ?? '#FFB300'
}

const CARD_STYLE = {
  background: 'rgba(10,22,40,0.78)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(96,165,250,0.13)',
}

export default function ProfileCard({
  danhSachCa, coins, ngocTrai = 0, onProfileLoad, playerExp = 0,
}) {
  const [profile, setProfile]       = useState(null)
  const [dangSuaTen, setDangSuaTen] = useState(false)
  const [tenMoi, setTenMoi]         = useState('')
  const [loiTen, setLoiTen]         = useState('')
  const [dangLuu, setDangLuu]       = useState(false)
  const [hienPicker, setHienPicker] = useState(false)
  const [toast, setToast]           = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    API.layProfile()
      .then(res => {
        if (res?.profile) { setProfile(res.profile); onProfileLoad?.(res.profile) }
      })
      .catch(async () => {
        try {
          const { data } = await supabase.auth.getUser()
          if (data?.user) {
            const fallback = {
              username: data.user.user_metadata?.full_name
                || data.user.email?.split('@')[0] || 'Người chơi',
              player_exp: 0, avatar_loai_ca: 'ca_vang', da_doi_username: false,
            }
            setProfile(fallback)
            onProfileLoad?.(fallback)
          }
        } catch {}
      })
  }, [])

  useEffect(() => { if (dangSuaTen) inputRef.current?.focus() }, [dangSuaTen])

  // Loading skeleton
  if (!profile) {
    return (
      <div className="px-3.5 py-3 rounded-2xl" style={{ ...CARD_STYLE, minWidth: 212 }}>
        <div className="flex items-center gap-2.5">
          <div className="rounded-full shrink-0 animate-pulse" style={{ width: 44, height: 44, background: 'rgba(96,165,250,0.12)' }} />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'rgba(96,165,250,0.12)' }} />
            <div className="h-2.5 w-10 rounded animate-pulse" style={{ background: 'rgba(96,165,250,0.08)' }} />
            <div className="h-2 w-28 rounded animate-pulse" style={{ background: 'rgba(96,165,250,0.07)' }} />
          </div>
        </div>
        <div className="h-[5px] w-full mt-3 rounded-full animate-pulse" style={{ background: 'rgba(96,165,250,0.08)' }} />
      </div>
    )
  }

  const avatarLoai  = profile.avatar_loai_ca || 'ca_vang'
  const mauVien     = getMau(avatarLoai)
  const avatarStyle = {
    width: 44, height: 44,
    background: `${mauVien}28`,
    boxShadow: `0 0 0 2px ${mauVien}bb`,
  }

  const level  = tinhLevelTuExp(playerExp)
  const inLv   = expTrongLevel(playerExp)
  const needLv = expCanLenLevel(level)
  const pct    = Math.min(100, Math.round((inLv / needLv) * 100))

  function batDauSua() { setTenMoi(profile.username || ''); setLoiTen(''); setDangSuaTen(true) }
  function huy()       { setDangSuaTen(false); setLoiTen('') }

  function validate(ten) {
    if (ten.length < 3)                   return 'Tối thiểu 3 ký tự'
    if (ten.length > 20)                  return 'Tối đa 20 ký tự'
    if (!/^[a-zA-Z0-9_]+$/.test(ten))    return 'Chỉ dùng chữ, số, dấu _'
    return null
  }

  async function luuTen() {
    const ten = tenMoi.trim()
    const loi = validate(ten)
    if (loi) { setLoiTen(loi); return }
    setDangLuu(true)
    try {
      const res = await API.capNhatTenHienThi(ten)
      setProfile(p => ({ ...p, username: res.profile.username, da_doi_username: true }))
      setDangSuaTen(false)
      hienToast('Đã đổi username. Bạn không thể đổi lại.')
    } catch (err) { setLoiTen(err.message || 'Lỗi khi lưu') }
    finally { setDangLuu(false) }
  }

  async function chonAvatar(loaiCa) {
    try {
      await API.capNhatAvatar(loaiCa)
      setProfile(p => ({ ...p, avatar_loai_ca: loaiCa }))
      setHienPicker(false)
    } catch {}
  }

  function hienToast(msg) { setToast(msg); setTimeout(() => setToast(null), 4500) }

  return (
    <>
      <div className="px-3.5 py-3 rounded-2xl" style={{ ...CARD_STYLE, minWidth: 212 }}>

        {/* Rows 1–3: Avatar + info block */}
        <div className="flex items-start gap-2.5">

          {/* Avatar */}
          <div
            className="relative shrink-0 cursor-pointer group mt-0.5"
            onClick={() => setHienPicker(true)}
            title="Đổi avatar"
          >
            <div className="rounded-full overflow-hidden" style={avatarStyle}>
              <FishIcon loaiCa={avatarLoai} fill />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white/90 text-xs select-none">
              ✎
            </div>
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Username + edit */}
            {dangSuaTen ? (
              <div>
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    value={tenMoi}
                    onChange={e => { setTenMoi(e.target.value); setLoiTen('') }}
                    onKeyDown={e => { if (e.key === 'Enter') luuTen(); if (e.key === 'Escape') huy() }}
                    maxLength={20}
                    placeholder="username"
                    className="bg-ho-nong border border-ho-anh/40 rounded-lg px-2 py-0.5 text-white text-sm w-28 focus:outline-none focus:border-ho-anh"
                  />
                  <button onClick={luuTen} disabled={dangLuu} className="text-green-400 hover:text-green-300 text-sm font-bold leading-none disabled:opacity-40">✓</button>
                  <button onClick={huy} className="text-red-400/60 hover:text-red-400 text-sm leading-none">✕</button>
                </div>
                {loiTen && <div className="text-red-400 text-[10px] mt-0.5">{loiTen}</div>}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold text-sm truncate">{profile.username}</span>
                  {!profile.da_doi_username && (
                    <button
                      onClick={batDauSua}
                      className="text-ho-anh/35 hover:text-ho-anh text-xs transition shrink-0 leading-none"
                      title="Đổi username (1 lần)"
                    >✎</button>
                  )}
                </div>

                {/* Row 2: Level */}
                <div className="text-yellow-300/80 font-bold text-sm leading-snug">Lv.{level}</div>

                {/* Row 3: Stats */}
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-white/45 text-xs">🐟 {danhSachCa.length}</span>
                  <span className="text-white/45 text-xs">💰 {coins.toLocaleString()}</span>
                  <span className="text-white/45 text-xs">💎 {ngocTrai}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 4: EXP bar */}
        {!dangSuaTen && (
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-ho-anh/45 text-[10px] font-medium w-6 shrink-0">EXP</span>
            <div
              className="flex-1 h-[5px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#3b82f6,#60a5fa)' }}
              />
            </div>
            <span className="text-ho-anh/45 text-[10px] tabular-nums shrink-0">{inLv}/{needLv}</span>
          </div>
        )}
      </div>

      {toast && <ToastMsg msg={toast} />}
      {hienPicker && (
        <AvatarPicker avatarLoai={avatarLoai} onChon={chonAvatar} onDong={() => setHienPicker(false)} />
      )}
    </>
  )
}

function ToastMsg({ msg }) {
  return (
    <div
      className="absolute top-16 left-4 bg-ho-nong border border-ho-anh/20 rounded-xl px-4 py-2.5 text-white text-xs max-w-[260px] shadow-xl"
      style={{ backdropFilter: 'blur(8px)', zIndex: 100 }}
    >
      {msg}
    </div>
  )
}

function AvatarPicker({ avatarLoai, onChon, onDong }) {
  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4" onClick={onDong}>
      <div
        className="bg-ho-sau border border-ho-anh/15 rounded-2xl p-5 w-full max-w-[300px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Chọn avatar</h3>
          <button onClick={onDong} className="text-ho-anh/40 hover:text-ho-anh transition">✕</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {LOAI_CA.map(item => (
            <button
              key={item.loai_ca}
              onClick={() => onChon(item.loai_ca)}
              className="flex flex-col items-center gap-1 py-2 rounded-xl transition"
              style={{
                border: avatarLoai === item.loai_ca ? `2px solid ${item.mau}` : '2px solid transparent',
                background: avatarLoai === item.loai_ca ? `${item.mau}18` : 'transparent',
              }}
            >
              <FishIcon loaiCa={item.loai_ca} size={44} />
              <span className="text-ho-anh/55 text-[9px] leading-tight text-center">{item.ten}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
