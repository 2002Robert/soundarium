import { useEffect, useRef, useCallback } from 'react'
import { MAU, NEN_HO } from '../constants/colors'
import { LOAI_CA, KICH_THUOC_THEO_LEVEL } from '../constants/fishTypes'

// Trạng thái chuyển động của từng con cá — ngoài React state vì cập nhật mỗi frame
const trangThaiChuyen = new Map()

function khoiTaoChuyen(ca) {
  if (trangThaiChuyen.has(ca.id)) return
  trangThaiChuyen.set(ca.id, {
    x:       ca.vi_tri_x * window.innerWidth,
    y:       ca.vi_tri_y * window.innerHeight,
    huongX:  Math.random() > 0.5 ? 1 : -1,
    huongY:  (Math.random() - 0.5) * 0.3,
    tocDo:   0.3 + Math.random() * 0.4,
    pha:     Math.random() * Math.PI * 2,  // phase cho vẫy đuôi
  })
}

function tinhDoMo(lanNgheCuoi) {
  if (!lanNgheCuoi) return 1
  const soNgay = (Date.now() - new Date(lanNgheCuoi)) / 86400000
  if (soNgay <= 7)  return 1
  if (soNgay >= 30) return 0.2
  return 1 - (soNgay - 7) / 23 * 0.8
}

function veCa(ctx, ca, trang, frame, dangPhat) {
  const kt = KICH_THUOC_THEO_LEVEL[ca.level] || 40
  const doMo = tinhDoMo(ca.lan_nghe_cuoi)
  const loai = LOAI_CA[ca.loai_ca] || LOAI_CA.ca_vang

  // Cập nhật vị trí
  trang.pha += 0.05
  trang.x += trang.huongX * trang.tocDo
  trang.y += Math.sin(trang.pha) * 0.3

  // Nảy lại khi chạm biên
  const w = ctx.canvas.width, h = ctx.canvas.height
  if (trang.x < kt || trang.x > w - kt) trang.huongX *= -1
  if (trang.y < kt * 0.5 || trang.y > h - kt * 0.5) trang.huongY *= -1
  trang.y = Math.max(kt * 0.5, Math.min(h - kt * 0.5, trang.y))

  ctx.save()
  ctx.globalAlpha = doMo
  ctx.translate(trang.x, trang.y)

  // Lật theo hướng bơi
  if (trang.huongX < 0) ctx.scale(-1, 1)

  // Thân cá
  const r = kt / 2
  ctx.beginPath()
  ctx.ellipse(0, 0, r * (loai.tyLeThan || 1.3), r * 0.65, 0, 0, Math.PI * 2)
  ctx.fillStyle = ca.mau_ca
  ctx.fill()

  // Đuôi — dao động theo phase
  const gocDuoi = Math.sin(trang.pha * 2) * 0.3
  ctx.beginPath()
  ctx.moveTo(-r * loai.tyLeThan * 0.8, 0)
  ctx.lineTo(
    -r * loai.tyLeThan * 0.8 - r * loai.tyLeDuoi,
    -r * 0.5 + gocDuoi * r
  )
  ctx.lineTo(
    -r * loai.tyLeThan * 0.8 - r * loai.tyLeDuoi,
     r * 0.5 + gocDuoi * r
  )
  ctx.closePath()
  ctx.fillStyle = ca.mau_ca
  ctx.fill()

  // Mắt cá
  ctx.beginPath()
  ctx.arc(r * 0.5, -r * 0.15, r * 0.12, 0, Math.PI * 2)
  ctx.fillStyle = '#000'
  ctx.fill()

  // Nhạc note khi đang phát
  if (dangPhat) {
    ctx.font = `${r * 0.5}px serif`
    ctx.fillText('♪', r * 0.3, -r * 0.6)
  }

  // Zzz khi ngủ (> 7 ngày)
  const soNgay = (Date.now() - new Date(ca.lan_nghe_cuoi)) / 86400000
  if (soNgay > 7) {
    ctx.font = `${r * 0.4}px serif`
    ctx.fillStyle = 'rgba(200,200,255,0.7)'
    ctx.fillText('z', r * 0.6, -r * 0.7)
    ctx.fillText('z', r * 0.9, -r * 1.0)
  }

  ctx.restore()
}

function veBongBong(ctx, bongBubbles) {
  bongBubbles.forEach((b, i) => {
    b.y -= b.tocDo
    b.x += Math.sin(b.y * 0.05) * 0.3
    b.doMo = Math.max(0, b.doMo - 0.003)

    if (b.y < 0 || b.doMo <= 0) {
      bongBubbles[i] = {
        x:     Math.random() * ctx.canvas.width,
        y:     ctx.canvas.height + 10,
        r:     1 + Math.random() * 3,
        tocDo: 0.2 + Math.random() * 0.5,
        doMo:  0.1 + Math.random() * 0.3,
      }
    }

    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(126,200,227,${b.doMo})`
    ctx.lineWidth = 0.5
    ctx.stroke()
  })
}

export default function AquariumCanvas({
  danhSachCa,
  dangPhat,         // ca_id đang phát
  nenHo = 'ocean-shallow',
  onClickCa,
  onGiuCa,
  caLevelUp = null, // ca_id vừa lên level để hiệu ứng
}) {
  const canvasRef   = useRef(null)
  const frameRef    = useRef(0)
  const bongRef     = useRef(
    Array.from({ length: 30 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     1 + Math.random() * 3,
      tocDo: 0.2 + Math.random() * 0.5,
      doMo:  0.1 + Math.random() * 0.3,
    }))
  )
  const giuRef = useRef(null)

  // Khởi tạo trạng thái chuyển động cho cá mới
  danhSachCa.forEach(khoiTaoChuyen)

  const veFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Resize canvas nếu cửa sổ thay đổi
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    const w = canvas.width, h = canvas.height
    const nen = NEN_HO[nenHo] || NEN_HO['ocean-shallow']

    // Vẽ nền gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, nen.tren)
    grad.addColorStop(1, nen.duoi)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Hiệu ứng ánh sáng lọc qua nước (sine wave)
    const thoiGian = frameRef.current * 0.02
    for (let i = 0; i < 5; i++) {
      const xAnh = (Math.sin(thoiGian + i * 1.2) * 0.5 + 0.5) * w
      const gAnh = ctx.createRadialGradient(xAnh, 0, 0, xAnh, h * 0.5, w * 0.4)
      gAnh.addColorStop(0, 'rgba(126,200,227,0.04)')
      gAnh.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gAnh
      ctx.fillRect(0, 0, w, h)
    }

    veBongBong(ctx, bongRef.current)

    // Vẽ từng con cá
    danhSachCa.forEach(ca => {
      const trang = trangThaiChuyen.get(ca.id)
      if (!trang) return
      veCa(ctx, ca, trang, frameRef.current, dangPhat === ca.id)
    })

    // Hiệu ứng level up — bong bóng xung quanh cá vừa lên level
    if (caLevelUp) {
      const trang = trangThaiChuyen.get(caLevelUp)
      if (trang) {
        for (let i = 0; i < 8; i++) {
          const goc = (i / 8) * Math.PI * 2
          const dx = Math.cos(goc) * 30
          const dy = Math.sin(goc) * 30
          ctx.beginPath()
          ctx.arc(trang.x + dx, trang.y + dy, 4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,220,100,0.7)'
          ctx.fill()
        }
        ctx.font = '14px sans-serif'
        ctx.fillStyle = '#ffd700'
        ctx.fillText('+1 LVL', trang.x - 20, trang.y - 40)
      }
    }

    frameRef.current++
    requestAnimationFrame(veFrame)
  }, [danhSachCa, dangPhat, nenHo, caLevelUp])

  useEffect(() => {
    const id = requestAnimationFrame(veFrame)
    return () => cancelAnimationFrame(id)
  }, [veFrame])

  // Nhận click/giữ trên canvas → tìm cá bị click
  const xuLyClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    for (const ca of danhSachCa) {
      const trang = trangThaiChuyen.get(ca.id)
      if (!trang) continue
      const kt = KICH_THUOC_THEO_LEVEL[ca.level] || 40
      const dx = mx - trang.x, dy = my - trang.y
      if (dx * dx + dy * dy < kt * kt) {
        onClickCa?.(ca, trang.x, trang.y)
        return
      }
    }
  }, [danhSachCa, onClickCa])

  const xuLyMouseDown = useCallback((e) => {
    giuRef.current = setTimeout(() => {
      const rect = canvasRef.current.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      for (const ca of danhSachCa) {
        const trang = trangThaiChuyen.get(ca.id)
        if (!trang) continue
        const kt = KICH_THUOC_THEO_LEVEL[ca.level] || 40
        if ((mx - trang.x) ** 2 + (my - trang.y) ** 2 < kt * kt) {
          onGiuCa?.(ca, mx, my)
          return
        }
      }
    }, 500)
  }, [danhSachCa, onGiuCa])

  const xuLyMouseUp = useCallback(() => {
    clearTimeout(giuRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ cursor: 'pointer' }}
      onClick={xuLyClick}
      onMouseDown={xuLyMouseDown}
      onMouseUp={xuLyMouseUp}
      onTouchStart={(e) => xuLyMouseDown(e.touches[0])}
      onTouchEnd={xuLyMouseUp}
    />
  )
}
