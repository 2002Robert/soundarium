import { useState, useEffect, useRef } from 'react'

function formatThoiGian(giay) {
  if (!giay || isNaN(giay) || giay < 0) return '0:00'
  const p = Math.floor(giay / 60)
  const g = Math.floor(giay % 60)
  return `${p}:${g.toString().padStart(2, '0')}`
}

export default function MusicPlayerBar({
  caDangPhat,    // object cá đang phát (hoặc null)
  danhSachCa,    // toàn bộ danh sách để prev/next
  dangPhat,      // boolean
  player,        // YT player object từ onReady
  onToggle,      // () => toggle play/pause
  onChuyenCa,    // (ca) => chuyển sang cá khác
}) {
  const [thoiGian, setThoiGian]   = useState(0)
  const [tongGio, setTongGio]     = useState(0)
  const [dangKeo, setDangKeo]     = useState(false)
  const intervalRef               = useRef(null)

  // Poll thời gian từ YouTube player mỗi giây khi đang phát
  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!player || !dangPhat || dangKeo) return

    intervalRef.current = setInterval(() => {
      try {
        setThoiGian(player.getCurrentTime?.() ?? 0)
        setTongGio(player.getDuration?.() ?? 0)
      } catch {
        // Player chưa sẵn sàng — bỏ qua
      }
    }, 500)

    return () => clearInterval(intervalRef.current)
  }, [player, dangPhat, dangKeo])

  // Reset thời gian khi đổi bài
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

  const phanTram = tongGio > 0 ? (thoiGian / tongGio) * 100 : 0
  const tenHienThi = caDangPhat?.nickname || caDangPhat?.ten_bai || '...'

  // Ẩn hoàn toàn khi không có bài phát
  if (!caDangPhat) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ho-sau/90 backdrop-blur-md border-t border-ho-anh/10">
      <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">

        {/* Tên bài + kênh — marquee nếu dài */}
        <div className="w-36 shrink-0 overflow-hidden">
          <div
            className={`text-white text-sm font-medium whitespace-nowrap ${tenHienThi.length > 18 ? 'marquee' : ''}`}
          >
            {tenHienThi}
          </div>
          <div className="text-ho-anh/50 text-xs truncate mt-0.5">
            {caDangPhat.ten_kenh}
          </div>
        </div>

        {/* Điều khiển play/pause/prev/next */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={baiTruoc}
            className="text-ho-anh/50 hover:text-white transition text-base leading-none"
            title="Bài trước"
          >
            ⏮
          </button>

          <button
            onClick={onToggle}
            className="w-8 h-8 bg-ho-anh hover:bg-ho-accent rounded-full flex items-center justify-center text-ho-sau text-sm transition shrink-0"
          >
            {dangPhat ? '⏸' : '▶'}
          </button>

          <button
            onClick={baiTiep}
            className="text-ho-anh/50 hover:text-white transition text-base leading-none"
            title="Bài tiếp"
          >
            ⏭
          </button>
        </div>

        {/* Progress bar + thời gian */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-ho-anh/40 text-xs tabular-nums shrink-0 w-8 text-right">
            {formatThoiGian(thoiGian)}
          </span>

          <input
            type="range"
            min="0" max="100"
            step="0.1"
            value={phanTram}
            onChange={seek}
            onMouseDown={() => setDangKeo(true)}
            onMouseUp={() => { setDangKeo(false) }}
            onTouchStart={() => setDangKeo(true)}
            onTouchEnd={() => { setDangKeo(false) }}
            className="flex-1 h-1 rounded-full cursor-pointer accent-sky-400"
            style={{ accentColor: '#4a9eda' }}
          />

          <span className="text-ho-anh/40 text-xs tabular-nums shrink-0 w-8">
            {formatThoiGian(tongGio)}
          </span>
        </div>

      </div>
    </div>
  )
}
