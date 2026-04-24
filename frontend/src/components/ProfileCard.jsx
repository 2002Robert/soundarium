import { useState, useEffect, useRef } from 'react'
import { API } from '../lib/api'
import FishIcon from './FishIcon'

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

export default function ProfileCard({ danhSachCa, coins, onProfileLoad }) {
  const [profile, setProfile]             = useState(null)
  const [dangSuaTen, setDangSuaTen]       = useState(false)
  const [tenMoi, setTenMoi]               = useState('')
  const [loiTen, setLoiTen]               = useState('')
  const [dangLuu, setDangLuu]             = useState(false)
  const [hienPicker, setHienPicker]       = useState(false)
  const [toast, setToast]                 = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    API.layProfile()
      .then(res => {
        if (res?.profile) {
          setProfile(res.profile)
          onProfileLoad?.(res.profile)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (dangSuaTen) inputRef.current?.focus()
  }, [dangSuaTen])

  if (!profile) return null

  const avatarLoai = profile.avatar_loai_ca || 'ca_vang'
  const mauVien   = getMau(avatarLoai)
  const tongXP    = danhSachCa.reduce((s, c) => s + (c.xp || 0), 0)
  const levelHo   = Math.max(1, Math.floor(tongXP / 100))

  function batDauSua() {
    setTenMoi(profile.username || '')
    setLoiTen('')
    setDangSuaTen(true)
  }

  function huy() {
    setDangSuaTen(false)
    setLoiTen('')
  }

  function validate(ten) {
    if (ten.length < 3)  return 'Tối thiểu 3 ký tự'
    if (ten.length > 20) return 'Tối đa 20 ký tự'
    if (!/^[a-zA-Z0-9_]+$/.test(ten)) return 'Chỉ dùng chữ, số, dấu _'
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
    } catch (err) {
      setLoiTen(err.message || 'Lỗi khi lưu')
    } finally {
      setDangLuu(false)
    }
  }

  async function chonAvatar(loaiCa) {
    try {
      await API.capNhatAvatar(loaiCa)
      setProfile(p => ({ ...p, avatar_loai_ca: loaiCa }))
      setHienPicker(false)
    } catch {}
  }

  function hienToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 4500)
  }

  return (
    <>
      {/* Card */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl transition hover:brightness-110"
        style={{
          background: 'rgba(10,22,40,0.72)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(96,165,250,0.13)',
          minWidth: 200,
        }}
      >
        {/* Avatar */}
        <div
          className="relative shrink-0 cursor-pointer group"
          onClick={() => setHienPicker(true)}
          title="Đổi avatar"
        >
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: 48, height: 48,
              background: `${mauVien}28`,
              border: `2.5px solid ${mauVien}bb`,
            }}
          >
            <FishIcon loaiCa={avatarLoai} fill />
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white/90 text-sm select-none">
            ✎
          </div>
        </div>

        {/* Text info */}
        <div className="min-w-0">

          {/* Username row */}
          {dangSuaTen ? (
            <div>
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  value={tenMoi}
                  onChange={e => { setTenMoi(e.target.value); setLoiTen('') }}
                  onKeyDown={e => {
                    if (e.key === 'Enter')  luuTen()
                    if (e.key === 'Escape') huy()
                  }}
                  maxLength={20}
                  placeholder="username"
                  className="bg-ho-nong border border-ho-anh/40 rounded-lg px-2 py-0.5 text-white text-sm w-28 focus:outline-none focus:border-ho-anh"
                />
                <button
                  onClick={luuTen}
                  disabled={dangLuu}
                  className="text-green-400 hover:text-green-300 text-sm font-bold leading-none disabled:opacity-40"
                >✓</button>
                <button
                  onClick={huy}
                  className="text-red-400/60 hover:text-red-400 text-sm leading-none"
                >✕</button>
              </div>
              {loiTen && (
                <div className="text-red-400 text-[10px] mt-0.5">{loiTen}</div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-base truncate max-w-[120px]">
                {profile.username}
              </span>
              {!profile.da_doi_username && (
                <button
                  onClick={batDauSua}
                  className="text-ho-anh/35 hover:text-ho-anh/80 text-xs transition shrink-0 leading-none"
                  title="Đổi username (1 lần)"
                >✎</button>
              )}
            </div>
          )}

          {/* Stats */}
          {!dangSuaTen && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-ho-anh/50 text-[13px]">🐠 {danhSachCa.length}</span>
              <span className="text-ho-anh/50 text-[13px]">⭐ Lv.{levelHo}</span>
              <span className="text-ho-anh/50 text-[13px]">🪙 {coins.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="absolute top-16 left-4 bg-ho-nong border border-ho-anh/20 rounded-xl px-4 py-2.5 text-white text-xs max-w-[260px] shadow-xl"
          style={{ backdropFilter: 'blur(8px)', zIndex: 100 }}
        >
          {toast}
        </div>
      )}

      {/* Avatar picker */}
      {hienPicker && (
        <div
          className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 px-4"
          onClick={() => setHienPicker(false)}
        >
          <div
            className="bg-ho-sau border border-ho-anh/15 rounded-2xl p-5 w-full max-w-[300px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Chọn avatar</h3>
              <button onClick={() => setHienPicker(false)} className="text-ho-anh/40 hover:text-ho-anh transition">✕</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {LOAI_CA.map(item => (
                <button
                  key={item.loai_ca}
                  onClick={() => chonAvatar(item.loai_ca)}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl transition"
                  style={{
                    border: avatarLoai === item.loai_ca
                      ? `2px solid ${item.mau}`
                      : '2px solid transparent',
                    background: avatarLoai === item.loai_ca
                      ? `${item.mau}18`
                      : 'transparent',
                  }}
                >
                  <FishIcon loaiCa={item.loai_ca} size={44} />
                  <span className="text-ho-anh/55 text-[9px] leading-tight text-center">{item.ten}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
