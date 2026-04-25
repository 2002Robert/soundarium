import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { API } from '../lib/api'
import AquariumCanvas from '../components/AquariumCanvas'
import YouTubePlayer from '../components/YouTubePlayer'
import MusicPlayerBar from '../components/MusicPlayerBar'
import PublicFishPanel from '../components/PublicFishPanel'

export default function PublicTank() {
  const { username } = useParams()
  const [tank, setTank]         = useState(null)
  const [dang404, setDang404]   = useState(false)
  const [dangPhat, setDangPhat] = useState(null)   // ca_id đang phát
  const [videoId, setVideoId]   = useState(null)
  const [ytPlayer, setYtPlayer] = useState(null)
  const [infoCa, setInfoCa]     = useState(null)  // { ca, x, y }

  const danhSachCa = tank?.fish || []
  const caDangPhat = danhSachCa.find(c => c.id === dangPhat) ?? null

  useEffect(() => {
    document.title = `${username} hồ cá — Soundarium`
    API.xemTankNguoiKhac(username)
      .then(({ tank: t }) => {
        setTank(t)
        const soCa = (t.fish || []).length
        document.querySelector('meta[property="og:title"]')
          ?.setAttribute('content', `${username} hồ cá`)
        document.querySelector('meta[property="og:description"]')
          ?.setAttribute('content', `${soCa} con cá đang bơi`)
      })
      .catch(() => setDang404(true))
  }, [username])

  function phatCaObject(ca) {
    setDangPhat(ca.id)
    setVideoId(ca.video_id)
  }

  function clickCa(ca) {
    if (dangPhat === ca.id) {
      setDangPhat(null)
      setVideoId(null)
    } else {
      phatCaObject(ca)
    }
  }

  function chuyenCa(ca) {
    phatCaObject(ca)
  }

  function togglePhat() {
    if (dangPhat) {
      setDangPhat(null)
    } else if (caDangPhat) {
      setDangPhat(caDangPhat.id)
    }
  }

  function khiHetBai() {
    const i = danhSachCa.findIndex(c => c.id === dangPhat)
    if (i >= 0 && i < danhSachCa.length - 1) {
      phatCaObject(danhSachCa[i + 1])
    } else {
      setDangPhat(null)
      setVideoId(null)
    }
  }

  if (dang404) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ho-sau px-6 text-center">
      <div className="text-7xl mb-5 opacity-60">🌊</div>
      <h1 className="text-white font-bold text-xl mb-2">Hồ này chưa công khai</h1>
      <p className="text-ho-anh/50 text-sm mb-7 max-w-xs">
        Hồ của <span className="text-ho-anh/80 font-medium">{username}</span> chưa được chia sẻ hoặc không tồn tại.
      </p>
      <a
        href="/"
        className="bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold px-6 py-3 rounded-xl transition text-sm"
      >
        Tạo hồ của bạn →
      </a>
    </div>
  )

  if (!tank) return (
    <div className="min-h-screen flex items-center justify-center bg-ho-sau">
      <div className="w-8 h-8 border-2 border-ho-anh/50 border-t-ho-anh rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AquariumCanvas
        danhSachCa={danhSachCa}
        dangPhat={dangPhat}
        onClickCa={clickCa}
        onGiuCa={(ca, x, y) => setInfoCa({ ca, x, y })}
      />

      {/* Header */}
      <div className="absolute top-4 left-4 bg-ho-sau/70 backdrop-blur-sm rounded-xl px-4 py-2">
        <div className="text-white font-semibold">🐟 Hồ của {username}</div>
        <div className="text-ho-anh/60 text-xs">
          {danhSachCa.length} con cá · Click cá để nghe nhạc
        </div>
      </div>

      <div className="absolute top-4 right-4">
        <a
          href="/"
          className="bg-ho-anh/20 hover:bg-ho-anh/30 text-ho-anh text-sm px-4 py-2 rounded-full transition"
        >
          Tạo hồ của tôi →
        </a>
      </div>

      {/* YouTube player — luôn mount, ẩn hoàn toàn */}
      <YouTubePlayer
        videoId={videoId}
        dangPhat={!!dangPhat}
        onReady={setYtPlayer}
        onEnded={khiHetBai}
      />

      {/* Panel thông tin cá khi giữ chuột */}
      {infoCa && (
        <PublicFishPanel
          ca={infoCa.ca}
          x={infoCa.x}
          y={infoCa.y}
          onDong={() => setInfoCa(null)}
        />
      )}

      {/* Music player bar — chỉ hiện khi đang phát */}
      <MusicPlayerBar
        caDangPhat={caDangPhat}
        danhSachCa={danhSachCa}
        dangPhat={!!dangPhat}
        player={ytPlayer}
        onToggle={togglePhat}
        onChuyenCa={chuyenCa}
      />
    </div>
  )
}
