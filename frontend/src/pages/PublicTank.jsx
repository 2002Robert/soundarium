import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { API } from '../lib/api'
import AquariumCanvas from '../components/AquariumCanvas'
import YouTubePlayer from '../components/YouTubePlayer'
import MusicPlayerBar from '../components/MusicPlayerBar'

export default function PublicTank() {
  const { username } = useParams()
  const [tank, setTank]         = useState(null)
  const [dang404, setDang404]   = useState(false)
  const [dangPhat, setDangPhat] = useState(null)   // ca_id đang phát
  const [videoId, setVideoId]   = useState(null)
  const [ytPlayer, setYtPlayer] = useState(null)

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
    <div className="min-h-screen flex items-center justify-center bg-ho-sau text-ho-anh/60">
      Không tìm thấy hồ này
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
