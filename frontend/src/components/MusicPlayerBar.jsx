import { useState, useEffect, useRef } from 'react'

function formatThoiGian(giay) {
  if (!giay || isNaN(giay) || giay < 0) return '0:00'
  const p = Math.floor(giay / 60)
  const g = Math.floor(giay % 60)
  return `${p}:${g.toString().padStart(2, '0')}`
}

async function fetchTenBai(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.title || null
  } catch {
    return null
  }
}

export default function MusicPlayerBar({
  caDangPhat,
  danhSachCa,
  dangPhat,
  player,
  onToggle,
  onChuyenCa,
}) {
  const [thoiGian, setThoiGian] = useState(0)
  const [tongGio, setTongGio]   = useState(0)
  const [dangKeo, setDangKeo]   = useState(false)
  const [tenBai, setTenBai]     = useState('')
  const intervalRef             = useRef(null)
  const songRef                 = useRef(null)   // inner text span
  const containerRef            = useRef(null)   // overflow:hidden wrapper

  // Cập nhật tên bài — fetch oEmbed nếu thiếu
  useEffect(() => {
    if (!caDangPhat) return
    if (caDangPhat.ten_bai) {
      setTenBai(caDangPhat.ten_bai)
    } else {
      setTenBai('Đang tải...')
      fetchTenBai(caDangPhat.video_id).then(t => {
        if (t) setTenBai(t)
      })
    }
  }, [caDangPhat?.id, caDangPhat?.ten_bai])

  // Marquee — span inline-block để translateX(%) tính theo chiều rộng text
  useEffect(() => {
    const el = songRef.current
    const wrap = containerRef.current
    if (!el || !wrap) return

    // Reset trước khi đo
    el.style.animation = 'none'
    el.style.transform = 'translateX(0)'

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (el.scrollWidth > wrap.clientWidth) {
          el.style.animation = 'marquee-song 15s linear infinite'
        } else {
          el.style.animation = 'none'
        }
      })
    })
    return () => cancelAnimationFrame(id)
  }, [tenBai])

  // Poll thời gian
  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!player || !dangPhat || dangKeo) return
    intervalRef.current = setInterval(() => {
      try {
        setThoiGian(player.getCurrentTime?.() ?? 0)
        setTongGio(player.getDuration?.() ?? 0)
      } catch {}
    }, 500)
    return () => clearInterval(intervalRef.current)
  }, [player, dangPhat, dangKeo])

  // Reset khi đổi bài
  useEffect(() => {
    setThoiGian(0)
    setTongGio(0)
  }, [caDangPhat?.id])

  function seek(e) {
    if (!player || !tongGio) return
    const giay = (parseFloat(e.target.value) / 100) * tongGio
    player.seekTo?.(giay, true)
    setThoiGian(giay)
  }

  function baiTruoc() {
    const i = danhSachCa.findIndex(c => c.id === caDangPhat?.id)
    if (i > 0) onChuyenCa(danhSachCa[i - 1])
  }

  function baiTiep() {
    const i = danhSachCa.findIndex(c => c.id === caDangPhat?.id)
    if (i >= 0 && i < danhSachCa.length - 1) onChuyenCa(danhSachCa[i + 1])
  }

  const phanTram  = tongGio > 0 ? (thoiGian / tongGio) * 100 : 0
  const dongDuoi  = [caDangPhat?.nickname, caDangPhat?.ten_kenh].filter(Boolean).join(' · ')

  if (!caDangPhat) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ho-sau/90 backdrop-blur-md border-t border-ho-anh/10">
      <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">

        {/* Tên bài (dòng 1, marquee) + cá·kênh (dòng 2) */}
        <div ref={containerRef} className="w-44 shrink-0 overflow-hidden">
          <span
            ref={songRef}
            className="text-white text-sm font-semibold whitespace-nowrap inline-block"
          >
            {tenBai}
          </span>
          {dongDuoi && (
            <div className="text-ho-anh/50 text-xs truncate mt-0.5 whitespace-nowrap">
              {dongDuoi}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={baiTruoc} className="text-ho-anh/50 hover:text-white transition text-base leading-none" title="Bài trước">⏮</button>
          <button
            onClick={onToggle}
            className="w-8 h-8 bg-ho-anh hover:bg-ho-accent rounded-full flex items-center justify-center text-ho-sau text-sm transition shrink-0"
          >
            {dangPhat ? '⏸' : '▶'}
          </button>
          <button onClick={baiTiep} className="text-ho-anh/50 hover:text-white transition text-base leading-none" title="Bài tiếp">⏭</button>
        </div>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-ho-anh/40 text-xs tabular-nums shrink-0 w-8 text-right">{formatThoiGian(thoiGian)}</span>
          <input
            type="range" min="0" max="100" step="0.1"
            value={phanTram}
            onChange={seek}
            onMouseDown={() => setDangKeo(true)}
            onMouseUp={() => setDangKeo(false)}
            onTouchStart={() => setDangKeo(true)}
            onTouchEnd={() => setDangKeo(false)}
            className="flex-1 h-1 rounded-full cursor-pointer"
            style={{ accentColor: '#4a9eda' }}
          />
          <span className="text-ho-anh/40 text-xs tabular-nums shrink-0 w-8">{formatThoiGian(tongGio)}</span>
        </div>

      </div>
    </div>
  )
}
