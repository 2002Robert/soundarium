import { useEffect, useRef, useCallback } from 'react'
import { NEN_HO, DAY_HO_MAU } from '../constants/colors'
import { KICH_THUOC_THEO_LEVEL } from '../constants/fishTypes'

const trangThaiChuyen = new Map()

function khoiTaoChuyen(ca) {
  if (trangThaiChuyen.has(ca.id)) return
  trangThaiChuyen.set(ca.id, {
    x:      ca.vi_tri_x * window.innerWidth,
    y:      ca.vi_tri_y * window.innerHeight,
    huongX: Math.random() > 0.5 ? 1 : -1,
    huongY: (Math.random() - 0.5) * 0.3,
    tocDo:  0.3 + Math.random() * 0.4,
    pha:    Math.random() * Math.PI * 2,
  })
}

function tinhDoMo(lanNgheCuoi) {
  if (!lanNgheCuoi) return 1
  const soNgay = (Date.now() - new Date(lanNgheCuoi)) / 86400000
  if (soNgay <= 7)  return 1
  if (soNgay >= 30) return 0.2
  return 1 - (soNgay - 7) / 23 * 0.8
}

// ─── Vẽ mắt chung ──────────────────────────────────────────────
function veMat(ctx, r) {
  ctx.beginPath()
  ctx.arc(r * 0.52, -r * 0.15, r * 0.14, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.54, -r * 0.14, r * 0.08, 0, Math.PI * 2)
  ctx.fillStyle = '#111'; ctx.fill()
  ctx.beginPath()
  ctx.arc(r * 0.57, -r * 0.17, r * 0.03, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill()
}

// ─── Ca Vang: tròn mập, đuôi xòe lyre ─────────────────────────
function veCaVang(ctx, r, mau, g) {
  ctx.fillStyle = mau
  // Đuôi lyre
  ctx.beginPath()
  ctx.moveTo(-r * 0.88, 0)
  ctx.lineTo(-r * 1.55, -r * 0.52 + g * r)
  ctx.lineTo(-r * 1.18, 0 + g * r * 0.2)
  ctx.lineTo(-r * 1.55,  r * 0.52 + g * r)
  ctx.closePath(); ctx.fill()
  // Thân mập
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.12, r * 0.82, 0, 0, Math.PI * 2)
  ctx.fill()
  // Vây lưng
  ctx.save(); ctx.globalAlpha *= 0.6
  ctx.beginPath()
  ctx.moveTo(-r * 0.1, -r * 0.82)
  ctx.quadraticCurveTo(r * 0.35, -r * 1.2, r * 0.7, -r * 0.82)
  ctx.quadraticCurveTo(r * 0.2, -r * 0.82, -r * 0.1, -r * 0.82)
  ctx.fill(); ctx.restore()
  veMat(ctx, r)
}

// ─── Ca Neon: thon dài, sọc xanh + đỏ ─────────────────────────
function veCaNeon(ctx, r, mau, g) {
  ctx.fillStyle = mau
  // Đuôi chẻ
  ctx.beginPath()
  ctx.moveTo(-r * 1.45, 0)
  ctx.lineTo(-r * 2.0, -r * 0.38 + g * r * 0.5)
  ctx.lineTo(-r * 1.6, 0 + g * r * 0.2)
  ctx.lineTo(-r * 2.0,  r * 0.38 + g * r * 0.5)
  ctx.closePath(); ctx.fill()
  // Thân thon
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.6, r * 0.42, 0, 0, Math.PI * 2)
  ctx.fill()
  // Sọc xanh neon lưng
  ctx.save()
  ctx.globalAlpha *= 0.85
  ctx.beginPath()
  ctx.ellipse(-r * 0.1, -r * 0.1, r * 1.35, r * 0.17, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,229,255,0.9)'; ctx.fill()
  // Sọc đỏ bụng
  ctx.beginPath()
  ctx.ellipse(r * 0.1,  r * 0.15, r * 1.05, r * 0.14, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(244,67,54,0.85)'; ctx.fill()
  ctx.restore()
  veMat(ctx, r)
}

// ─── Ca Betta: thân vừa, đuôi voan dài xuống ──────────────────
function veCaBetta(ctx, r, mau, g) {
  ctx.fillStyle = mau
  // Đuôi voan xuống dưới
  ctx.save(); ctx.globalAlpha *= 0.62
  ctx.beginPath()
  ctx.moveTo(-r * 0.65, r * 0.35)
  ctx.quadraticCurveTo(-r * 1.1, r * 1.25 + g * r * 0.35, -r * 0.45, r * 1.7 + g * r * 0.25)
  ctx.quadraticCurveTo( r * 0.0,  r * 1.9,                  r * 0.25,  r * 1.55 + g * r * 0.25)
  ctx.quadraticCurveTo( r * 0.45, r * 1.0,                  r * 0.25,  r * 0.5)
  ctx.fill(); ctx.restore()
  // Đuôi sau
  ctx.beginPath()
  ctx.moveTo(-r * 0.88, 0)
  ctx.lineTo(-r * 1.28, -r * 0.28 + g * r)
  ctx.lineTo(-r * 0.95,  r * 0.18 + g * r * 0.3)
  ctx.closePath(); ctx.fill()
  // Thân
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.2, r * 0.65, 0, 0, Math.PI * 2)
  ctx.fill()
  // Vây lưng dài
  ctx.save(); ctx.globalAlpha *= 0.68
  ctx.beginPath()
  ctx.moveTo(-r * 0.28, -r * 0.65)
  ctx.quadraticCurveTo(r * 0.2, -r * 1.22, r * 0.7, -r * 0.65)
  ctx.quadraticCurveTo(r * 0.2, -r * 0.65, -r * 0.28, -r * 0.65)
  ctx.fill(); ctx.restore()
  veMat(ctx, r)
}

// ─── Ca Clownfish (Hề): oval cam, 2 sọc trắng ─────────────────
function veCaClownfish(ctx, r, mau, g) {
  ctx.fillStyle = mau
  // Đuôi
  ctx.beginPath()
  ctx.moveTo(-r * 0.88, 0)
  ctx.lineTo(-r * 1.42, -r * 0.44 + g * r)
  ctx.lineTo(-r * 1.12, 0 + g * r * 0.2)
  ctx.lineTo(-r * 1.42,  r * 0.44 + g * r)
  ctx.closePath(); ctx.fill()
  // Thân oval
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.15, r * 0.86, 0, 0, Math.PI * 2)
  ctx.fill()
  // Sọc trắng
  ctx.save()
  ctx.beginPath()
  ctx.ellipse( r * 0.42, 0, r * 0.14, r * 0.82, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-r * 0.12, 0, r * 0.12, r * 0.78, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.fill()
  // Phủ cam lại giữa sọc
  ctx.globalAlpha *= 0.55
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 0.82, r * 0.7, 0, 0, Math.PI * 2)
  ctx.fillStyle = mau; ctx.fill()
  ctx.restore()
  // Vây lưng
  ctx.save(); ctx.globalAlpha *= 0.7; ctx.fillStyle = mau
  ctx.beginPath()
  ctx.moveTo(-r * 0.2, -r * 0.86)
  ctx.quadraticCurveTo(r * 0.3, -r * 1.22, r * 0.7, -r * 0.86)
  ctx.quadraticCurveTo(r * 0.2, -r * 0.86, -r * 0.2, -r * 0.86)
  ctx.fill(); ctx.restore()
  veMat(ctx, r)
}

// ─── Ca Tang: tròn dẹt, đuôi lưỡi liềm, điểm vàng ─────────────
function veCaTang(ctx, r, mau, g) {
  ctx.fillStyle = mau
  // Đuôi lưỡi liềm
  ctx.beginPath()
  ctx.moveTo(-r * 0.94, 0)
  ctx.quadraticCurveTo(-r * 1.3, -r * 0.65 + g * r, -r * 1.05, -r * 0.55 + g * r)
  ctx.lineTo(-r * 0.94, 0); ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-r * 0.94, 0)
  ctx.quadraticCurveTo(-r * 1.3,  r * 0.65 + g * r, -r * 1.05,  r * 0.55 + g * r)
  ctx.lineTo(-r * 0.94, 0); ctx.fill()
  // Thân tròn
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.05, r * 0.88, 0, 0, Math.PI * 2)
  ctx.fill()
  // Điểm vàng đặc trưng
  ctx.beginPath()
  ctx.ellipse(-r * 0.58, 0, r * 0.27, r * 0.22, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,214,0,0.9)'; ctx.fill()
  // Vây lưng
  ctx.save(); ctx.globalAlpha *= 0.68; ctx.fillStyle = mau
  ctx.beginPath()
  ctx.moveTo(-r * 0.35, -r * 0.88)
  ctx.quadraticCurveTo(r * 0.25, -r * 1.28, r * 0.72, -r * 0.88)
  ctx.quadraticCurveTo(r * 0.1, -r * 0.88, -r * 0.35, -r * 0.88)
  ctx.fill(); ctx.restore()
  veMat(ctx, r)
}

// ─── Ca Koi: thân dài, đốm cam trên nền trắng ─────────────────
function veCaKoi(ctx, r, mau, g) {
  // Đuôi xòe
  ctx.fillStyle = 'rgba(255,205,178,0.85)'
  ctx.beginPath()
  ctx.moveTo(-r * 1.45, 0)
  ctx.lineTo(-r * 2.05, -r * 0.42 + g * r)
  ctx.lineTo(-r * 1.62, 0 + g * r * 0.2)
  ctx.lineTo(-r * 2.05,  r * 0.42 + g * r)
  ctx.closePath(); ctx.fill()
  // Thân trắng dài
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.65, r * 0.52, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#f5f5f5'; ctx.fill()
  // Đốm màu
  ctx.save()
  ctx.globalAlpha *= 0.82
  ctx.fillStyle = mau
  ctx.beginPath()
  ctx.ellipse(r * 0.42, -r * 0.14, r * 0.55, r * 0.38, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-r * 0.3,  r * 0.2, r * 0.38, r * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Vây lưng
  ctx.save(); ctx.globalAlpha *= 0.7; ctx.fillStyle = 'rgba(255,183,77,0.9)'
  ctx.beginPath()
  ctx.moveTo(-r * 0.15, -r * 0.52)
  ctx.quadraticCurveTo(r * 0.5, -r * 0.88, r * 0.95, -r * 0.52)
  ctx.quadraticCurveTo(r * 0.3, -r * 0.52, -r * 0.15, -r * 0.52)
  ctx.fill(); ctx.restore()
  // Râu
  ctx.save(); ctx.strokeStyle = 'rgba(200,200,200,0.7)'; ctx.lineWidth = r * 0.06
  ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(r * 0.9, -r * 0.1); ctx.quadraticCurveTo(r * 1.25, -r * 0.35, r * 1.15, -r * 0.55); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(r * 0.9,  r * 0.1); ctx.quadraticCurveTo(r * 1.3,   r * 0.25,  r * 1.2,  -r * 0.1); ctx.stroke()
  ctx.restore()
  veMat(ctx, r)
}

// ─── Ca Chep: thân to, vảy cung bán nguyệt ────────────────────
function veCaChep(ctx, r, mau, g) {
  ctx.fillStyle = mau
  // Đuôi chẻ đôi
  ctx.beginPath()
  ctx.moveTo(-r * 1.18, 0)
  ctx.lineTo(-r * 1.8, -r * 0.58 + g * r * 0.5)
  ctx.lineTo(-r * 1.38, -r * 0.1); ctx.closePath(); ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-r * 1.18, 0)
  ctx.lineTo(-r * 1.8,  r * 0.58 + g * r * 0.5)
  ctx.lineTo(-r * 1.38,  r * 0.1); ctx.closePath(); ctx.fill()
  // Thân to
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.45, r * 0.9, 0, 0, Math.PI * 2)
  ctx.fill()
  // Vảy — arc bán nguyệt
  ctx.save(); ctx.globalAlpha *= 0.32; ctx.strokeStyle = '#37474F'; ctx.lineWidth = r * 0.08
  for (let xi = -1; xi <= 1; xi++) {
    for (let yi = -1; yi <= 1; yi++) {
      ctx.beginPath()
      ctx.arc(xi * r * 0.55, yi * r * 0.38, r * 0.33, Math.PI, 0)
      ctx.stroke()
    }
  }
  ctx.restore()
  // Vây lưng lớn
  ctx.save(); ctx.globalAlpha *= 0.72; ctx.fillStyle = mau
  ctx.beginPath()
  ctx.moveTo(-r * 0.48, -r * 0.9)
  ctx.quadraticCurveTo(r * 0.1, -r * 1.35, r * 0.72, -r * 0.9)
  ctx.quadraticCurveTo(r * 0.0, -r * 0.9, -r * 0.48, -r * 0.9)
  ctx.fill(); ctx.restore()
  // Râu
  ctx.save(); ctx.strokeStyle = 'rgba(144,164,174,0.8)'; ctx.lineWidth = r * 0.08; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(r * 0.85, -r * 0.1); ctx.quadraticCurveTo(r * 1.2, -r * 0.4, r * 1.1, -r * 0.65); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(r * 0.85,  r * 0.08); ctx.quadraticCurveTo(r * 1.25, r * 0.25, r * 1.15, -r * 0.1); ctx.stroke()
  ctx.restore()
  veMat(ctx, r)
}

// ─── Ca Dia: hình tròn dẹt, sọc dọc ──────────────────────────
function veCaDia(ctx, r, mau, g) {
  ctx.fillStyle = mau
  // Đuôi nhỏ
  ctx.beginPath()
  ctx.moveTo(-r * 0.88, 0)
  ctx.lineTo(-r * 1.22, -r * 0.24 + g * r * 0.3)
  ctx.lineTo(-r * 1.0,  0 + g * r * 0.1)
  ctx.lineTo(-r * 1.22,  r * 0.24 + g * r * 0.3)
  ctx.closePath(); ctx.fill()
  // Thân tròn
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 0.9, r * 0.9, 0, 0, Math.PI * 2)
  ctx.fill()
  // Sọc dọc
  ctx.save(); ctx.globalAlpha *= 0.38
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath()
    ctx.ellipse(i * r * 0.27, 0, r * 0.07, r * 0.86, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#004D40'; ctx.fill()
  }
  ctx.restore()
  // Vây lưng
  ctx.save(); ctx.globalAlpha *= 0.7; ctx.fillStyle = mau
  ctx.beginPath()
  ctx.moveTo(-r * 0.18, -r * 0.9)
  ctx.quadraticCurveTo(r * 0.12, -r * 1.18, r * 0.42, -r * 0.9)
  ctx.quadraticCurveTo(r * 0.1, -r * 0.9, -r * 0.18, -r * 0.9)
  ctx.fill(); ctx.restore()
  // Vây bụng
  ctx.save(); ctx.globalAlpha *= 0.65; ctx.fillStyle = mau
  ctx.beginPath()
  ctx.moveTo(-r * 0.18, r * 0.9)
  ctx.quadraticCurveTo(r * 0.12, r * 1.18, r * 0.42, r * 0.9)
  ctx.quadraticCurveTo(r * 0.1, r * 0.9, -r * 0.18, r * 0.9)
  ctx.fill(); ctx.restore()
  veMat(ctx, r)
}

// ─── Dispatch theo loài ───────────────────────────────────────
function veCaTheoLoai(ctx, loaiCa, r, mau, g) {
  switch (loaiCa) {
    case 'ca_neon':      return veCaNeon(ctx, r, mau, g)
    case 'ca_betta':     return veCaBetta(ctx, r, mau, g)
    case 'ca_clownfish': return veCaClownfish(ctx, r, mau, g)
    case 'ca_tang':      return veCaTang(ctx, r, mau, g)
    case 'ca_koi':       return veCaKoi(ctx, r, mau, g)
    case 'ca_chep':      return veCaChep(ctx, r, mau, g)
    case 'ca_dia':       return veCaDia(ctx, r, mau, g)
    default:             return veCaVang(ctx, r, mau, g)   // ca_vang
  }
}

const HUNGER_MS = 45 * 60 * 1000

// ─── Frame chính ─────────────────────────────────────────────
// foodTarget = { ref: pelletObj, x, y, eatCb } | null
function veCa(ctx, ca, trang, dangPhat, hHieuQua, foodTarget) {
  const kt       = KICH_THUOC_THEO_LEVEL[ca.level] || 40
  const sizeMult = (ca.truong_thanh == null || ca.truong_thanh === true) ? 1.3 : 0.8
  const doMo     = tinhDoMo(ca.lan_nghe_cuoi)
  const r        = (kt * sizeMult) / 2

  trang.pha += 0.05

  if (foodTarget && !foodTarget.ref.eaten) {
    const dx   = foodTarget.x - trang.x
    const dy   = foodTarget.y - trang.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    trang.huongX = dx >= 0 ? 1 : -1
    trang.x += (dx / dist) * trang.tocDo * 2.8
    trang.y += (dy / dist) * trang.tocDo * 1.8
    if (dist < r * 1.6 && !foodTarget.ref.eaten) {
      foodTarget.ref.eaten = true
      foodTarget.eatCb?.(ca.id)
    }
  } else {
    trang.x += trang.huongX * trang.tocDo
    trang.y += Math.sin(trang.pha) * 0.3
  }

  const w = ctx.canvas.width
  const h = hHieuQua ?? ctx.canvas.height    // dùng vùng hiệu quả nếu có
  if (trang.x < kt || trang.x > w - kt) trang.huongX *= -1
  trang.y = Math.max(kt * 0.5, Math.min(h - 60, trang.y))

  const gocDuoi = Math.sin(trang.pha * 2) * 0.28

  ctx.save()
  ctx.globalAlpha = doMo
  ctx.translate(trang.x, trang.y)
  if (trang.huongX < 0) ctx.scale(-1, 1)

  veCaTheoLoai(ctx, ca.loai_ca, r, ca.mau_ca || '#FFB300', gocDuoi)

  // Note nhạc
  if (dangPhat) {
    ctx.font = `${r * 0.52}px serif`
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.fillText('♪', r * 0.3, -r * 0.75)
  }

  // Zzz khi ngủ > 7 ngày
  if (ca.lan_nghe_cuoi) {
    const soNgay = (Date.now() - new Date(ca.lan_nghe_cuoi)) / 86400000
    if (soNgay > 7) {
      ctx.font = `${r * 0.38}px serif`
      ctx.fillStyle = 'rgba(200,200,255,0.7)'
      ctx.fillText('z', r * 0.6, -r * 0.85)
      ctx.fillText('z', r * 0.9, -r * 1.12)
    }
  }

  ctx.restore()
}

// ─── Vẽ sứa hồng tím ────────────────────────────────────────────
function veSua(ctx, x, y, r, pha, t) {
  const pulse = 1 + Math.sin(t * 2.5 + pha) * 0.12
  const rp = r * pulse
  ctx.save()

  // Vùng sáng buff (dashed circle 150px)
  ctx.globalAlpha = 0.06
  ctx.beginPath()
  ctx.arc(x, y, 150, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,150,240,1)'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 10])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1

  // Glow ngoài
  const glow = ctx.createRadialGradient(x, y, rp * 0.2, x, y, rp * 2.4)
  glow.addColorStop(0, 'rgba(220,100,255,0.28)')
  glow.addColorStop(1, 'rgba(255,100,200,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, rp * 2.4, 0, Math.PI * 2)
  ctx.fill()

  // Thân chuông: hồng tím gradient
  const bell = ctx.createRadialGradient(x, y - rp * 0.2, rp * 0.08, x, y, rp)
  bell.addColorStop(0,    'rgba(255,160,240,0.97)')
  bell.addColorStop(0.35, 'rgba(210, 80,255,0.88)')
  bell.addColorStop(0.72, 'rgba(180,100,255,0.80)')
  bell.addColorStop(1,    'rgba(255,100,200,0.28)')
  ctx.fillStyle = bell
  ctx.beginPath()
  ctx.arc(x, y, rp, Math.PI, 0)
  ctx.bezierCurveTo(x + rp, y, x + rp * 0.7, y + rp * 0.65, x, y + rp * 0.35)
  ctx.bezierCurveTo(x - rp * 0.7, y + rp * 0.65, x - rp, y, x - rp, y)
  ctx.fill()

  // Highlight trong thân
  ctx.globalAlpha = 0.42
  const shine = ctx.createRadialGradient(x - rp * 0.25, y - rp * 0.3, 0, x - rp * 0.2, y - rp * 0.2, rp * 0.55)
  shine.addColorStop(0, 'rgba(255,255,255,0.96)')
  shine.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shine
  ctx.beginPath()
  ctx.ellipse(x - rp * 0.14, y - rp * 0.24, rp * 0.38, rp * 0.22, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Viền rim phát sáng
  ctx.strokeStyle = 'rgba(255,180,245,0.72)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(x, y, rp, Math.PI, 0)
  ctx.stroke()

  // Mặt cute chibi
  const ey = y - rp * 0.12   // vị trí y của mắt
  const ex = rp * 0.27        // khoảng cách x từ tâm
  const er = rp * 0.12        // bán kính mắt

  // Má hồng (vẽ trước mắt để nằm dưới)
  ctx.globalAlpha = 0.38
  ctx.fillStyle = 'rgba(255,140,170,1)'
  ctx.beginPath()
  ctx.ellipse(x - rp * 0.38, ey + rp * 0.14, rp * 0.18, rp * 0.10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + rp * 0.38, ey + rp * 0.14, rp * 0.18, rp * 0.10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Mắt trái
  ctx.fillStyle = '#1a0820'
  ctx.beginPath()
  ctx.arc(x - ex, ey, er, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  ctx.arc(x - ex + er * 0.32, ey - er * 0.35, er * 0.32, 0, Math.PI * 2)
  ctx.fill()

  // Mắt phải
  ctx.fillStyle = '#1a0820'
  ctx.beginPath()
  ctx.arc(x + ex, ey, er, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  ctx.arc(x + ex + er * 0.32, ey - er * 0.35, er * 0.32, 0, Math.PI * 2)
  ctx.fill()

  // Miệng cười chữ U nhỏ
  ctx.strokeStyle = 'rgba(160,40,140,0.75)'
  ctx.lineWidth = rp * 0.09
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, ey + rp * 0.06, rp * 0.16, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()

  // Xúc tu bezier tím hồng
  ctx.lineWidth = 1.5
  for (let i = 0; i < 7; i++) {
    const tx    = x + (i - 3) * rp * 0.29
    const swing = Math.sin(t * 1.4 + pha + i * 0.75) * 9
    ctx.globalAlpha = 0.52
    ctx.beginPath()
    ctx.moveTo(tx, y + rp * 0.3)
    ctx.bezierCurveTo(
      tx + swing,        y + rp,
      tx - swing * 0.5,  y + rp * 1.75,
      tx + swing * 0.3,  y + rp * 2.5,
    )
    ctx.strokeStyle = i % 2 === 0
      ? 'rgba(210,80,255,0.78)'
      : 'rgba(255,100,210,0.78)'
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

// ─── Vẽ con trai (oyster) ────────────────────────────────────────
function veConTrai(ctx, x, y, r, isOpen) {
  ctx.save()
  ctx.translate(x, y)

  if (isOpen) {
    // Pearl glow aura
    const pearlGlow = ctx.createRadialGradient(0, r * 0.1, 0, 0, r * 0.1, r * 1.4)
    pearlGlow.addColorStop(0, 'rgba(200,230,255,0.55)')
    pearlGlow.addColorStop(1, 'rgba(200,230,255,0)')
    ctx.fillStyle = pearlGlow
    ctx.beginPath()
    ctx.ellipse(0, r * 0.1, r * 1.4, r, 0, 0, Math.PI * 2)
    ctx.fill()

    // Top shell (open — rotated back)
    ctx.save()
    ctx.rotate(-0.6)
    ctx.fillStyle = '#9ca3af'
    ctx.beginPath()
    ctx.arc(0, 0, r, Math.PI, 0)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 0.8
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(i * r * 0.4, 0)
      ctx.lineTo(i * r * 0.55, -r * 0.88)
      ctx.stroke()
    }
    ctx.restore()

    // Bottom shell (fixed)
    ctx.fillStyle = '#7a8a92'
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 0.8
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(i * r * 0.35, 0)
      ctx.lineTo(i * r * 0.5, r * 0.85)
      ctx.stroke()
    }

    // Pearl
    const pg = ctx.createRadialGradient(-r * 0.15, -r * 0.15, 0, 0, 0, r * 0.42)
    pg.addColorStop(0, '#ffffff')
    pg.addColorStop(0.4, '#dde8ff')
    pg.addColorStop(1, '#9bb5d8')
    ctx.fillStyle = pg
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2)
    ctx.fill()

    // Pearl shine
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.beginPath()
    ctx.ellipse(-r * 0.13, -r * 0.14, r * 0.13, r * 0.08, -0.5, 0, Math.PI * 2)
    ctx.fill()

    // Dashed "click me" ring
    ctx.strokeStyle = 'rgba(200,230,255,0.55)'
    ctx.lineWidth = 1.2
    ctx.setLineDash([3, 5])
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

  } else {
    // Closed shell
    ctx.fillStyle = '#6b7280'
    ctx.beginPath()
    ctx.ellipse(0, 0, r, r * 0.42, 0, 0, Math.PI * 2)
    ctx.fill()

    // Seam
    ctx.strokeStyle = 'rgba(180,190,200,0.45)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.ellipse(0, 0, r, r * 0.06, 0, 0, Math.PI * 2)
    ctx.stroke()

    // Texture lines
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 0.7
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(i * r * 0.38, -r * 0.38)
      ctx.lineTo(i * r * 0.52, r * 0.38)
      ctx.stroke()
    }

    // Faint inner glow hinting at pearl
    ctx.globalAlpha = 0.18
    const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.55)
    innerGlow.addColorStop(0, 'rgba(200,230,255,1)')
    innerGlow.addColorStop(1, 'rgba(200,230,255,0)')
    ctx.fillStyle = innerGlow
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 0.72, r * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
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
        x: Math.random() * ctx.canvas.width,
        y: ctx.canvas.height + 10,
        r: 1 + Math.random() * 3,
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
  dangPhat,
  nenHo          = 'ocean-shallow',
  dayHo          = 'cat_trang',
  onClickCa,
  onGiuCa,
  caLevelUp      = null,
  suaGai         = [],
  conTrai        = [],
  onClickConTrai,
  bottomPad      = 0,
  feedSignal     = 0,
  onCaAnThucAn,
}) {
  const canvasRef      = useRef(null)
  const frameRef       = useRef(0)
  const bongRef        = useRef(
    Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1 + Math.random() * 3,
      tocDo: 0.2 + Math.random() * 0.5,
      doMo:  0.1 + Math.random() * 0.3,
    }))
  )
  const giuRef         = useRef(null)
  const longPressedRef = useRef(false)
  const suaGaiRef      = useRef(suaGai)
  suaGaiRef.current    = suaGai
  const suaPosRef      = useRef({})
  const conTraiRef     = useRef(conTrai)
  conTraiRef.current   = conTrai
  const conTraiPosRef  = useRef({})
  const bottomPadRef   = useRef(bottomPad)
  bottomPadRef.current = bottomPad
  const thucAnRef      = useRef([])
  const feedSignalRef  = useRef(feedSignal)
  const onCaAnRef      = useRef(onCaAnThucAn)
  onCaAnRef.current    = onCaAnThucAn

  danhSachCa.forEach(khoiTaoChuyen)

  const veFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const effectiveH = window.innerHeight - bottomPadRef.current
    if (canvas.width !== window.innerWidth || canvas.height !== effectiveH) {
      canvas.width  = window.innerWidth
      canvas.height = effectiveH
    }

    const w = canvas.width, h = canvas.height
    const nen = NEN_HO[nenHo] || NEN_HO['ocean-shallow']

    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, nen.tren)
    grad.addColorStop(1, nen.duoi)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    const thoiGian = frameRef.current * 0.02
    for (let i = 0; i < 5; i++) {
      const xAnh = (Math.sin(thoiGian + i * 1.2) * 0.5 + 0.5) * w
      const gAnh = ctx.createRadialGradient(xAnh, 0, 0, xAnh, h * 0.5, w * 0.4)
      gAnh.addColorStop(0, 'rgba(126,200,227,0.04)')
      gAnh.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = gAnh
      ctx.fillRect(0, 0, w, h)
    }

    const dayMau = DAY_HO_MAU[dayHo] || '#c8b89a'
    const dayH = 40
    const dayY = h - dayH
    const dayGrad = ctx.createLinearGradient(0, dayY, 0, h)
    dayGrad.addColorStop(0, dayMau + '00')
    dayGrad.addColorStop(0.35, dayMau + 'bb')
    dayGrad.addColorStop(1, dayMau + 'ff')
    ctx.fillStyle = dayGrad
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 18) {
      ctx.lineTo(x, dayY + Math.sin(x * 0.04 + thoiGian * 0.4) * 5)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()

    veBongBong(ctx, bongRef.current)

    const thucAnActive = thucAnRef.current.filter(f => !f.eaten)
    const eatCb = onCaAnRef.current

    danhSachCa.forEach(ca => {
      const trang = trangThaiChuyen.get(ca.id)
      if (!trang) return

      // Food-chasing AI for hungry fish
      let foodTarget = null
      if (thucAnActive.length > 0) {
        const isHungry = !ca.lan_cho_an_cuoi ||
          Date.now() - new Date(ca.lan_cho_an_cuoi) > HUNGER_MS
        if (isHungry) {
          let nearF = null, nearD2 = Infinity
          thucAnActive.forEach(f => {
            if (f.eaten) return
            const d2 = (f.x - trang.x) ** 2 + (f.y - trang.y) ** 2
            if (d2 < nearD2) { nearD2 = d2; nearF = f }
          })
          if (nearF && !nearF.eaten) foodTarget = { ref: nearF, x: nearF.x, y: nearF.y, eatCb }
        }
      }

      veCa(ctx, ca, trang, dangPhat === ca.id, h, foodTarget)

      const ten = ca.nickname || ca.ten_bai || ''
      if (ten) {
        const kt  = KICH_THUOC_THEO_LEVEL[ca.level] || 40
        const txt = ten.length > 18 ? ten.slice(0, 16) + '…' : ten
        ctx.save()
        ctx.globalAlpha = 0.72
        ctx.font = `${Math.max(10, Math.round(kt * 0.30))}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillText(txt, trang.x + 1, trang.y + kt * 0.65 + 1)
        ctx.fillStyle = '#e0f0ff'
        ctx.fillText(txt, trang.x, trang.y + kt * 0.65)
        ctx.restore()
      }
    })

    // Vẽ sứa gai (DB objects — có nhạc, có thể click)
    const suaList = suaGaiRef.current
    if (suaList.length > 0) {
      const t = frameRef.current * 0.02
      suaList.forEach(sua => {
        // Pha xác định từ id (ổn định qua các frame)
        const pha = sua.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 0.037 % (Math.PI * 2)
        const rx  = sua.vi_tri_x * w
        const ry  = Math.min(sua.vi_tri_y, 0.52) * h + Math.sin(t * 0.7 + pha) * 12
        const sr  = Math.min(w, h) * 0.038
        veSua(ctx, rx, ry, sr, pha, t)
        suaPosRef.current[sua.id] = { x: rx, y: ry, r: sr, obj: sua }
      })
    }

    // Vẽ con trai đáy hồ
    const ctList = conTraiRef.current
    if (ctList.length > 0) {
      const oysterR = Math.min(w * 0.048, 28)
      const oysterY = h - 40 - oysterR * 0.5
      ctList.forEach(ct => {
        const ox = ct.x * w
        veConTrai(ctx, ox, oysterY, oysterR, ct.isOpen)
        conTraiPosRef.current[ct.id] = { x: ox, y: oysterY, r: oysterR }
      })
    }

    // Cập nhật và vẽ thức ăn rơi
    thucAnRef.current.forEach(f => {
      if (f.eaten) return
      f.y  += f.vy
      f.vy  = Math.min(f.vy + 0.06, 3.5)
      f.x  += Math.sin(f.y * 0.04) * 0.45
      if (f.y > h + 20) { f.eaten = true; return }
      ctx.save()
      ctx.beginPath()
      ctx.arc(f.x, f.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#f59e0b'
      ctx.fill()
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(f.x - 1.2, f.y - 1.2, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.restore()
    })
    if (thucAnRef.current.some(f => f.eaten)) {
      thucAnRef.current = thucAnRef.current.filter(f => !f.eaten)
    }

    if (caLevelUp) {
      const trang = trangThaiChuyen.get(caLevelUp)
      if (trang) {
        for (let i = 0; i < 8; i++) {
          const goc = (i / 8) * Math.PI * 2
          ctx.beginPath()
          ctx.arc(trang.x + Math.cos(goc) * 30, trang.y + Math.sin(goc) * 30, 4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,220,100,0.7)'; ctx.fill()
        }
        ctx.font = '14px sans-serif'
        ctx.fillStyle = '#ffd700'
        ctx.fillText('+1 LVL', trang.x - 20, trang.y - 40)
      }
    }

    frameRef.current++
    requestAnimationFrame(veFrame)
  }, [danhSachCa, dangPhat, nenHo, dayHo, caLevelUp])

  useEffect(() => {
    const id = requestAnimationFrame(veFrame)
    return () => cancelAnimationFrame(id)
  }, [veFrame])

  // Spawn thức ăn khi feedSignal tăng
  useEffect(() => {
    if (feedSignal === feedSignalRef.current) return
    feedSignalRef.current = feedSignal
    const count = 3 + Math.floor(Math.random() * 3)
    const w = window.innerWidth
    const newPellets = Array.from({ length: count }, (_, i) => ({
      id:    `f${Date.now()}${i}`,
      x:     w * (0.15 + Math.random() * 0.7),
      y:     -8 - i * 18,
      vy:    0.8 + Math.random() * 0.7,
      eaten: false,
    }))
    thucAnRef.current = [...thucAnRef.current, ...newPellets]
  }, [feedSignal])

  // Tìm cá tại vị trí (mx, my) — dùng vị trí HIỆN TẠI của cá
  function timCa(mx, my) {
    for (const ca of danhSachCa) {
      const trang = trangThaiChuyen.get(ca.id)
      if (!trang) continue
      const kt       = KICH_THUOC_THEO_LEVEL[ca.level] || 40
      const sizeMult = (ca.truong_thanh == null || ca.truong_thanh === true) ? 1.3 : 0.8
      const effR     = (kt * sizeMult) / 2
      if ((mx - trang.x) ** 2 + (my - trang.y) ** 2 < effR * effR * 4) {
        return { ca, x: trang.x, y: trang.y }
      }
    }
    return null
  }

  const xuLyClick = useCallback((e) => {
    if (longPressedRef.current) {
      longPressedRef.current = false
      return
    }
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    // Check open oysters first
    for (const [ctId, pos] of Object.entries(conTraiPosRef.current)) {
      const dx = mx - pos.x, dy = my - pos.y
      if (dx * dx + dy * dy < (pos.r * 2.2) ** 2) {
        const ct = conTraiRef.current.find(c => c.id === ctId)
        if (ct?.isOpen) { onClickConTrai?.(ctId); return }
      }
    }

    // Check jellyfish (rendered on top of fish)
    for (const [, pos] of Object.entries(suaPosRef.current)) {
      const dx = mx - pos.x, dy = my - pos.y
      if (dx * dx + dy * dy < (pos.r * 1.8) ** 2) {
        onClickCa?.(pos.obj, pos.x, pos.y)
        return
      }
    }

    const hit = timCa(mx, my)
    if (hit) onClickCa?.(hit.ca, hit.x, hit.y)
  }, [danhSachCa, onClickCa, onClickConTrai])

  const xuLyMouseDown = useCallback((e) => {
    if (!onGiuCa) return  // không cần timer nếu không có handler
    const rect = canvasRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    // Detect cá NGAY LÚC nhấn — cá vẫn còn ở đây, chưa bơi đi
    const hit = timCa(mx, my)
    if (!hit) return  // không nhấn vào cá nào → không cần timer

    giuRef.current = setTimeout(() => {
      longPressedRef.current = true
      onGiuCa(hit.ca, hit.x, hit.y)
    }, 700)
  }, [danhSachCa, onGiuCa])

  const xuLyMouseUp = useCallback(() => {
    clearTimeout(giuRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 right-0 z-0"
      style={{ cursor: 'pointer', height: `calc(100vh - ${bottomPad}px)` }}
      onClick={xuLyClick}
      onMouseDown={xuLyMouseDown}
      onMouseUp={xuLyMouseUp}
      onTouchStart={e => xuLyMouseDown(e.touches[0])}
      onTouchEnd={xuLyMouseUp}
    />
  )
}
