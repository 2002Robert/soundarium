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

export default function Home() {
  const navigate = useNavigate()
  const [danhSachCa, setDanhSachCa]         = useState([])
  const [infoCa, setInfoCa]                 = useState(null)  // { ca, x, y }
  const [toast, setToast]                   = useState(null)
  const [caLevelUp, setCaLevelUp]           = useState(null)
  const [hienOnboarding, setHienOnboarding] = useState(false)
  const [videoIdDangPhat, setVideoIdDangPhat] = useState(null)
  const [ytPlayer, setYtPlayer]             = useState(null)

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

  function hienToast(thongBao, loai = 'info') {
    setToast({ thongBao, loai })
  }

  function phatCaObject(ca) {
    phatCa(ca.id)
    setVideoIdDangPhat(ca.video_id)
  }

  // Click cá: lần 1 = phát + hiện panel info, lần 2 (cùng cá) = đóng panel
  function clickCa(ca, x, y) {
    if (infoCa?.ca.id === ca.id) {
      setInfoCa(null)
      return
    }
    setInfoCa({ ca, x, y })
    // Tự động phát khi click vào cá chưa phát
    if (dangPhat !== ca.id) {
      phatCaObject(ca)
    }
  }

  function togglePhatCaHienTai() {
    if (!caDangPhat) return
    if (dangPhat) {
      dungPhat()
    } else {
      phatCa(caDangPhat.id)
    }
  }

  // Toggle từ panel info (cùng cá hoặc khác cá)
  function togglePhatTuPanel(ca) {
    if (dangPhat === ca.id) {
      dungPhat()
    } else {
      phatCaObject(ca)
    }
  }

  function chuyenCa(ca) {
    phatCaObject(ca)
  }

  function capNhatCa(caMoi) {
    setDanhSachCa(prev => prev.map(c => c.id === caMoi.id ? caMoi : c))
    setInfoCa(prev => prev ? { ...prev, ca: caMoi } : null)
  }

  function xoaCa(caId) {
    setDanhSachCa(prev => prev.filter(c => c.id !== caId))
    if (dangPhat === caId) { dungPhat(); setVideoIdDangPhat(null) }
    setInfoCa(null)
  }

  // Được gọi từ Shop sau khi mua cá thành công
  function themCaVaoHo(ca) {
    setDanhSachCa(prev => [...prev, ca])
    hienToast(`${ca.nickname || ca.ten_bai} đã vào hồ!`, 'thanhCong')
  }

  // Expose để Shop gọi (qua localStorage event)
  useEffect(() => {
    function nhanCaMoi(e) {
      if (e.key === 'snd_ca_moi') {
        try {
          const ca = JSON.parse(e.newValue)
          if (ca) themCaVaoHo(ca)
        } catch {}
      }
    }
    window.addEventListener('storage', nhanCaMoi)
    return () => window.removeEventListener('storage', nhanCaMoi)
  }, [])

  async function chupAnhHo() {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.font = '12px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText('soundarium.app', canvas.width - 115, canvas.height - 12)
    const link = document.createElement('a')
    link.download = 'soundarium.png'
    link.href = canvas.toDataURL()
    link.click()
    hienToast('Đã tải ảnh!', 'thanhCong')
  }

  async function chiaSe() {
    const { data } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', data.user.id)
      .single()
    const username = profile?.username || data?.user?.email?.split('@')[0]
    await navigator.clipboard.writeText(`${window.location.origin}/u/${username}`)
    hienToast('Đã copy link hồ!', 'thanhCong')
  }

  async function dangXuat() {
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
        onClickCa={clickCa}
        caLevelUp={caLevelUp}
      />

      {/* Empty state */}
      {danhSachCa.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-6xl mb-4 opacity-40">🐠</div>
          <p className="text-white/40 text-center">
            Hồ còn trống<br />
            <span className="text-sm">Vào <a href="/shop" className="underline pointer-events-auto text-ho-anh/60 hover:text-ho-anh">Shop</a> để mua cá đầu tiên</span>
          </p>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
        <div className="text-ho-anh font-bold">🐟 Soundarium</div>
        <div className="flex items-center gap-3">
          <span className="text-ho-anh font-semibold">🪙 {coins.toLocaleString()}</span>
          <button onClick={chiaSe} className="text-ho-anh/60 hover:text-ho-anh text-xs transition">Chia sẻ</button>
          <button onClick={chupAnhHo} className="text-ho-anh/60 hover:text-ho-anh text-xs transition">📷</button>
          <a href="/explore" className="text-ho-anh/60 hover:text-ho-anh text-xs transition">Khám phá</a>
          <a href="/shop" className="text-ho-anh/60 hover:text-ho-anh text-xs transition">Shop</a>
          <button onClick={dangXuat} className="text-ho-anh/40 hover:text-ho-anh/70 text-xs transition">Đăng xuất</button>
        </div>
      </div>

      {/* YouTube player — luôn mount, ẩn hoàn toàn */}
      <YouTubePlayer
        videoId={videoIdDangPhat}
        dangPhat={!!dangPhat}
        onReady={setYtPlayer}
        onEnded={() => {
          const i = danhSachCa.findIndex(c => c.id === dangPhat)
          if (i >= 0 && i < danhSachCa.length - 1) {
            chuyenCa(danhSachCa[i + 1])
          } else {
            dungPhat()
            setVideoIdDangPhat(null)
          }
        }}
      />

      {/* Music Player Bar */}
      <MusicPlayerBar
        caDangPhat={caDangPhat}
        danhSachCa={danhSachCa}
        dangPhat={!!dangPhat}
        player={ytPlayer}
        onToggle={togglePhatCaHienTai}
        onChuyenCa={chuyenCa}
      />

      {/* Fish Info Panel */}
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
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast thongBao={toast.thongBao} loai={toast.loai} onHet={() => setToast(null)} />
      )}
    </div>
  )
}
