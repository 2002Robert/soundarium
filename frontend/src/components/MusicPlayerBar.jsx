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

// loopMode: 'off' | 'one' | 'all'
const LOOP_ICONS = { off: '🔁', one: '🔂', all: '🔁' }
const LOOP_LABELS = { off: 'Tắt lặp', one: 'Lặp 1 bài', all: 'Lặp tất cả' }

export default function MusicPlayerBar({
  caDangPhat,
  danhSachCa,
  dangPhat,
  player,
  onToggle,
  onChuyenCa,
  loopMode = 'off',
  onLoopMode,
  shuffle = false,
  onShuffle,
  volume = 70,
  onVolume,
}) {
  const [thoiGian, setThoiGian]   = useState(0)
  const [tongGio, setTongGio]     = useState(0)
  const [dangKeo, setDangKeo]     = useState(false)
  const [tenBai, setTenBai]       = useState('')
  const [hienVol, setHienVol]     = useState(false)
  const intervalRef   = useRef(null)
  const songRef       = useRef(null)
  const containerRef  = useRef(null)

  useEffect(() => {
    if (!caDangPhat) return
    if (caDangPhat.ten_bai) {
      setTenBai(caDangPhat.ten_bai)
    } else {
      setTenBai('Đang tải...')
      fetchTenBai(caDangPhat.video_id).then(t => { if (t) setTenBai(t) })
    }
  }, [caDangPhat?.id, caDangPhat?.ten_bai])

  // Marquee
  useEffect(() => {
    const el = songRef.current
    const wrap = containerRef.current
    if (!el || !wrap) return
    el.style.animation = 'none'
    el.style.transform = 'translateX(0)'
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.animation = el.scrollWidth > wrap.clientWidth
          ? 'marquee-song 15s linear infinite'
          : 'none'
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

  useEffect(() => { setThoiGian(0); setTongGio(0) }, [caDangPhat?.id])

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
    if (shuffle) {
      const khac = danhSachCa.filter(c => c.id !== caDangPhat?.id)
      if (khac.length) onChuyenCa(khac[Math.floor(Math.random() * khac.length)])
      return
    }
    const i = danhSachCa.findIndex(c => c.id === caDangPhat?.id)
    if (i >= 0 && i < danhSachCa.length - 1) onChuyenCa(danhSachCa[i + 1])
  }

  function chuyenLoop() {
    const next = { off: 'all', all: 'one', one: 'off' }
    onLoopMode?.(next[loopMode] ?? 'off')
  }

  const phanTram = tongGio > 0 ? (thoiGian / tongGio) * 100 : 0
  const dongDuoi = [caDangPhat?.nickname, caDangPhat?.ten_kenh].filter(Boolean).join(' · ')

  if (!caDangPhat) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ho-sau/90 backdrop-blur-md border-t border-ho-anh/10">
      {/* Volume popover */}
      {hienVol && (
        <div className="absolute bottom-full right-4 mb-2 bg-ho-nong border border-ho-anh/20 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl">
          <span className="text-ho-anh/60 text-xs shrink-0">🔇</span>
          <input
            type="range" min="0" max="100" step="1"
            value={volume}
            onChange={e => onVolume?.(Number(e.target.value))}
            className="w-28 h-1 rounded-full cursor-pointer"
            style={{ accentColor: '#4a9eda' }}
          />
          <span className="text-ho-anh/60 text-xs shrink-0">🔊</span>
          <span className="text-ho-anh/50 text-xs w-7 text-right tabular-nums">{volume}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-3 py-2">
        {/* Progress row */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-ho-anh/40 text-xs tabular-nums w-8 text-right shrink-0">{formatThoiGian(thoiGian)}</span>
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
          <span className="text-ho-anh/40 text-xs tabular-nums w-8 shrink-0">{formatThoiGian(tongGio)}</span>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1">
          {/* Song title */}
          <div ref={containerRef} className="flex-1 min-w-0 overflow-hidden mr-1">
            <span ref={songRef} className="text-white text-sm font-semibold whitespace-nowrap inline-block">
              {tenBai}
            </span>
            {dongDuoi && (
              <div className="text-ho-anh/50 text-xs truncate whitespace-nowrap">{dongDuoi}</div>
            )}
          </div>

          {/* Shuffle */}
          <button
            onClick={() => onShuffle?.(!shuffle)}
            title="Ngẫu nhiên"
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition ${
              shuffle ? 'text-ho-anh bg-ho-anh/15' : 'text-ho-anh/35 hover:text-ho-anh/60'
            }`}
          >🔀</button>

          {/* Prev */}
          <button
            onClick={baiTruoc}
            className="w-8 h-8 flex items-center justify-center text-ho-anh/50 hover:text-white transition text-base"
            title="Bài trước"
          >⏮</button>

          {/* Play/Pause */}
          <button
            onClick={onToggle}
            className="w-9 h-9 bg-ho-anh hover:bg-ho-accent rounded-full flex items-center justify-center text-ho-sau text-sm transition shrink-0 mx-0.5"
          >
            {dangPhat ? '⏸' : '▶'}
          </button>

          {/* Next */}
          <button
            onClick={baiTiep}
            className="w-8 h-8 flex items-center justify-center text-ho-anh/50 hover:text-white transition text-base"
            title="Bài tiếp"
          >⏭</button>

          {/* Loop */}
          <button
            onClick={chuyenLoop}
            title={LOOP_LABELS[loopMode]}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition ${
              loopMode !== 'off' ? 'text-ho-anh bg-ho-anh/15' : 'text-ho-anh/35 hover:text-ho-anh/60'
            }`}
          >
            {LOOP_ICONS[loopMode]}
            {loopMode === 'one' && (
              <span className="text-[9px] font-bold text-ho-anh absolute ml-3 mt-3 leading-none">1</span>
            )}
          </button>

          {/* Volume */}
          <button
            onClick={() => setHienVol(v => !v)}
            title="Âm lượng"
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition ${
              hienVol ? 'text-ho-anh bg-ho-anh/15' : 'text-ho-anh/35 hover:text-ho-anh/60'
            }`}
          >
            {volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
          </button>
        </div>
      </div>
    </div>
  )
}
