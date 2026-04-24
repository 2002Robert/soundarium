import { useState, useEffect } from 'react'
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

  const [nenHo, setNenHoState] = useState(() => localStorage.getItem('snd_nen') || 'ocean-shallow')
  const [dayHo, setDayHoState] = useState(() => localStorage.getItem('snd_day') || 'cat_trang')

  // Audio controls
  const [loopMode, setLoopMode] = useState(() => localStorage.getItem('snd_loop') || 'off')
  const [shuffle, setShuffle]   = useState(() => localStorage.getItem('snd_shuffle') === '1')
  const [volume, setVolume]     = useState(() => Number(localStorage.getItem('snd_vol') ?? 70))

  function chonNen(id) { setNenHoState(id); localStorage.setItem('snd_nen', id) }
  function chonDay(id) { setDayHoState(id); localStorage.setItem('snd_day', id) }

  function doiLoop(mode) { setLoopMode(mode); localStorage.setItem('snd_loop', mode) }
  function doiShuffle(val) { setShuffle(val); localStorage.setItem('snd_shuffle', val ? '1' : '0') }
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

  const { dangPhat, phatCa, dungPhat } = useAudio()
  const { coins, thuHoach }            = useCoins()

  const caDangPhat = danhSachCa.find(c => c.id === dangPhat) ?? null

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/login'); return }
      if (!localStorage.getItem('snd_onboarded')) setHienOnboarding(true)
      khoiDong()
    })
  }, [navigate])

  async function khoiDong() {
    try {
      const [tankRes] = await Promise.all([API.layTankCuaToi(), thuHoach()])
      setDanhSachCa(tankRes.tank.fish || [])
    } catch {
      hienToast('Không kết nối được server', 'loi')
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

  function khiKetThucBai() {
    if (loopMode === 'one') {
      // Phát lại bài hiện tại
      try { ytPlayer?.seekTo?.(0, true); ytPlayer?.playVideo?.() } catch {}
      return
    }
    const ds = shuffle
      ? [...danhSachCa].sort(() => Math.random() - 0.5)
      : danhSachCa
    const i = ds.findIndex(c => c.id === dangPhat)
    if (i >= 0 && i < ds.length - 1) {
      chuyenCa(ds[i + 1])
    } else if (loopMode === 'all' && ds.length > 0) {
      chuyenCa(ds[0])
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
      const tongXP  = danhSachCa.reduce((s, c) => s + (c.xp || 0), 0)
      const levelHo = Math.max(1, Math.floor(tongXP / 100))
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
    const { data } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles').select('username').eq('id', data.user.id).single()
    const username = profile?.username || data?.user?.email?.split('@')[0]
    await navigator.clipboard.writeText(`${window.location.origin}/u/${username}`)
    hienToast('Đã copy link hồ!', 'thanhCong')
  }

  async function xacNhanDangXuat() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {hienOnboarding && (
        <Onboarding onXong={() => {
          localStorage.setItem('snd_onboarded', '1')
          setHienOnboarding(false)
        }} />
      )}

      <AquariumCanvas
        danhSachCa={danhSachCa}
        dangPhat={dangPhat}
        nenHo={nenHo}
        dayHo={dayHo}
        onClickCa={clickCa}
        caLevelUp={caLevelUp}
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

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
        <ProfileCard danhSachCa={danhSachCa} coins={coins} onProfileLoad={setProfileData} />
        <div className="flex items-center gap-2">
          <IconBtn onClick={chiaSe} title="Chia sẻ hồ">🔗</IconBtn>
          <IconBtn onClick={chupAnhHo} title="Chụp ảnh hồ">📷</IconBtn>
          <IconBtn onClick={() => setHienExplore(true)} title="Khám phá">🧭</IconBtn>
          <IconBtn onClick={() => setHienShop(true)} title="Cửa hàng">🛒</IconBtn>
          <IconBtn onClick={() => setHienLogout(true)} title="Đăng xuất" className="text-ho-anh/40">🚪</IconBtn>
        </div>
      </div>

      <YouTubePlayer
        videoId={videoIdDangPhat}
        dangPhat={!!dangPhat}
        onReady={setYtPlayer}
        onEnded={khiKetThucBai}
      />

      <MusicPlayerBar
        caDangPhat={caDangPhat}
        danhSachCa={danhSachCa}
        dangPhat={!!dangPhat}
        player={ytPlayer}
        onToggle={togglePhatCaHienTai}
        onChuyenCa={chuyenCa}
        loopMode={loopMode}
        onLoopMode={doiLoop}
        shuffle={shuffle}
        onShuffle={doiShuffle}
        volume={volume}
        onVolume={doiVolume}
      />

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
        />
      )}

      {hienExplore && <ExplorePanel onDong={() => setHienExplore(false)} />}

      {hienLogout && (
        <LogoutConfirm onXacNhan={xacNhanDangXuat} onHuy={() => setHienLogout(false)} />
      )}

      {toast && <Toast thongBao={toast.thongBao} loai={toast.loai} onHet={() => setToast(null)} />}
    </div>
  )
}
