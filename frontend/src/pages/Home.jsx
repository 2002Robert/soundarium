import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { API } from '../lib/api'
import AquariumCanvas from '../components/AquariumCanvas'
import FishEditMenu from '../components/FishEditMenu'
import YouTubePlayer from '../components/YouTubePlayer'
import Onboarding from '../components/Onboarding'
import Toast from '../components/Toast'
import { useAudio } from '../hooks/useAudio'
import { useCoins } from '../hooks/useCoins'

export default function Home() {
  const navigate  = useNavigate()
  const [user, setUser]               = useState(null)
  const [danhSachCa, setDanhSachCa]   = useState([])
  const [urlInput, setUrlInput]       = useState('')
  const [dangThem, setDangThem]       = useState(false)
  const [menuCa, setMenuCa]           = useState(null)  // { ca, x, y }
  const [toast, setToast]             = useState(null)  // { thongBao, loai }
  const [caLevelUp, setCaLevelUp]     = useState(null)
  const [hienOnboarding, setHienOnboarding] = useState(false)
  const [videoIdDangPhat, setVideoIdDangPhat] = useState(null)

  const { dangPhat, phatCa, dungPhat, dangKyPlayer } = useAudio()
  const { coins, thuHoach, setCoins } = useCoins()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/login'); return }
      setUser(data.user)

      // Hiện onboarding lần đầu
      if (!localStorage.getItem('snd_onboarded')) setHienOnboarding(true)

      khoiDongHo()
    })
  }, [navigate])

  async function khoiDongHo() {
    try {
      const [tankRes, coinsRes] = await Promise.all([
        API.layTankCuaToi(),
        thuHoach(),
      ])
      setDanhSachCa(tankRes.tank.fish || [])
    } catch {
      hienToast('Không kết nối được server', 'loi')
    }
  }

  function hienToast(thongBao, loai = 'info') {
    setToast({ thongBao, loai })
  }

  async function themCaMoi(e) {
    e.preventDefault()
    if (!urlInput.trim()) return
    setDangThem(true)
    try {
      const { ca } = await API.themCa(urlInput.trim())
      setDanhSachCa(prev => [...prev, ca])
      setUrlInput('')
      hienToast('Đã thêm cá mới!', 'thanhCong')
    } catch (err) {
      hienToast(err.message || 'Link không hợp lệ', 'loi')
    } finally {
      setDangThem(false)
    }
  }

  function clickCa(ca) {
    if (dangPhat === ca.id) {
      dungPhat()
      setVideoIdDangPhat(null)
    } else {
      phatCa(ca.id)
      setVideoIdDangPhat(ca.video_id)
    }
  }

  function giuCa(ca, x, y) {
    setMenuCa({ ca, x, y })
  }

  function capNhatCaTrongDanh(caMoi) {
    setDanhSachCa(prev => prev.map(c => c.id === caMoi.id ? caMoi : c))
  }

  function xoaCaKhoiDanh(caId) {
    setDanhSachCa(prev => prev.filter(c => c.id !== caId))
    if (dangPhat === caId) { dungPhat(); setVideoIdDangPhat(null) }
  }

  function handleLevelUp(caId) {
    setCaLevelUp(caId)
    setTimeout(() => setCaLevelUp(null), 2500)
    hienToast('Cá lên level!', 'thanhCong')
  }

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
    const username = data?.user?.email?.split('@')[0]
    const url = `${window.location.origin}/u/${username}`
    await navigator.clipboard.writeText(url)
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
        onGiuCa={giuCa}
        caLevelUp={caLevelUp}
      />

      {/* Empty state */}
      {danhSachCa.length === 0 && !dangThem && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-6xl mb-4 opacity-40">🐠</div>
          <p className="text-white/40 text-center">
            Hồ còn trống<br />
            <span className="text-sm">Paste link YouTube bên dưới để thêm cá</span>
          </p>
          <div className="mt-4 text-white/20 text-2xl animate-bounce">↓</div>
        </div>
      )}

      {/* Loading khi đang thêm cá */}
      {dangThem && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex gap-2">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-ho-anh/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
        <div className="text-ho-anh font-bold">🐟 Soundarium</div>
        <div className="flex items-center gap-3">
          <span className="text-ho-anh font-semibold">🪙 {coins.toLocaleString()}</span>
          <button onClick={chiaSe} className="text-ho-anh/60 hover:text-ho-anh text-xs transition">
            Chia sẻ
          </button>
          <button onClick={chupAnhHo} className="text-ho-anh/60 hover:text-ho-anh text-xs transition">
            📷
          </button>
          <a href="/explore" className="text-ho-anh/60 hover:text-ho-anh text-xs transition">
            Khám phá
          </a>
          <a href="/shop" className="text-ho-anh/60 hover:text-ho-anh text-xs transition">
            Shop
          </a>
          <button onClick={dangXuat} className="text-ho-anh/40 hover:text-ho-anh/70 text-xs transition">
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Form thêm cá */}
      <form
        onSubmit={themCaMoi}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
      >
        <div className="flex gap-2 bg-ho-sau/80 backdrop-blur-sm border border-ho-anh/20 rounded-2xl p-2">
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="Paste link YouTube để thêm cá..."
            className="flex-1 bg-transparent text-white placeholder-ho-anh/40 text-sm px-3 focus:outline-none"
          />
          <button
            type="submit"
            disabled={dangThem || !urlInput}
            className="bg-ho-anh text-ho-sau font-semibold px-4 py-2 rounded-xl text-sm hover:bg-ho-accent transition disabled:opacity-40"
          >
            +
          </button>
        </div>
      </form>

      {/* YouTube player luôn mount — ẩn bằng CSS, không dùng conditional render */}
      <YouTubePlayer
        videoId={videoIdDangPhat}
        dangPhat={!!dangPhat}
        onReady={dangKyPlayer}
        onEnded={() => { dungPhat(); setVideoIdDangPhat(null) }}
      />

      {/* Menu chỉnh sửa cá */}
      {menuCa && (
        <FishEditMenu
          ca={menuCa.ca}
          x={menuCa.x}
          y={menuCa.y}
          onDong={() => setMenuCa(null)}
          onCapNhat={capNhatCaTrongDanh}
          onXoa={xoaCaKhoiDanh}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          thongBao={toast.thongBao}
          loai={toast.loai}
          onHet={() => setToast(null)}
        />
      )}
    </div>
  )
}
