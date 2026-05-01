import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { API } from '../lib/api'
import AquariumCanvas from '../components/AquariumCanvas'
import FishInfoPanel from '../components/FishInfoPanel'
import YouTubePlayer from '../components/YouTubePlayer'
import MusicPlayerBar from '../components/MusicPlayerBar'
import Onboarding from '../components/Onboarding'
import Toast from '../components/Toast'
import { useAudio } from '../hooks/useAudio'
import { useCoins } from '../hooks/useCoins'
import ProfileCard from '../components/ProfileCard'
import FishManagerModal from '../components/FishManagerModal'
import ShopPanel from '../components/ShopPanel'
import ExplorePanel from '../components/ExplorePanel'
import TankSwitcher from '../components/TankSwitcher'
import { tinhLevel, TIEU_DE_LEVEL } from '../utils/playerLevel'
import FeedbackPopup from '../components/FeedbackPopup'


function mergeScaleLS(list) {
  return list.map(d => {
    const stored = localStorage.getItem('snd_sc_' + d.id)
    return { ...d, scale: stored ? parseFloat(stored) : (d.scale ?? 1.0) }
  })
}

async function syncScalesLSToDB(list) {
  for (const d of list) {
    const stored = localStorage.getItem('snd_sc_' + d.id)
    if (!stored) continue
    const scale = parseFloat(stored)
    if (Math.abs(scale - (d.scale ?? 1.0)) < 0.01) continue
    try {
      await API.capNhatDecor(d.id, { scale })
      localStorage.removeItem('snd_sc_' + d.id)
    } catch (e) {
      console.error(
        '[scale-sync] Lỗi — cột scale có thể chưa tồn tại trong DB.\n' +
        'Chạy SQL trong Supabase:\n' +
        '  ALTER TABLE decorations ADD COLUMN IF NOT EXISTS scale FLOAT DEFAULT 1.0;\n' +
        '  NOTIFY pgrst, \'reload schema\';\n',
        e?.message
      )
    }
  }
}

const DECOR_ICON = {
  rong_bien: '🌿', san_ho_cay: '🪸', da_cuoi: '🪨',
  kho_bau: '🏺',  vo_oc: '🐚',       hai_quy: '🌺',
  den_long: '🏮',  ruong_go: '📦',    cot_da_co: '🗿',
  cung_dien: '🏛', xac_tau: '⚓',     nam_phat_sang: '🍄',
}

function PlacementOverlay({ icon, playerBarHeight, onPlace, onCancel }) {
  const [pos, setPos] = useState({ x: -999, y: -999 })
  useEffect(() => {
    function onMove(e) {
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      setPos({ x: cx, y: cy })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
    }
  }, [])

  function handleClick(e) {
    const effectiveH = window.innerHeight - playerBarHeight
    onPlace(e.clientX / window.innerWidth, e.clientY / effectiveH)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[130] cursor-crosshair"
        style={{ bottom: playerBarHeight }}
        onClick={handleClick}
        onContextMenu={e => { e.preventDefault(); onCancel() }}
      />
      <div
        className="fixed z-[131] pointer-events-none select-none"
        style={{ left: pos.x - 22, top: pos.y - 48, fontSize: 40, filter: 'drop-shadow(0 0 8px rgba(100,200,255,0.9))' }}
      >
        {icon}
      </div>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[132] bg-ho-sau/90 border border-ho-anh/30 rounded-2xl px-4 py-2 text-sm text-white/80 pointer-events-none text-center">
        Click để đặt · Chuột phải / ESC để huỷ
      </div>
      <button
        className="fixed top-4 right-4 z-[132] bg-ho-sau/90 border border-ho-anh/30 hover:border-red-400/50 text-ho-anh/70 hover:text-red-400 rounded-xl px-3 py-2 text-sm transition"
        onClick={onCancel}
        style={{ top: 16 }}
      >✕ Huỷ</button>
    </>
  )
}

// ── Left-bar icons — stroke="currentColor", 22×22 ────────────────
function IcoShare() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="17" cy="5"  r="2.5"/>
      <circle cx="5"  cy="11" r="2.5"/>
      <circle cx="17" cy="17" r="2.5"/>
      <line x1="7.2" y1="9.7"  x2="14.8" y2="6.3"/>
      <line x1="7.2" y1="12.3" x2="14.8" y2="15.7"/>
    </svg>
  )
}

function IcoCamera() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="18" height="13" rx="2"/>
      <path d="M8 7V5.5Q8 4.5 9 4.5H13Q14 4.5 14 5.5V7"/>
      <circle cx="11" cy="13.5" r="3.5"/>
    </svg>
  )
}

function IcoFood() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="1" width="15" height="16" rx="2.5"/>
      <line x1="3.5" y1="8" x2="18.5" y2="8"/>
      <path d="M7.5 12.5 L6 10.8 L6 14.2 Z" fill="currentColor" stroke="none"/>
      <ellipse cx="11.5" cy="12.5" rx="3.8" ry="2.2"/>
      <circle cx="5.5"  cy="19.5" r="1.3" fill="currentColor" stroke="none"/>
      <circle cx="11"   cy="21"   r="1.1" fill="currentColor" stroke="none" opacity="0.78"/>
      <circle cx="16.5" cy="19.5" r="1.2" fill="currentColor" stroke="none" opacity="0.85"/>
    </svg>
  )
}

function IcoSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="9.5" cy="9.5" r="6.5"/>
      <line x1="14.5" y1="14.5" x2="20" y2="20"/>
    </svg>
  )
}

function IcoShop() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 9Q8 5 11 5Q14 5 14 9"/>
      <path d="M4.5 9H17.5L16 19Q15.8 20 14.8 20H7.2Q6.2 20 6 19Z"/>
    </svg>
  )
}

function IcoHouse() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,10 11,3 19,10"/>
      <path d="M5 10V19Q5 20 6 20H16Q17 20 17 19V10"/>
      <path d="M9 20V15Q9 14 11 14Q13 14 13 15V20"/>
    </svg>
  )
}

function IcoExit() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4H5Q4 4 4 5V17Q4 18 5 18H10"/>
      <line x1="9" y1="11" x2="19" y2="11"/>
      <polyline points="15.5,7.5 19,11 15.5,14.5"/>
    </svg>
  )
}

function IconBtn({ onClick, title, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-11 h-11 flex items-center justify-center bg-ho-nong/70 hover:bg-ho-nong border border-ho-anh/20 hover:border-ho-anh/40 rounded-xl text-white/70 hover:text-white transition ${className}`}
    >
      {children}
    </button>
  )
}

function LogoutConfirm({ onXacNhan, onHuy }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div
        className="bg-ho-sau border border-ho-anh/20 rounded-2xl p-6 w-full max-w-xs"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <h3 className="text-white font-semibold text-base mb-1">Đăng xuất?</h3>
        <p className="text-ho-anh/55 text-sm mb-5">Phiên đăng nhập sẽ kết thúc.</p>
        <div className="flex gap-3">
          <button
            onClick={onXacNhan}
            className="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-semibold py-2 rounded-xl text-sm transition"
          >
            Đăng xuất
          </button>
          <button
            onClick={onHuy}
            className="flex-1 border border-ho-anh/30 text-ho-anh/70 hover:text-ho-anh py-2 rounded-xl text-sm transition"
          >
            Huỷ
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [danhSachCa, setDanhSachCa]           = useState([])
  const [infoCa, setInfoCa]                   = useState(null)
  const [toast, setToast]                     = useState(null)
  const [caLevelUp, setCaLevelUp]             = useState(null)
  const [hienFishManager, setHienFishManager] = useState(false)
  const [hienShop, setHienShop]               = useState(false)
  const [hienExplore, setHienExplore]         = useState(false)
  const [hienOnboarding, setHienOnboarding]   = useState(false)
  const [hienLogout, setHienLogout]           = useState(false)
  const [videoIdDangPhat, setVideoIdDangPhat] = useState(null)
  const [ytPlayer, setYtPlayer]               = useState(null)

  const [ngocTrai, setNgocTrai]               = useState(0)
  const [conTrai, setConTrai]                 = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('snd_con_trai') || 'null')
      if (!Array.isArray(saved) || saved.length === 0) return []
      const now = Date.now()
      // Migration: gộp nhiều con thành 1 con bự ở giữa
      if (saved.length > 1) {
        const anyOpen   = saved.some(ct => ct.isOpen || (!ct.lastOpened || now - ct.lastOpened >= 15 * 60 * 1000))
        const lastOpened = saved.reduce((m, ct) => Math.max(m, ct.lastOpened || 0), 0)
        return [{ id: `ct_${now}_0`, x: 0.5, isOpen: anyOpen, lastOpened, createdAt: now }]
      }
      return saved.map(ct => ({
        ...ct,
        x: 0.5,
        isOpen: ct.isOpen || (!ct.lastOpened || now - ct.lastOpened >= 15 * 60 * 1000),
      }))
    } catch { return [] }
  })
  const [danhSachTank, setDanhSachTank]       = useState([])
  const [selectedTankId, setSelectedTankId]   = useState(null)
  const [dangTaoTank, setDangTaoTank]         = useState(false)
  const [feedSignal, setFeedSignal]           = useState(0)
  const [coinHarvestSignal, setCoinHarvestSignal] = useState(0)
  const [playerExp, setPlayerExp]                 = useState(0)
  const [suaTargets, setSuaTargets]               = useState([])
  const [playerBarHeight, setPlayerBarHeight] = useState(0)
  const playerBarRef  = useRef(null)
  const playerExpRef  = useRef(0)
  const feedCoolRef   = useRef({})
  const gioNgheRef    = useRef(0)

  const [playerLevelUp, setPlayerLevelUp] = useState(null)

  // ── Decorations ─────────────────────────────────────────────────────
  const [danhSachDecor, setDanhSachDecor] = useState([])
  const [dangDatDecor, setDangDatDecor]   = useState(null)   // decorId being placed
  const [menuDecor, setMenuDecor]         = useState(null)   // {decor, x, y}
  const decorMoveRef = useRef({})  // { [id]: { startX, startY, origX, origY, moved } }

  const [dangKhoiDong, setDangKhoiDong]       = useState(true)
  const [loiKetNoi, setLoiKetNoi]             = useState(false)
  const [soLanThu, setSoLanThu]               = useState(1)

  // Session analytics
  const sessionIdRef    = useRef(null)
  const sessionStartRef = useRef(null)
  const authTokenRef    = useRef(null)
  const [hienFeedback, setHienFeedback] = useState(false)

  // ESC cancels placement mode
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') { setDangDatDecor(null); setMenuDecor(null) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Session analytics: bắt đầu session khi load, kết thúc khi rời trang
  useEffect(() => {
    let pingInterval = null
    let feedbackTimeout = null

    async function batDau() {
      try {
        const { data } = await supabase.auth.getSession()
        authTokenRef.current = data?.session?.access_token || null
        const res = await API.batDauSession()
        sessionIdRef.current    = res.session_id
        sessionStartRef.current = Date.now()

        // Ping mỗi 60 giây
        pingInterval = setInterval(() => {
          if (!sessionIdRef.current) return
          const dur = Math.floor((Date.now() - sessionStartRef.current) / 1000)
          API.capNhatSession(sessionIdRef.current, dur).catch(() => {})
        }, 60_000)

        // Hiện feedback popup sau 30 phút
        feedbackTimeout = setTimeout(() => setHienFeedback(true), 30 * 60_000)
      } catch {}
    }

    function ketThuc() {
      if (!sessionIdRef.current) return
      const dur = Math.floor((Date.now() - sessionStartRef.current) / 1000)
      API.ketThucSessionSync(sessionIdRef.current, dur, authTokenRef.current)
    }

    batDau()
    window.addEventListener('beforeunload', ketThuc)
    return () => {
      window.removeEventListener('beforeunload', ketThuc)
      clearInterval(pingInterval)
      clearTimeout(feedbackTimeout)
      if (sessionIdRef.current) {
        const dur = Math.floor((Date.now() - sessionStartRef.current) / 1000)
        API.ketThucSession(sessionIdRef.current, dur).catch(() => {})
      }
    }
  }, [])

  const [nenHo, setNenHoState] = useState(() => localStorage.getItem('snd_nen') || 'ocean-shallow')
  const [dayHo, setDayHoState] = useState(() => localStorage.getItem('snd_day') || 'cat_trang')

  // Audio controls
  const [repeatMode, setRepeatMode] = useState(() => localStorage.getItem('snd_repeat') || 'off')
  const [volume, setVolume]         = useState(() => Number(localStorage.getItem('snd_vol') ?? 70))

  function chonNen(id) {
    setNenHoState(id)
    localStorage.setItem('snd_nen', id)
    setDanhSachTank(prev => prev.map(t => t.id === selectedTankId ? { ...t, nen_ho: id } : t))
    if (selectedTankId) API.capNhatTank({ nen_ho: id }, selectedTankId).catch(() => {})
  }
  function chonDay(id) {
    setDayHoState(id)
    localStorage.setItem('snd_day', id)
    setDanhSachTank(prev => prev.map(t => t.id === selectedTankId ? { ...t, day_ho: id } : t))
    if (selectedTankId) API.capNhatTank({ day_ho: id }, selectedTankId).catch(() => {})
  }

  function doiRepeatMode(mode) { setRepeatMode(mode); localStorage.setItem('snd_repeat', mode) }
  function doiVolume(val) {
    setVolume(val)
    localStorage.setItem('snd_vol', String(val))
    try { ytPlayer?.setVolume?.(val) } catch {}
  }

  // Áp dụng volume khi player ready
  useEffect(() => {
    if (!ytPlayer) return
    try { ytPlayer.setVolume?.(volume) } catch {}
  }, [ytPlayer])

  const khiNgheCapNhat = useCallback((caId, res) => {
    setDanhSachCa(prev => prev.map(c =>
      c.id === caId ? { ...c, level: res.level_moi, xp: res.xp_moi } : c
    ))
    if (res.da_len_level) {
      setCaLevelUp(caId)
      setTimeout(() => setCaLevelUp(null), 2500)
    }
  }, [])

  const { dangPhat, phatCa, dungPhat } = useAudio({ onNgheCapNhat: khiNgheCapNhat })
  const { coins, thuHoach, setCoins }  = useCoins()

  const danhSachSua      = danhSachCa.filter(c => c.loai_ca === 'sua_gai')
  const danhSachCaThuong = danhSachCa.filter(c => c.loai_ca !== 'sua_gai')

  const caDangPhat = danhSachCa.find(c => c.id === dangPhat) ?? null

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/login'); return }

      const currentId  = data.user.id
      const storedId   = localStorage.getItem('snd_user_id')

      if (storedId && storedId !== currentId) {
        // User khác đăng nhập cùng thiết bị → xóa data của user cũ
        ;['snd_con_trai', 'snd_nen', 'snd_day', 'snd_onboarded'].forEach(k =>
          localStorage.removeItem(k)
        )
        Object.keys(localStorage)
          .filter(k => k.startsWith('snd_an_') || k.startsWith('snd_sc_'))
          .forEach(k => localStorage.removeItem(k))
        setConTrai([])
      }

      localStorage.setItem('snd_user_id', currentId)

      if (!localStorage.getItem('snd_onboarded')) setHienOnboarding(true)
      khoiDong()
    })
  }, [navigate])

  // Persist con trai to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('snd_con_trai', JSON.stringify(conTrai))
  }, [conTrai])

  // Coin drip: mỗi 5 phút cá no nhả 1 coin
  useEffect(() => {
    if (danhSachCa.length === 0 || !selectedTankId) return
    const id = setInterval(async () => {
      try {
        const res = await API.thuHoachCaNo(selectedTankId)
        if (res.coins_nhan > 0) {
          setCoins(res.coins_hien_tai)
          setCoinHarvestSignal(s => s + 1)
          hienToast(`+${res.coins_nhan} 🪙 ${res.ca_no} cá no thưởng!`, 'thanhCong')
        }
      } catch {}
    }, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [danhSachCa.length, selectedTankId])

  // Oyster timer: check every 60s if any should open
  useEffect(() => {
    if (conTrai.length === 0) return
    const interval = setInterval(() => {
      const now = Date.now()
      setConTrai(prev => {
        const next = prev.map(ct => {
          if (ct.isOpen) return ct
          if (now - (ct.lastOpened || 0) >= 15 * 60 * 1000) return { ...ct, isOpen: true }
          return ct
        })
        return next.some((ct, i) => ct.isOpen !== prev[i].isOpen) ? next : prev
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [conTrai.length])

  function choAn() {
    if (danhSachCaThuong.length === 0) {
      hienToast('Chưa có cá để cho ăn!', 'info')
      return
    }
    setFeedSignal(s => s + 1)
  }

  async function khiCaAnThucAn(caId) {
    const now = Date.now()
    if (feedCoolRef.current[caId] && now - feedCoolRef.current[caId] < 8000) return
    feedCoolRef.current[caId] = now

    // Optimistic: đánh dấu no ngay để cá ngừng đuổi thức ăn
    const fedAt = new Date().toISOString()
    localStorage.setItem(`snd_an_${caId}`, String(now))
    setDanhSachCa(prev => prev.map(c =>
      c.id === caId ? { ...c, lan_cho_an_cuoi: fedAt } : c
    ))

    try {
      const res = await API.choAnCa(caId, selectedTankId)
      setDanhSachCa(prev => prev.map(c =>
        c.id === caId ? {
          ...c,
          xp: res.ca.xp, level: res.ca.level,
          exp: res.ca.exp, truong_thanh: res.ca.truong_thanh,
          lan_cho_an_cuoi: res.ca.lan_cho_an_cuoi || new Date().toISOString(),
        } : c
      ))
      setCoins(res.coins_hien_tai)

      if (res.da_truong_thanh) {
        const ten = danhSachCa.find(c => c.id === caId)?.nickname ||
                    danhSachCa.find(c => c.id === caId)?.ten_bai || 'Cá'
        hienToast(`🌟 ${ten} đã trưởng thành!`, 'thanhCong')
      }
      if (res.da_len_level) {
        setCaLevelUp(caId)
        setTimeout(() => setCaLevelUp(null), 2000)
      }

      const curr = res.player_exp
      if (curr != null) {
        const prev = playerExpRef.current
        if (curr !== prev) {
          const lvCu  = tinhLevel(prev)
          const lvMoi = tinhLevel(curr)
          if (lvMoi > lvCu) {
            setPlayerLevelUp(lvMoi)
            setTimeout(() => setPlayerLevelUp(null), 4500)
            hienToast(`🎉 Lên Lv.${lvMoi}!`, 'thanhCong')
          }
          setPlayerExp(curr)
        }
        playerExpRef.current = curr
      }
    } catch {
      // silent fail
    }
  }

  async function nhatNgocConTrai(ctId) {
    try {
      const res = await API.nhatNgoc()
      setCoins(res.coins)
      setConTrai(prev => prev.map(ct =>
        ct.id === ctId ? { ...ct, isOpen: false, lastOpened: Date.now() } : ct
      ))
      hienToast(`+${res.coins_nhan} 🪙 Nhặt ngọc trai!`, 'thanhCong')
    } catch (err) {
      hienToast(err.message || 'Lỗi nhặt ngọc', 'loi')
    }
  }

  // Đo chiều cao player bar để canvas né
  useEffect(() => {
    const el = playerBarRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      setPlayerBarHeight(el.offsetHeight)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  async function khoiDong(lan = 1) {
    setSoLanThu(lan)
    setDangKhoiDong(true)
    setLoiKetNoi(false)
    try {
      thuHoach().catch(() => {})
      const tankListRes = await API.layDanhSachTank()
      const tanks = tankListRes.tanks || []
      setDanhSachTank(tanks)
      if (tanks.length > 0) {
        const firstTank = tanks[0]
        const tid = firstTank.id
        setSelectedTankId(tid)
        // Đồng bộ nen/day từ DB (cross-device consistency)
        if (firstTank.nen_ho) { setNenHoState(firstTank.nen_ho); localStorage.setItem('snd_nen', firstTank.nen_ho) }
        if (firstTank.day_ho) { setDayHoState(firstTank.day_ho); localStorage.setItem('snd_day', firstTank.day_ho) }
        const [fishRes, decorRes] = await Promise.all([
          API.layDanhSachCa(tid),
          API.layDecor(tid).catch(() => ({ danh_sach: [] })),
        ])
        setDanhSachCa(fishRes.danh_sach_ca || [])
        const allDecors = decorRes.danh_sach || []
        // Ngọc trai được render qua hệ thống conTrai local, không qua decorations
        const filtered1 = allDecors.filter(d => d.loai !== 'ngoc_trai')
        setDanhSachDecor(mergeScaleLS(filtered1))
        // Truyền list raw (chưa merge LS) để so sánh DB vs localStorage đúng
        syncScalesLSToDB(filtered1)
        const hasNgocTraiInDB = allDecors.some(d => d.loai === 'ngoc_trai')
        if (!hasNgocTraiInDB) {
          const savedCT = JSON.parse(localStorage.getItem('snd_con_trai') || 'null')
          if (Array.isArray(savedCT) && savedCT.length > 0) {
            // User cũ có oyster trong localStorage nhưng chưa có DB record → tạo (giá 0 coins)
            API.muaDecor('ngoc_trai', tid).catch(() => {})
          } else {
            // Không có oyster ở cả DB lẫn localStorage → xóa stale data từ session cũ
            localStorage.removeItem('snd_con_trai')
            setConTrai([])
          }
        } else {
          // Có oyster trong DB → đảm bảo conTrai được init (thiết bị mới không có localStorage)
          setConTrai(prev => {
            if (prev.length > 0) return prev
            const now = Date.now()
            return [{ id: `ct_${now}_0`, x: 0.5, isOpen: false, lastOpened: 0, createdAt: now }]
          })
        }
      }
      setDangKhoiDong(false)
    } catch {
      if (lan < 4) {
        // Auto-retry: lần 1 timeout 15s xong → server Render đã kịp thức → lần 2 thường ok
        setTimeout(() => khoiDong(lan + 1), 1500)
      } else {
        setDangKhoiDong(false)
        setLoiKetNoi(true)
      }
    }
  }


  function hienToast(thongBao, loai = 'info') { setToast({ thongBao, loai }) }

  function phatCaObject(ca) { phatCa(ca.id); setVideoIdDangPhat(ca.video_id) }

  function clickCa(ca, x, y) {
    if (infoCa?.ca.id === ca.id) { setInfoCa(null); return }
    setInfoCa({ ca, x, y })
    if (dangPhat !== ca.id) phatCaObject(ca)
  }

  function togglePhatCaHienTai() {
    if (!caDangPhat) return
    if (dangPhat) dungPhat()
    else phatCa(caDangPhat.id)
  }

  function togglePhatTuPanel(ca) {
    if (dangPhat === ca.id) dungPhat()
    else phatCaObject(ca)
  }

  function chuyenCa(ca) { phatCaObject(ca) }

  function capNhatCa(caMoi) {
    setDanhSachCa(prev => prev.map(c => c.id === caMoi.id ? caMoi : c))
    setInfoCa(prev => prev ? { ...prev, ca: caMoi } : null)
  }

  function xoaCa(caId) {
    setDanhSachCa(prev => prev.filter(c => c.id !== caId))
    if (dangPhat === caId) { dungPhat(); setVideoIdDangPhat(null) }
    setInfoCa(null)
  }

  function themCaVaoHo(ca) {
    setDanhSachCa(prev => [...prev, ca])
    hienToast(`${ca.nickname || ca.ten_bai} đã vào hồ!`, 'thanhCong')
  }

  async function doiTank(tankId) {
    if (tankId === selectedTankId) return
    setSelectedTankId(tankId)
    setInfoCa(null)
    // Đồng bộ nen/day theo hồ được chọn
    const tank = danhSachTank.find(t => t.id === tankId)
    if (tank?.nen_ho) { setNenHoState(tank.nen_ho); localStorage.setItem('snd_nen', tank.nen_ho) }
    if (tank?.day_ho) { setDayHoState(tank.day_ho); localStorage.setItem('snd_day', tank.day_ho) }
    try {
      const [fishRes, decorRes] = await Promise.all([
        API.layDanhSachCa(tankId),
        API.layDecor(tankId).catch(() => ({ danh_sach: [] })),
      ])
      setDanhSachCa(fishRes.danh_sach_ca || [])
      const filtered2 = (decorRes.danh_sach || []).filter(d => d.loai !== 'ngoc_trai')
      setDanhSachDecor(mergeScaleLS(filtered2))
      syncScalesLSToDB(filtered2)
    } catch {
      hienToast('Không tải được hồ', 'loi')
    }
  }

  async function taoTankMoi() {
    setDangTaoTank(true)
    try {
      const res = await API.taoTankMoi()
      setDanhSachTank(prev => [...prev, res.tank])
      doiTank(res.tank.id)
      if (res.coins_tru > 0) setCoins(c => c - res.coins_tru)
      hienToast(`Đã tạo ${res.tank.ten}!`, 'thanhCong')
    } catch (err) {
      hienToast(err.message || 'Tối đa 3 hồ', 'loi')
    } finally {
      setDangTaoTank(false)
    }
  }

  // ── Decoration handlers ─────────────────────────────────────────────
  async function muaDecor(loai) {
    console.log('[muaDecor] gọi với loai=', loai, 'tank=', selectedTankId, 'coins=', coins)
    try {
      const res = await API.muaDecor(loai, selectedTankId)
      setDanhSachDecor(prev => [...prev, res.decor])
      setCoins(res.coins_con_lai)
      hienToast('Đã mua! Mở tab Trang trí → Đặt vào hồ', 'thanhCong')
    } catch (err) {
      hienToast(err.message || 'Không mua được', 'loi')
    }
  }

  function batDauDat(decorId) {
    setDangDatDecor(decorId)
    setMenuDecor(null)
  }

  async function datTaiViTri(xFrac, yFrac) {
    if (!dangDatDecor) return
    const id = dangDatDecor
    setDangDatDecor(null)
    try {
      const res = await API.capNhatDecor(id, { pos_x: xFrac, pos_y: yFrac, an: false })
      setDanhSachDecor(prev => prev.map(d => d.id === id ? (res.decor || { ...d, pos_x: xFrac, pos_y: yFrac, an: false }) : d))
    } catch (err) {
      hienToast(err.message || 'Lỗi đặt trang trí', 'loi')
    }
  }

  async function diChuyenDecor(id, xFrac, yFrac) {
    setDanhSachDecor(prev => prev.map(d => d.id === id ? { ...d, pos_x: xFrac, pos_y: yFrac } : d))
    try {
      await API.capNhatDecor(id, { pos_x: xFrac, pos_y: yFrac })
    } catch {}
  }

  async function doiLayerDecor(id, delta) {
    const d = danhSachDecor.find(x => x.id === id)
    if (!d) return
    const newLayer = Math.max(0, Math.min(10, d.layer + delta))
    setDanhSachDecor(prev => prev.map(x => x.id === id ? { ...x, layer: newLayer } : x))
    setMenuDecor(prev => prev ? { ...prev, decor: { ...prev.decor, layer: newLayer } } : null)
    try { await API.capNhatDecor(id, { layer: newLayer }) } catch {}
  }

  async function doiScaleDecor(id, delta) {
    const d = danhSachDecor.find(x => x.id === id)
    if (!d) return
    const newScale = Math.round(Math.max(0.1, (d.scale ?? 1.0) + delta) * 10) / 10
    setDanhSachDecor(prev => prev.map(x => x.id === id ? { ...x, scale: newScale } : x))
    setMenuDecor(prev => prev ? { ...prev, decor: { ...prev.decor, scale: newScale } } : null)
    // Lưu tạm localStorage để fallback nếu API lỗi
    localStorage.setItem('snd_sc_' + id, String(newScale))
    try {
      await API.capNhatDecor(id, { scale: newScale })
      // API thành công → xóa localStorage, DB là source of truth
      localStorage.removeItem('snd_sc_' + id)
    } catch (e) {
      // Giữ localStorage để syncScalesLSToDB retry lần sau
      console.warn('[decor] scale sync thất bại, sẽ retry lần load sau', e.message)
    }
  }

  async function anDecor(id, an) {
    setDanhSachDecor(prev => prev.map(d => d.id === id ? { ...d, an } : d))
    setMenuDecor(null)
    try { await API.capNhatDecor(id, { an }) } catch {}
  }

  async function xoaDecor(id) {
    setDanhSachDecor(prev => prev.filter(d => d.id !== id))
    setMenuDecor(null)
    try { await API.xoaDecor(id) } catch {}
  }

  function khiKetThucBai() {
    if (repeatMode === 'loop') {
      try { ytPlayer?.seekTo?.(0, true); ytPlayer?.playVideo?.() } catch {}
      return
    }
    if (repeatMode === 'shuffle') {
      const khac = danhSachCa.filter(c => c.id !== dangPhat)
      const next = khac.length > 0 ? khac : danhSachCa
      if (next.length > 0) chuyenCa(next[Math.floor(Math.random() * next.length)])
      return
    }
    // tuần tự ('off')
    const i = danhSachCa.findIndex(c => c.id === dangPhat)
    if (i >= 0 && i < danhSachCa.length - 1) {
      chuyenCa(danhSachCa[i + 1])
    } else {
      dungPhat(); setVideoIdDangPhat(null)
    }
  }

  async function chupAnhHo() {
    const src = document.querySelector('canvas')
    if (!src) return

    const off = document.createElement('canvas')
    off.width  = src.width
    off.height = src.height
    const ctx  = off.getContext('2d')
    ctx.drawImage(src, 0, 0)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillText('soundarium.app', src.width - 115, src.height - 12)

    const link = document.createElement('a')
    link.download = 'soundarium.png'
    link.href = off.toDataURL()
    link.click()
    hienToast('Đã tải ảnh!', 'thanhCong')
  }

  async function chiaSe() {
    // Bật public cho hồ đang chọn nếu chưa public
    const currentTank = danhSachTank.find(t => t.id === selectedTankId)
    if (currentTank && !currentTank.la_cong_khai) {
      try {
        await API.capNhatTank({ la_cong_khai: true }, selectedTankId)
        setDanhSachTank(prev => prev.map(t =>
          t.id === selectedTankId ? { ...t, la_cong_khai: true } : t
        ))
      } catch {}
    }

    const { data } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles').select('username').eq('id', data.user.id).single()
    const username = profile?.username || data?.user?.email?.split('@')[0]
    await navigator.clipboard.writeText(`${window.location.origin}/u/${username}`)
    hienToast('Đã copy link hồ! Hồ đã được công khai 🔗', 'thanhCong')
  }

  async function xacNhanDangXuat() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Loading / lỗi kết nối */}
      {(dangKhoiDong || loiKetNoi) && (
        <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/55" style={{ backdropFilter: 'blur(8px)' }}>
          {dangKhoiDong ? (
            <>
              <div className="text-4xl mb-4 animate-bounce">🐠</div>
              <p className="text-white/70 text-sm">Đang kết nối server…</p>
              <p className="text-white/35 text-xs mt-1">
                {soLanThu === 1
                  ? 'Server đang thức dậy, vài giây nhé'
                  : `Thử lại lần ${soLanThu}/4…`}
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">😵</div>
              <p className="text-white/80 text-sm font-semibold mb-1">Không kết nối được server</p>
              <p className="text-white/40 text-xs mb-4">Server Render free tier có thể đang ngủ</p>
              <button
                onClick={khoiDong}
                className="px-5 py-2 bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold rounded-xl text-sm transition"
              >
                Thử lại
              </button>
            </>
          )}
        </div>
      )}

      {hienOnboarding && (
        <Onboarding onXong={() => {
          localStorage.setItem('snd_onboarded', '1')
          setHienOnboarding(false)
        }} />
      )}

      <AquariumCanvas
        danhSachCa={danhSachCaThuong}
        dangPhat={dangPhat}
        nenHo={nenHo}
        dayHo={dayHo}
        onClickCa={clickCa}
        caLevelUp={caLevelUp}
        suaGai={danhSachSua}
        onSuaPos={setSuaTargets}
        conTrai={conTrai}
        onClickConTrai={nhatNgocConTrai}
        bottomPad={playerBarHeight}
        feedSignal={feedSignal}
        onCaAnThucAn={khiCaAnThucAn}
        coinHarvestSignal={coinHarvestSignal}
        decorations={danhSachDecor}
      />

      {/* Overlay click targets cho sứa — z-[150] vượt qua header z-[100] */}
      {suaTargets.map(pos => pos && (
        <div
          key={pos.obj?.id}
          className="fixed z-[150] cursor-pointer rounded-full"
          style={{
            left:   pos.x - pos.r * 1.8,
            top:    pos.y - pos.r * 1.8,
            width:  pos.r * 3.6,
            height: pos.r * 3.6,
          }}
          onClick={() => pos.obj && clickCa(pos.obj, pos.x, pos.y)}
        />
      ))}

      {/* ── Decoration overlays (drag + click) ── */}
      {danhSachDecor.filter(d => !d.an).map(d => {
        const effectiveH = window.innerHeight - playerBarHeight
        const ox = d.pos_x * window.innerWidth
        const oy = d.pos_y * effectiveH
        const SZ = 60
        return (
          <div
            key={d.id}
            className="fixed z-[115] cursor-move"
            style={{ left: ox - SZ / 2, top: oy - SZ, width: SZ, height: SZ, touchAction: 'none' }}
            onPointerDown={e => {
              e.currentTarget.setPointerCapture(e.pointerId)
              decorMoveRef.current[d.id] = {
                startX: e.clientX, startY: e.clientY,
                origX: d.pos_x, origY: d.pos_y,
                moved: false, el: e.currentTarget,
              }
            }}
            onPointerMove={e => {
              const st = decorMoveRef.current[d.id]
              if (!st) return
              const dx = e.clientX - st.startX
              const dy = e.clientY - st.startY
              if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
                st.moved = true
                if (menuDecor?.decor.id === d.id) setMenuDecor(null)
                st.el.style.left = `${st.origX * window.innerWidth + dx - SZ / 2}px`
                st.el.style.top  = `${st.origY * effectiveH + dy - SZ}px`
              }
            }}
            onPointerUp={e => {
              const st = decorMoveRef.current[d.id]
              if (!st) return
              delete decorMoveRef.current[d.id]
              if (st.moved) {
                const dx = e.clientX - st.startX
                const dy = e.clientY - st.startY
                const nx = Math.max(0.02, Math.min(0.98, st.origX + dx / window.innerWidth))
                const ny = Math.max(0.05, Math.min(0.97, st.origY + dy / effectiveH))
                diChuyenDecor(d.id, nx, ny)
              } else {
                setMenuDecor(m => m?.decor.id === d.id ? null : { decor: d, x: ox, y: oy })
              }
            }}
          />
        )
      })}

      {/* ── Decoration context menu ── */}
      {menuDecor && (
        <div
          className="fixed z-[125] bg-ho-sau/95 border border-ho-anh/20 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            left: Math.min(menuDecor.x - 92, window.innerWidth - 196),
            top:  Math.max(menuDecor.y - 158, 8),
            width: 184,
          }}
        >
          <div className="px-3 pt-2.5 pb-1 text-white/60 text-xs font-semibold border-b border-ho-anh/10">
            {DECOR_ICON[menuDecor.decor.loai]} Tầng {menuDecor.decor.layer}
          </div>
          <div className="py-1">
            {/* Scale controls */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-ho-anh/8">
              <button
                onClick={() => doiScaleDecor(menuDecor.decor.id, -0.5)}
                disabled={(menuDecor.decor.scale ?? 1.0) <= 0.1}
                className="flex-1 py-1 rounded-lg text-xs bg-ho-anh/10 hover:bg-ho-anh/20 text-ho-anh/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >🔍−</button>
              <span className="w-12 text-center text-xs font-mono text-white/70 tabular-nums">
                {(menuDecor.decor.scale ?? 1.0).toFixed(1)}×
              </span>
              <button
                onClick={() => doiScaleDecor(menuDecor.decor.id, 0.5)}
                className="flex-1 py-1 rounded-lg text-xs bg-ho-anh/10 hover:bg-ho-anh/20 text-ho-anh/70 hover:text-white transition"
              >🔍+</button>
            </div>
            <button
              onClick={() => doiLayerDecor(menuDecor.decor.id, 1)}
              className="w-full text-left px-3 py-2 text-sm text-ho-anh/70 hover:text-white hover:bg-ho-anh/10 transition"
            >↑ Lên trên</button>
            <button
              onClick={() => doiLayerDecor(menuDecor.decor.id, -1)}
              className="w-full text-left px-3 py-2 text-sm text-ho-anh/70 hover:text-white hover:bg-ho-anh/10 transition"
            >↓ Xuống dưới</button>
            <button
              onClick={() => anDecor(menuDecor.decor.id, true)}
              className="w-full text-left px-3 py-2 text-sm text-ho-anh/70 hover:text-white hover:bg-ho-anh/10 transition"
            >👁 Ẩn</button>
            <div className="mx-3 border-t border-ho-anh/10 my-1" />
            <button
              onClick={() => xoaDecor(menuDecor.decor.id)}
              className="w-full text-left px-3 py-2 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition"
            >🗑 Xóa</button>
          </div>
        </div>
      )}
      {menuDecor && (
        <div className="fixed inset-0 z-[120]" onClick={() => setMenuDecor(null)} />
      )}

      {/* ── Placement overlay ── */}
      {dangDatDecor && (() => {
        const item = danhSachDecor.find(d => d.id === dangDatDecor)
        return (
          <PlacementOverlay
            icon={DECOR_ICON[item?.loai] || '✨'}
            playerBarHeight={playerBarHeight}
            onPlace={datTaiViTri}
            onCancel={() => setDangDatDecor(null)}
          />
        )
      })()}

      {danhSachCa.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-6xl mb-4 opacity-40">🐠</div>
          <p className="text-white/40 text-center">
            Hồ còn trống<br />
            <span className="text-sm pointer-events-auto text-ho-anh/60">
              Mở <button onClick={() => setHienShop(true)} className="underline hover:text-ho-anh">Cửa hàng</button> để mua cá đầu tiên
            </span>
          </p>
        </div>
      )}

      {/* Header — góc trên trái, ẩn trên mobile khi panel mở */}
      <div className={`absolute top-0 left-0 px-4 pt-4 z-[100] ${(hienShop || hienExplore || hienFishManager) ? 'hidden sm:block' : ''}`}>
        <ProfileCard
          danhSachCa={danhSachCa}
          coins={coins}
          ngocTrai={ngocTrai}
          playerExp={playerExp}
          onProfileLoad={p => {
              setNgocTrai(p.ngoc_trai || 0)
              setCoins(p.coins || 0)
              const initExp = p.player_exp || 0
              setPlayerExp(initExp)
              playerExpRef.current = initExp
            }}
        />
        <div className="flex flex-col gap-1.5 mt-2">
          <IconBtn onClick={chiaSe} title="Chia sẻ hồ"><IcoShare /></IconBtn>
          <IconBtn onClick={chupAnhHo} title="Chụp ảnh hồ"><IcoCamera /></IconBtn>
          <IconBtn onClick={choAn} title="Cho cá ăn"><IcoFood /></IconBtn>
          <IconBtn onClick={() => setHienExplore(true)} title="Khám phá"><IcoSearch /></IconBtn>
          <IconBtn onClick={() => setHienShop(true)} title="Cửa hàng"><IcoShop /></IconBtn>
          <TankSwitcher
            danhSachTank={danhSachTank}
            selectedId={selectedTankId}
            onChon={doiTank}
            onTaoMoi={taoTankMoi}
            dangTao={dangTaoTank}
          />
          <IconBtn onClick={() => setHienLogout(true)} title="Đăng xuất" className="text-white/35 hover:text-red-400"><IcoExit /></IconBtn>
        </div>
      </div>

      <YouTubePlayer
        videoId={videoIdDangPhat}
        dangPhat={!!dangPhat}
        onReady={setYtPlayer}
        onEnded={khiKetThucBai}
      />

      <div ref={playerBarRef} className="fixed bottom-0 left-0 right-0 z-[100]">
        <MusicPlayerBar
          caDangPhat={caDangPhat}
          danhSachCa={danhSachCa}
          dangPhat={!!dangPhat}
          player={ytPlayer}
          onToggle={togglePhatCaHienTai}
          onChuyenCa={chuyenCa}
          repeatMode={repeatMode}
          onRepeatMode={doiRepeatMode}
          volume={volume}
          onVolume={doiVolume}
        />
      </div>

      {infoCa && (
        <FishInfoPanel
          ca={infoCa.ca}
          x={infoCa.x}
          y={infoCa.y}
          dangPhat={dangPhat === infoCa.ca.id}
          onTogglePhat={() => togglePhatTuPanel(infoCa.ca)}
          onCapNhat={capNhatCa}
          onXoa={xoaCa}
          onDong={() => setInfoCa(null)}
          onMoQuanLyCa={() => setHienFishManager(true)}
          playerExp={playerExp}
        />
      )}

      {hienFishManager && (
        <FishManagerModal danhSachCa={danhSachCa} onXoa={xoaCa} onDong={() => setHienFishManager(false)} />
      )}

      {hienShop && (
        <ShopPanel
          onThemCa={ca => { themCaVaoHo(ca); setHienShop(false) }}
          onDong={() => setHienShop(false)}
          nenHo={nenHo} dayHo={dayHo}
          onChonNen={chonNen} onChonDay={chonDay}
          coins={coins}
          playerExp={playerExp}
          onCoinsUpdate={setCoins}
          conTrai={conTrai}
          danhSachDecor={danhSachDecor}
          onMuaDecor={muaDecor}
          onDatDecor={batDauDat}
          onThemConTrai={() => {
            const now = Date.now()
            setConTrai([{
              id:         `ct_${now}_0`,
              x:          0.5,
              isOpen:     true,
              lastOpened: 0,
              createdAt:  now,
            }])
            hienToast('🦪 Con trai ngọc đã xuống đáy hồ!', 'thanhCong')
            setHienShop(false)
          }}
        />
      )}

      {hienExplore && <ExplorePanel onDong={() => setHienExplore(false)} />}

      {hienLogout && (
        <LogoutConfirm onXacNhan={xacNhanDangXuat} onHuy={() => setHienLogout(false)} />
      )}

      {playerLevelUp && (
        <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center">
          <div className="len-cap-player text-center select-none">
            <div className="text-5xl mb-3">🌊</div>
            <div
              className="rounded-2xl px-8 py-5"
              style={{ background: 'rgba(10,22,40,0.85)', border: '1px solid rgba(96,165,250,0.25)', backdropFilter: 'blur(14px)' }}
            >
              <div className="text-ho-anh/60 text-sm mb-1 tracking-wide uppercase">Lên cấp!</div>
              <div className="text-3xl font-bold text-white">Lv.{playerLevelUp}</div>
              <div className="text-ho-anh text-base mt-1">{TIEU_DE_LEVEL[playerLevelUp]}</div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast thongBao={toast.thongBao} loai={toast.loai} onHet={() => setToast(null)} />}

      {hienFeedback && <FeedbackPopup onDong={() => setHienFeedback(false)} />}
    </div>
  )
}
