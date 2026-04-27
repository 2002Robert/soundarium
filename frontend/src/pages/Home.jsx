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
import { tinhLevelTuExp, TIEU_DE_LEVEL } from '../constants/playerLevel'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function IconBtn({ onClick, title, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 flex items-center justify-center bg-ho-nong/70 hover:bg-ho-nong border border-ho-anh/20 hover:border-ho-anh/40 rounded-xl text-ho-anh/70 hover:text-ho-anh transition text-base ${className}`}
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
  const [profileData, setProfileData]         = useState(null)
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
  const [playerBarHeight, setPlayerBarHeight] = useState(0)
  const playerBarRef  = useRef(null)
  const playerExpRef  = useRef(0)
  const feedCoolRef   = useRef({})
  const gioNgheRef    = useRef(0)

  const [playerLevelUp, setPlayerLevelUp] = useState(null)
  const [dangKhoiDong, setDangKhoiDong]       = useState(true)
  const [loiKetNoi, setLoiKetNoi]             = useState(false)
  const [soLanThu, setSoLanThu]               = useState(1)

  const [nenHo, setNenHoState] = useState(() => localStorage.getItem('snd_nen') || 'ocean-shallow')
  const [dayHo, setDayHoState] = useState(() => localStorage.getItem('snd_day') || 'cat_trang')

  // Audio controls
  const [repeatMode, setRepeatMode] = useState(() => localStorage.getItem('snd_repeat') || 'off')
  const [volume, setVolume]         = useState(() => Number(localStorage.getItem('snd_vol') ?? 70))

  function chonNen(id) { setNenHoState(id); localStorage.setItem('snd_nen', id) }
  function chonDay(id) { setDayHoState(id); localStorage.setItem('snd_day', id) }

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
          const lvCu  = tinhLevelTuExp(prev)
          const lvMoi = tinhLevelTuExp(curr)
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
        const tid = tanks[0].id
        setSelectedTankId(tid)
        const fishRes = await API.layDanhSachCa(tid)
        setDanhSachCa(fishRes.danh_sach_ca || [])
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
    try {
      const res = await API.layDanhSachCa(tankId)
      setDanhSachCa(res.danh_sach_ca || [])
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

    if (profileData) {
      const levelHo = tinhLevelTuExp(playerExp)
      const BOX_W = 210, BOX_H = 72, PAD = 14, R = 12

      ctx.save()
      ctx.globalAlpha = 0.88
      ctx.fillStyle = '#0a1628'
      roundRect(ctx, PAD, PAD, BOX_W, BOX_H, R)
      ctx.fill()
      ctx.strokeStyle = 'rgba(96,165,250,0.18)'
      ctx.lineWidth = 1
      roundRect(ctx, PAD, PAD, BOX_W, BOX_H, R)
      ctx.stroke()
      ctx.restore()

      const AVATAR_R = 20
      const ax = PAD + 14 + AVATAR_R
      const ay = PAD + BOX_H / 2
      ctx.save()
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.arc(ax, ay, AVATAR_R, 0, Math.PI * 2)
      ctx.fillStyle = '#1a3a5c'; ctx.fill()
      ctx.strokeStyle = 'rgba(74,158,218,0.5)'; ctx.lineWidth = 2; ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(profileData.username || 'User', PAD + 14 + AVATAR_R * 2 + 10, PAD + 28)
      ctx.restore()

      ctx.save()
      ctx.font = '11px "Segoe UI", system-ui, sans-serif'
      ctx.fillStyle = 'rgba(74,158,218,0.75)'
      ctx.fillText(`🐠 ${danhSachCa.length}   ⭐ Lv.${levelHo}   🪙 ${coins.toLocaleString()}`, PAD + 14 + AVATAR_R * 2 + 10, PAD + 50)
      ctx.restore()
    }

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
        conTrai={conTrai}
        onClickConTrai={nhatNgocConTrai}
        bottomPad={playerBarHeight}
        feedSignal={feedSignal}
        onCaAnThucAn={khiCaAnThucAn}
        coinHarvestSignal={coinHarvestSignal}
      />

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
              setProfileData(p)
              setNgocTrai(p.ngoc_trai || 0)
              setCoins(p.coins || 0)
              const initExp = p.player_exp || 0
              setPlayerExp(initExp)
              playerExpRef.current = initExp
            }}
        />
        <div className="flex flex-col gap-1.5 mt-2">
          <IconBtn onClick={chiaSe} title="Chia sẻ hồ">🔗</IconBtn>
          <IconBtn onClick={chupAnhHo} title="Chụp ảnh hồ">📷</IconBtn>
          <IconBtn onClick={choAn} title="Cho cá ăn">🍖</IconBtn>
          <IconBtn onClick={() => setHienExplore(true)} title="Khám phá">🔍</IconBtn>
          <IconBtn onClick={() => setHienShop(true)} title="Cửa hàng">🛒</IconBtn>
          <TankSwitcher
            danhSachTank={danhSachTank}
            selectedId={selectedTankId}
            onChon={doiTank}
            onTaoMoi={taoTankMoi}
            dangTao={dangTaoTank}
          />
          <IconBtn onClick={() => setHienLogout(true)} title="Đăng xuất" className="text-ho-anh/40">🚪</IconBtn>
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
          playerLevel={tinhLevelTuExp(playerExp)}
          onCoinsUpdate={setCoins}
          conTrai={conTrai}
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
    </div>
  )
}
