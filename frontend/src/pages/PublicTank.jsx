import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { API } from '../lib/api'
import AquariumCanvas from '../components/AquariumCanvas'
import YouTubePlayer from '../components/YouTubePlayer'

export default function PublicTank() {
  const { username } = useParams()
  const [tank, setTank]           = useState(null)
  const [owner, setOwner]         = useState(null)
  const [dangPhat, setDangPhat]   = useState(null)
  const [videoId, setVideoId]     = useState(null)
  const [dang404, setDang404]     = useState(false)

  useEffect(() => {
    // Dynamic meta tags cho OG share
    document.title = `${username} hồ cá — Soundarium`

    API.xemTankNguoiKhac(username)
      .then(({ tank: t, owner: o }) => {
        setTank(t)
        setOwner(o)
        const mo_ta = `${(t.fish || []).length} con cá đang bơi`
        document.querySelector('meta[property="og:title"]')
          ?.setAttribute('content', `${username} hồ cá`)
        document.querySelector('meta[property="og:description"]')
          ?.setAttribute('content', mo_ta)
      })
      .catch(() => setDang404(true))
  }, [username])

  function clickCa(ca) {
    if (dangPhat === ca.id) {
      setDangPhat(null); setVideoId(null)
    } else {
      setDangPhat(ca.id); setVideoId(ca.video_id)
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
        danhSachCa={tank.fish || []}
        dangPhat={dangPhat}
        onClickCa={clickCa}
      />

      <div className="absolute top-4 left-4 bg-ho-sau/70 backdrop-blur-sm rounded-xl px-4 py-2">
        <div className="text-white font-semibold">🐟 Hồ của {username}</div>
        <div className="text-ho-anh/60 text-xs">
          {(tank.fish || []).length} con cá · Click cá để nghe nhạc
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

      <YouTubePlayer
        videoId={videoId}
        dangPhat={!!dangPhat}
        onEnded={() => { setDangPhat(null); setVideoId(null) }}
      />
    </div>
  )
}
