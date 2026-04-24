import { useState, useEffect } from 'react'
import { API } from '../lib/api'
import AquariumCanvas from '../components/AquariumCanvas'
import YouTubePlayer from '../components/YouTubePlayer'
import Toast from '../components/Toast'

export default function Explore() {
  const [tank, setTank]         = useState(null)
  const [owner, setOwner]       = useState(null)
  const [dangTai, setDangTai]   = useState(true)
  const [dangPhat, setDangPhat] = useState(null)
  const [videoId, setVideoId]   = useState(null)
  const [toast, setToast]       = useState(null)

  async function layHoMoi() {
    setDangTai(true)
    try {
      const { tank: t, profiles: o } = await API.layTankNgauNhien()
      setTank(t)
      setOwner(t.profiles || o)
      setDangPhat(null)
      setVideoId(null)
    } catch {
      setToast({ thongBao: 'Chưa có hồ nào để khám phá', loai: 'loi' })
    } finally {
      setDangTai(false)
    }
  }

  useEffect(() => { layHoMoi() }, [])

  async function batCa(ca) {
    try {
      await API.themCa(ca.youtube_url)
      setToast({ thongBao: `Đã bắt ${ca.nickname || ca.ten_bai}!`, loai: 'thanhCong' })
    } catch (err) {
      setToast({ thongBao: err.message, loai: 'loi' })
    }
  }

  function clickCa(ca) {
    if (dangPhat === ca.id) {
      setDangPhat(null); setVideoId(null)
    } else {
      setDangPhat(ca.id); setVideoId(ca.video_id)
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {tank && (
        <AquariumCanvas
          danhSachCa={tank.fish || []}
          dangPhat={dangPhat}
          onClickCa={clickCa}
        />
      )}

      {dangTai && (
        <div className="absolute inset-0 flex items-center justify-center bg-ho-sau">
          <div className="w-8 h-8 border-2 border-ho-anh/50 border-t-ho-anh rounded-full animate-spin" />
        </div>
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 bg-ho-sau/70 backdrop-blur-sm rounded-xl px-4 py-2">
        <div className="text-white font-semibold">
          🌊 {owner?.username ? `Hồ của ${owner.username}` : 'Hồ lạ'}
        </div>
        <div className="text-ho-anh/60 text-xs">
          Click cá để nghe · Giữ cá để bắt về hồ mình
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <a href="/" className="bg-ho-sau/70 text-ho-anh/70 text-sm px-3 py-2 rounded-xl">
          ← Hồ của tôi
        </a>
        <button
          onClick={layHoMoi}
          className="bg-ho-anh/20 hover:bg-ho-anh/30 text-ho-anh text-sm px-4 py-2 rounded-xl transition"
        >
          Hồ khác
        </button>
      </div>

      {/* Danh sách cá để bắt */}
      {tank && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
          <div className="bg-ho-sau/80 backdrop-blur-sm border border-ho-anh/20 rounded-2xl p-3 space-y-2 max-h-40 overflow-y-auto">
            {(tank.fish || []).map(ca => (
              <div key={ca.id} className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm">{ca.nickname || ca.ten_bai}</span>
                  <span className="text-ho-anh/40 text-xs ml-2">Lv.{ca.level}</span>
                </div>
                <button
                  onClick={() => batCa(ca)}
                  className="text-xs text-ho-anh hover:text-white border border-ho-anh/30 px-3 py-1 rounded-full transition"
                >
                  Bắt cá
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <YouTubePlayer
        videoId={videoId}
        dangPhat={!!dangPhat}
        onEnded={() => { setDangPhat(null); setVideoId(null) }}
      />

      {toast && <Toast thongBao={toast.thongBao} loai={toast.loai} onHet={() => setToast(null)} />}
    </div>
  )
}
