import { useEffect, useRef, useCallback } from 'react'
import { KICH_THUOC_THEO_LEVEL } from '../constants/fishTypes'

const THEME_CFG = {
  'ocean-shallow': { nuoc: ['#0a1628', '#0d2240', '#0f2d4a'], tia: [100,180,255,0.033], rong: 'rgba(34,120,60,0.75)',   da: ['#6b7280','#374151'] },
  'ocean-deep':    { nuoc: ['#020818', '#041030', '#060c20'], tia: [60, 120,200,0.022], rong: 'rgba(20,80,40,0.70)',    da: ['#3a4050','#202838'] },
  'coral-reef':    { nuoc: ['#1a0a2e', '#2d1b4e', '#3d1a0a'], tia: [180,100,255,0.028], rong: 'rgba(130,60,20,0.75)', da: ['#7a5060','#4a2838'] },
  'twilight':      { nuoc: ['#3d2010', '#0a0a1a', '#2d1040'], tia: [255,150,80, 0.022], rong: 'rgba(80,40,90,0.75)',  da: ['#4a3858','#2a2038'] },
  'tropical':      { nuoc: ['#0a2818', '#0d3d20', '#0a2d18'], tia: [80, 200,100,0.028], rong: 'rgba(40,140,40,0.80)', da: ['#506050','#303838'] },
  'sunset':        { nuoc: ['#050508', '#0a0a10', '#080810'], tia: [100,80, 200,0.018], rong: 'rgba(30,30,60,0.70)',  da: ['#303038','#181820'] },
}

const DAY_CFG = {
  'cat_trang': { s1: '#c4a882', s2: '#a08660', rip: '#7a5c38', hz: [196,168,130,0.13] },
  'cat_vang':  { s1: '#d4a853', s2: '#b8863a', rip: '#8a6020', hz: [212,168,83, 0.15] },
  'soi_den':   { s1: '#4a4a5a', s2: '#2a2a38', rip: '#1a1a28', hz: [70, 70, 90, 0.12] },
  'san_ho':    { s1: '#cc6655', s2: '#994040', rip: '#7a3030', hz: [200,100,85, 0.15] },
}

const trangThaiChuyen = new Map()

function khoiTaoChuyen(ca) {
  if (trangThaiChuyen.has(ca.id)) return
  trangThaiChuyen.set(ca.id, {
    x:      ca.vi_tri_x * window.innerWidth,
    y:      ca.vi_tri_y * window.innerHeight,
    huongX: Math.random() > 0.5 ? 1 : -1,
    huongY: (Math.random() - 0.5) * 0.3,
    tocDo:  40,   // px/sec — loop cập nhật mỗi frame theo trạng thái phát
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
function veCa(ctx, ca, trang, dangPhat, hHieuQua, foodTarget, dt) {
  const kt       = KICH_THUOC_THEO_LEVEL[ca.level] || 40
  const sizeMult = (ca.truong_thanh == null || ca.truong_thanh === true) ? 1.3 : 0.8
  const doMo     = tinhDoMo(ca.lan_nghe_cuoi)
  const r        = (kt * sizeMult) / 2

  trang.pha += 2.5 * (dt / 1000)   // ~2.5 rad/sec → ~0.4 Hz tail wag

  if (foodTarget && !foodTarget.ref.eaten) {
    const dx   = foodTarget.x - trang.x
    const dy   = foodTarget.y - trang.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    trang.huongX = dx >= 0 ? 1 : -1
    const spd  = 90 * (dt / 1000)  // 90 px/sec chase speed
    trang.x += (dx / dist) * spd
    trang.y += (dy / dist) * spd * 0.85
    if (dist < r * 1.6 && !foodTarget.ref.eaten) {
      foodTarget.ref.eaten = true
      foodTarget.eatCb?.(ca.id)
    }
  } else {
    trang.x += trang.huongX * trang.tocDo * (dt / 1000)
    trang.y += Math.sin(trang.pha) * 15 * (dt / 1000)  // ±15 px/sec vertical wobble
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
  const pulse = 1 + Math.sin(t * 3.0 + pha) * 0.12
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
    const swing = Math.sin(t * 1.68 + pha + i * 0.75) * 9
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
    // Thiết kế đối xứng: 2 cánh quạt mở ra 2 bên như con điệp/butterfly
    const t     = Date.now() / 1000
    const pulse = 0.76 + Math.sin(t * 2.8) * 0.24   // 0.52 → 1.0

    const shellR  = r * 1.35   // bán kính cánh quạt
    // SPREAD = 108°: cánh trải sang ngang rồi hơi xuống dưới (như ảnh reference)
    // tổng mở: 216° — đỉnh cánh xuống đến ~0.37r bên dưới bản lề
    const SPREAD  = Math.PI * 0.60
    const UP      = -Math.PI / 2     // trục đối xứng: thẳng lên
    const RIBS    = 6
    const NS      = 0.78
    const STEPS   = 48

    // Hàm dựng path hình quạt có mép scallop
    // startA → endA là góc sweep của cánh
    function fanPath(startA, endA, scale) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      for (let i = 0; i <= STEPS; i++) {
        const a  = startA + (endA - startA) * (i / STEPS)
        const tt = i / STEPS
        // cos-squared bump: tạo RIBS mấu tròn đều, không bị âm
        const bump = scale * shellR * (1 + (1 - Math.cos(tt * Math.PI * RIBS * 2)) / 2 * 0.065)
        ctx.lineTo(Math.cos(a) * bump, Math.sin(a) * bump)
      }
      ctx.closePath()
    }

    // ─── VỎ DƯỚI (BOWL/ĐẾ) — vẽ trước cánh quạt ───
    // bowlCenterY + bowlRy = r * 1.10 → đáy vừa chạm cát
    const bowlCenterY = r * 0.60
    const bowlRx      = r * 1.18
    const bowlRy      = r * 0.50
    ctx.save()
    // Mặt ngoài
    ctx.beginPath()
    ctx.ellipse(0, bowlCenterY, bowlRx, bowlRy, 0, 0, Math.PI)
    ctx.closePath()
    const gBowlOut = ctx.createLinearGradient(0, bowlCenterY - bowlRy, 0, bowlCenterY + bowlRy)
    gBowlOut.addColorStop(0,    '#D4C4A0')
    gBowlOut.addColorStop(0.55, '#C2AC88')
    gBowlOut.addColorStop(1,    '#8A7050')
    ctx.fillStyle = gBowlOut
    ctx.fill()
    ctx.strokeStyle = 'rgba(75,55,30,0.3)'
    ctx.lineWidth = 0.85
    ctx.stroke()
    // Mặt trong xà cừ
    ctx.beginPath()
    ctx.ellipse(0, bowlCenterY + bowlRy * 0.10, bowlRx * 0.78, bowlRy * 0.70, 0, 0, Math.PI)
    ctx.closePath()
    const gBowlNacre = ctx.createLinearGradient(0, bowlCenterY, 0, bowlCenterY + bowlRy)
    gBowlNacre.addColorStop(0,    '#F4EDE8')
    gBowlNacre.addColorStop(0.45, '#EDD5C2')
    gBowlNacre.addColorStop(1,    '#CEC3DF')
    ctx.fillStyle = gBowlNacre
    ctx.fill()
    // Gân vỏ
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 0.6
    for (let i = 1; i <= 4; i++) {
      const sc = i / 5
      ctx.beginPath()
      ctx.ellipse(0, bowlCenterY, bowlRx * sc, bowlRy * sc, 0, 0, Math.PI)
      ctx.stroke()
    }
    ctx.restore()

    // ── Aura glow (nhấp nháy) ──
    ctx.save()
    ctx.globalAlpha = 0.15 + Math.sin(t * 2.8) * 0.1
    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, shellR * 1.2)
    aura.addColorStop(0, 'rgba(255,248,225,0.95)')
    aura.addColorStop(1, 'rgba(255,248,225,0)')
    ctx.fillStyle = aura
    ctx.beginPath()
    ctx.arc(0, 0, shellR * 1.25, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // ─── CÁNH TRÁI: UP - SPREAD → UP ───
    // Mặt ngoài
    fanPath(UP - SPREAD, UP, 1.0)
    const gL = ctx.createRadialGradient(-shellR * 0.4, -shellR * 0.4, r * 0.1, 0, 0, shellR)
    gL.addColorStop(0,   '#D4C4A0')
    gL.addColorStop(0.55,'#C2AC88')
    gL.addColorStop(1,   '#8A7050')
    ctx.fillStyle = gL
    ctx.fill()
    ctx.strokeStyle = 'rgba(75,55,30,0.3)'
    ctx.lineWidth = 0.85
    ctx.stroke()

    // Mặt trong (xà cừ) — trắng ngà → hồng → tím
    fanPath(UP - SPREAD, UP, NS)
    const nacreL = ctx.createRadialGradient(
      Math.cos(UP - SPREAD * 0.5) * shellR * 0.5,
      Math.sin(UP - SPREAD * 0.5) * shellR * 0.5, 0,
      0, 0, shellR * NS
    )
    nacreL.addColorStop(0,   '#CEC3DF')   // tím nhạt (mép ngoài)
    nacreL.addColorStop(0.45,'#EDD5C2')   // hồng nhạt
    nacreL.addColorStop(1,   '#F4EDE8')   // trắng ngà (bản lề)
    ctx.fillStyle = nacreL
    ctx.fill()

    // Gân vỏ trái
    ctx.strokeStyle = 'rgba(255,255,255,0.24)'
    ctx.lineWidth = 0.7
    for (let i = 1; i <= RIBS; i++) {
      const a = (UP - SPREAD) + SPREAD * (i / (RIBS + 1))
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * shellR * 0.92, Math.sin(a) * shellR * 0.92)
      ctx.stroke()
    }
    // Gân viền ngoài mờ
    ctx.strokeStyle = 'rgba(100,78,50,0.35)'
    ctx.lineWidth = 0.5
    for (let i = 1; i <= RIBS; i++) {
      const a = (UP - SPREAD) + SPREAD * (i / (RIBS + 1))
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * shellR * 0.96, Math.sin(a) * shellR * 0.96)
      ctx.stroke()
    }

    // ─── CÁNH PHẢI: UP → UP + SPREAD ───
    // Mặt ngoài
    fanPath(UP, UP + SPREAD, 1.0)
    const gR = ctx.createRadialGradient(shellR * 0.4, -shellR * 0.4, r * 0.1, 0, 0, shellR)
    gR.addColorStop(0,   '#D4C4A0')
    gR.addColorStop(0.55,'#C2AC88')
    gR.addColorStop(1,   '#8A7050')
    ctx.fillStyle = gR
    ctx.fill()
    ctx.strokeStyle = 'rgba(75,55,30,0.3)'
    ctx.lineWidth = 0.85
    ctx.stroke()

    // Mặt trong (xà cừ)
    fanPath(UP, UP + SPREAD, NS)
    const nacreR = ctx.createRadialGradient(
      Math.cos(UP + SPREAD * 0.5) * shellR * 0.5,
      Math.sin(UP + SPREAD * 0.5) * shellR * 0.5, 0,
      0, 0, shellR * NS
    )
    nacreR.addColorStop(0,   '#CEC3DF')
    nacreR.addColorStop(0.45,'#EDD5C2')
    nacreR.addColorStop(1,   '#F4EDE8')
    ctx.fillStyle = nacreR
    ctx.fill()

    // Gân vỏ phải
    ctx.strokeStyle = 'rgba(255,255,255,0.24)'
    ctx.lineWidth = 0.7
    for (let i = 1; i <= RIBS; i++) {
      const a = UP + SPREAD * (i / (RIBS + 1))
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * shellR * 0.92, Math.sin(a) * shellR * 0.92)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(100,78,50,0.35)'
    ctx.lineWidth = 0.5
    for (let i = 1; i <= RIBS; i++) {
      const a = UP + SPREAD * (i / (RIBS + 1))
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * shellR * 0.96, Math.sin(a) * shellR * 0.96)
      ctx.stroke()
    }

    // ─── BẢN LỀ (nút tròn nhỏ giữa 2 cánh) ───
    const hinge = ctx.createRadialGradient(-r * 0.08, -r * 0.08, 0, 0, 0, r * 0.24)
    hinge.addColorStop(0, '#E0D0B8')
    hinge.addColorStop(1, '#9A8060')
    ctx.fillStyle = hinge
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(75,55,30,0.3)'
    ctx.lineWidth = 0.7
    ctx.stroke()

    // ─── NGỌC TRAI — nằm trong lòng vỏ dưới ───
    const pr = r * 0.50              // ~15px at r=30
    const py = bowlCenterY - pr      // đáy ngọc chạm đúng mép vỏ dưới

    // Glow (nhấp nháy)
    ctx.save()
    ctx.globalAlpha = pulse * 0.58
    const pGlow = ctx.createRadialGradient(0, py, 0, 0, py, pr * 2.0)
    pGlow.addColorStop(0, 'rgba(255,253,246,0.95)')
    pGlow.addColorStop(1, 'rgba(255,253,246,0)')
    ctx.fillStyle = pGlow
    ctx.beginPath()
    ctx.arc(0, py, pr * 2.0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Thân ngọc
    ctx.save()
    ctx.globalAlpha = 0.65 + pulse * 0.35
    const pBody = ctx.createRadialGradient(-pr * 0.32, py - pr * 0.32, 0, pr * 0.06, py + pr * 0.06, pr)
    pBody.addColorStop(0,    '#FFFFFF')
    pBody.addColorStop(0.22, '#F9F2E6')
    pBody.addColorStop(0.6,  '#E6DED2')
    pBody.addColorStop(1,    '#C8BCB5')
    ctx.fillStyle = pBody
    ctx.beginPath()
    ctx.arc(0, py, pr, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(195,182,170,0.4)'
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Highlight chính
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.beginPath()
    ctx.ellipse(-pr * 0.3, py - pr * 0.3, pr * 0.22, pr * 0.12, -0.5, 0, Math.PI * 2)
    ctx.fill()
    // Shimmer phụ
    ctx.fillStyle = 'rgba(255,255,255,0.32)'
    ctx.beginPath()
    ctx.ellipse(pr * 0.22, py + pr * 0.22, pr * 0.1, pr * 0.06, 0.75, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

  } else {
    // Closed shell — màu be/nâu nhạt, vân vỏ
    const gClosed = ctx.createRadialGradient(-r * 0.25, -r * 0.15, 0, 0, 0, r)
    gClosed.addColorStop(0,   '#D4C4A8')
    gClosed.addColorStop(0.6, '#C0AC8C')
    gClosed.addColorStop(1,   '#A08870')
    ctx.fillStyle = gClosed
    ctx.beginPath()
    ctx.ellipse(0, 0, r, r * 0.42, 0, 0, Math.PI * 2)
    ctx.fill()

    // Đường mép giáp vỏ
    ctx.strokeStyle = 'rgba(90,68,45,0.3)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.ellipse(0, 0, r, r * 0.07, 0, 0, Math.PI * 2)
    ctx.stroke()

    // Vân tỏa ra từ bản lề
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 0.65
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue
      const xi = i * r * 0.35
      ctx.beginPath()
      ctx.moveTo(xi * 0.2, -r * 0.38)
      ctx.quadraticCurveTo(xi * 0.55, 0, xi * 0.2, r * 0.38)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(0, -r * 0.40)
    ctx.lineTo(0, r * 0.40)
    ctx.stroke()

    // Gợi ý ngọc bên trong (glow mờ)
    ctx.save()
    ctx.globalAlpha = 0.14
    const innerHint = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.5)
    innerHint.addColorStop(0, 'rgba(255,248,235,1)')
    innerHint.addColorStop(1, 'rgba(255,248,235,0)')
    ctx.fillStyle = innerHint
    ctx.beginPath()
    ctx.ellipse(0, 0, r * 0.65, r * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
}

function veBongBong(ctx, bongBubbles, dt) {
  bongBubbles.forEach((b, i) => {
    b.y -= b.tocDo * (dt / 1000)
    b.x += Math.sin(b.y * 0.03 + b.pha) * 0.25
    if (b.y < -10) {
      bongBubbles[i] = {
        x: Math.random() * ctx.canvas.width,
        y: ctx.canvas.height + 10,
        r: 0.7 + Math.random() * 1.4,
        tocDo: 8 + Math.random() * 14,
        doMo: 0.15 + Math.random() * 0.35,
        pha: Math.random() * Math.PI * 2,
      }
      return
    }
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(150,200,255,${b.doMo})`
    ctx.fill()
  })
}

function veBubbleLofi(ctx, bubbles, dt) {
  bubbles.forEach((b, i) => {
    b.y -= b.tocDo * (dt / 1000)
    b.x += Math.sin(b.y * 0.025 + b.pha) * 0.4
    if (b.y < -20) {
      bubbles[i] = {
        x: Math.random() * ctx.canvas.width,
        y: ctx.canvas.height + 20,
        r: 3 + Math.random() * 5,
        tocDo: 12 + Math.random() * 20,
        pha: Math.random() * Math.PI * 2,
      }
      return
    }
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fill()
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
  onSuaPos,
  conTrai        = [],
  onClickConTrai,
  bottomPad      = 0,
  feedSignal        = 0,
  onCaAnThucAn,
  coinHarvestSignal = 0,
}) {
  const canvasRef      = useRef(null)
  const frameRef       = useRef(0)
  const lastTimeRef    = useRef(null)
  const elapsedRef     = useRef(0)
  const animLoopRef    = useRef(null)
  const depsRef        = useRef({})
  const genRef         = useRef(0)
  const bongRef        = useRef(
    Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.7 + Math.random() * 1.4,
      tocDo: 8 + Math.random() * 14,
      doMo: 0.15 + Math.random() * 0.35,
      pha: Math.random() * Math.PI * 2,
    }))
  )
  const bubbleRef      = useRef(
    Array.from({ length: 6 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 3 + Math.random() * 5,
      tocDo: 12 + Math.random() * 20,
      pha: Math.random() * Math.PI * 2,
    }))
  )
  const giuRef         = useRef(null)
  const longPressedRef = useRef(false)
  const suaGaiRef           = useRef(suaGai)
  suaGaiRef.current         = suaGai
  const suaPosRef           = useRef({})
  const suaPosThrottleRef   = useRef(0)
  const onSuaPosRef         = useRef(onSuaPos)
  onSuaPosRef.current       = onSuaPos
  const conTraiRef     = useRef(conTrai)
  conTraiRef.current   = conTrai
  const conTraiPosRef  = useRef({})
  const bottomPadRef   = useRef(bottomPad)
  bottomPadRef.current = bottomPad
  const thucAnRef          = useRef([])
  const feedSignalRef      = useRef(feedSignal)
  const onCaAnRef          = useRef(onCaAnThucAn)
  onCaAnRef.current        = onCaAnThucAn
  const caLevelUpStartRef  = useRef(null)
  const coinRef            = useRef([])
  const fishPosRef         = useRef(new Map())
  const coinHarvestSigRef  = useRef(0)
  const pearlPickRef       = useRef([])

  danhSachCa.forEach(khoiTaoChuyen)

  // Cập nhật deps mỗi render — loop đọc qua ref, không restart
  depsRef.current = { danhSachCa, dangPhat, nenHo, dayHo, caLevelUp }

  // Gán hàm loop mỗi render để luôn có closure mới nhất
  animLoopRef.current = (timestamp) => {
    if (lastTimeRef.current === null) lastTimeRef.current = timestamp
    const rawDt = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp
    const dt = Math.min(rawDt, 50)   // cap 50ms chỉ cho trường hợp tab bị ẩn
    elapsedRef.current += dt
    const t = elapsedRef.current / 1000   // giây thực

    const { danhSachCa: dsCa, dangPhat: dpId, nenHo: nenKey, dayHo: dayKey, caLevelUp: clu } = depsRef.current

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const effectiveH = window.innerHeight - bottomPadRef.current
    if (canvas.width !== window.innerWidth || canvas.height !== effectiveH) {
      canvas.width  = window.innerWidth
      canvas.height = effectiveH
    }

    const w = canvas.width, h = canvas.height
    const theme = THEME_CFG[nenKey] || THEME_CFG['ocean-shallow']
    const day   = DAY_CFG[dayKey]   || DAY_CFG['cat_trang']

    // ─── Background gradient ────────────────────────────────────────
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    theme.nuoc.forEach((c, i) => grad.addColorStop(i / (theme.nuoc.length - 1), c))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // ─── God rays ───────────────────────────────────────────────────
    const [tr, tg, tb, ta] = theme.tia
    ctx.save()
    for (let i = 0; i < 5; i++) {
      const cx   = (0.12 + i * 0.18) * w + Math.sin(t / (22 + i * 3) * Math.PI * 2) * w * 0.04
      const topW = w * 0.025
      const botW = w * 0.11
      const rayLen = h * 0.72
      const rayGrad = ctx.createLinearGradient(0, 0, 0, rayLen)
      rayGrad.addColorStop(0, `rgba(${tr},${tg},${tb},${ta})`)
      rayGrad.addColorStop(1, `rgba(${tr},${tg},${tb},0)`)
      ctx.fillStyle = rayGrad
      ctx.beginPath()
      ctx.moveTo(cx - topW, 0)
      ctx.lineTo(cx + topW, 0)
      ctx.lineTo(cx + botW, rayLen)
      ctx.lineTo(cx - botW, rayLen)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()

    // ─── Sand ───────────────────────────────────────────────────────
    const dayH = 60
    const dayY = h - dayH

    const [hr, hg, hb, ha] = day.hz
    const hazeGrad = ctx.createLinearGradient(0, dayY - 28, 0, dayY + 8)
    hazeGrad.addColorStop(0, `rgba(${hr},${hg},${hb},0)`)
    hazeGrad.addColorStop(1, `rgba(${hr},${hg},${hb},${ha})`)
    ctx.fillStyle = hazeGrad
    ctx.fillRect(0, dayY - 28, w, 36)

    const sandGrad = ctx.createLinearGradient(0, dayY, 0, h)
    sandGrad.addColorStop(0, day.s1)
    sandGrad.addColorStop(1, day.s2)
    ctx.fillStyle = sandGrad
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let sx = 0; sx <= w; sx += 14) {
      const sy = dayY
        + Math.sin(sx * 0.035 + t * 0.22) * 3.5
        + Math.sin(sx * 0.018 + t * 0.14) * 5
      ctx.lineTo(sx, sy)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()

    ctx.save()
    ctx.globalAlpha = 0.08
    ctx.strokeStyle = day.rip
    ctx.lineWidth = 1
    for (let ri = 0; ri < 3; ri++) {
      const ryBase = dayY + 14 + ri * 14
      ctx.beginPath()
      for (let sx = 0; sx <= w; sx += 10) {
        const sy = ryBase + Math.sin(sx * 0.03 + ri * 1.1 + t * 0.08) * 2
        sx === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
      }
      ctx.stroke()
    }
    ctx.restore()

    // ─── Rocks ──────────────────────────────────────────────────────
    ;[
      { xf: 0.27, rx: 26, ry: 17, ang: 0.18 },
      { xf: 0.43, rx: 20, ry: 14, ang: -0.12 },
      { xf: 0.63, rx: 18, ry: 13, ang: 0.22 },
      { xf: 0.87, rx: 24, ry: 16, ang: -0.08 },
    ].forEach(({ xf, rx, ry, ang }) => {
      const cx = xf * w
      const cy = dayY + 6
      const rg = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.3, 2, cx, cy, rx)
      rg.addColorStop(0, theme.da[0])
      rg.addColorStop(1, theme.da[1])
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(ang)
      ctx.beginPath()
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      ctx.fillStyle = rg
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    })

    // ─── Starfish ───────────────────────────────────────────────────
    ;[{ xf: 0.34, r: 11 }, { xf: 0.72, r: 9 }].forEach(({ xf, r }) => {
      const sx = xf * w
      const sy = dayY + r * 0.6
      ctx.save()
      ctx.translate(sx, sy)
      ctx.fillStyle = '#c07040'
      ctx.beginPath()
      for (let p = 0; p < 10; p++) {
        const a = (p / 10) * Math.PI * 2 - Math.PI / 2
        const rad = p % 2 === 0 ? r : r * 0.42
        p === 0 ? ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad)
                : ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    })

    // ─── Seaweed ────────────────────────────────────────────────────
    ;[0.14, 0.51, 0.79].forEach((xf, ci) => {
      for (let si = 0; si < 3; si++) {
        const stalkX = xf * w + (si - 1) * 14
        const stalkH = 55 + si * 12
        const sway   = Math.sin(t * 0.7 + ci * 1.4 + si * 0.9) * 10
        ctx.save()
        ctx.strokeStyle = theme.rong
        ctx.lineWidth = 3.5 - si * 0.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(stalkX, dayY + 4)
        ctx.quadraticCurveTo(
          stalkX + sway * 0.5, dayY - stalkH * 0.5,
          stalkX + sway,       dayY - stalkH,
        )
        ctx.stroke()
        ctx.restore()
      }
    })

    veBongBong(ctx, bongRef.current, dt)

    const thucAnActive = thucAnRef.current.filter(f => !f.eaten)
    const eatCb = onCaAnRef.current
    const nowTs = Date.now()

    dsCa.forEach(ca => {
      const trang = trangThaiChuyen.get(ca.id)
      if (!trang) return

      // Tốc độ theo trạng thái phát nhạc: 80 px/s khi đang phát, 40 px/s khi không
      trang.tocDo = (ca.id === dpId) ? 80 : 40

      // Food-chasing AI — chỉ khi đói (>45 phút chưa ăn)
      const lastFedProp  = ca.lan_cho_an_cuoi ? new Date(ca.lan_cho_an_cuoi).getTime() : 0
      const lastFedLocal = Number(localStorage.getItem(`snd_an_${ca.id}`)) || 0
      const lastFed      = Math.max(lastFedProp, lastFedLocal)
      const isHungry     = !lastFed || (nowTs - lastFed > HUNGER_MS)
      let foodTarget = null
      if (isHungry && thucAnActive.length > 0) {
        let nearF = null, nearD2 = Infinity
        thucAnActive.forEach(f => {
          if (f.eaten) return
          const d2 = (f.x - trang.x) ** 2 + (f.y - trang.y) ** 2
          if (d2 < nearD2) { nearD2 = d2; nearF = f }
        })
        if (nearF && !nearF.eaten) foodTarget = { ref: nearF, x: nearF.x, y: nearF.y, eatCb }
      }

      veCa(ctx, ca, trang, dpId === ca.id, h, foodTarget, dt)
      fishPosRef.current.set(ca.id, { x: trang.x, y: trang.y })

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

    // Vẽ sứa gai
    const suaList = suaGaiRef.current
    if (suaList.length > 0) {
      suaList.forEach(sua => {
        const pha = sua.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 0.037 % (Math.PI * 2)
        const rx  = sua.vi_tri_x * w
        const ry  = Math.min(sua.vi_tri_y, 0.52) * h + Math.sin(t * 0.84 + pha) * 12
        const sr  = Math.min(w, h) * 0.038
        veSua(ctx, rx, ry, sr, pha, t)
        suaPosRef.current[sua.id] = { x: rx, y: ry, r: sr, obj: sua }
      })
      // Throttle: emit positions to React for overlay click targets (~8fps)
      const now = Date.now()
      if (onSuaPosRef.current && now - suaPosThrottleRef.current > 120) {
        suaPosThrottleRef.current = now
        const positions = suaList.map(sua => suaPosRef.current[sua.id]).filter(Boolean)
        onSuaPosRef.current(positions)
      }
    }

    // Vẽ con trai đáy hồ
    const ctList = conTraiRef.current
    if (ctList.length > 0) {
      const oysterR = Math.min(w * 0.07, 55)
      // +12: đẩy vào vùng cát thấy được (gradient transparent tại dayY, opaque ~14px thấp hơn)
      const sandY   = h - dayH + 12
      ctList.forEach(ct => {
        const ox = ct.x * w
        // Tâm vẽ khác nhau để đáy luôn chạm mặt cát dù đóng hay mở
        const oy = ct.isOpen
          ? sandY - oysterR * 1.10   // vỏ dưới (bowl) chạm cát
          : sandY - oysterR * 0.42   // ellipse đóng chạm cát
        veConTrai(ctx, ox, oy, oysterR, ct.isOpen)
        conTraiPosRef.current[ct.id] = { x: ox, y: oy, r: oysterR }
      })
    }

    veBubbleLofi(ctx, bubbleRef.current, dt)

    // Thức ăn rơi — dùng delta time, 80-100 px/giây
    thucAnRef.current.forEach(f => {
      if (f.eaten) return
      f.y  += f.vy * (dt / 1000)
      f.vy  = Math.min(f.vy + 80 * (dt / 1000), 90)  // trọng lực 80 px/s², tối đa 90 px/s
      f.x  += Math.sin(f.y * 0.04) * 0.45             // wobble nhẹ sang trái phải
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

    // Coin drip animation
    const nowCoin = Date.now()
    coinRef.current = coinRef.current.filter(c => nowCoin - c.spawnMs < 1400)
    coinRef.current.forEach(c => {
      const p  = (nowCoin - c.spawnMs) / 1400
      const cy = c.y - p * 42
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - p * 1.2)
      ctx.beginPath()
      ctx.arc(c.x, cy, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#F59E0B'
      ctx.fill()
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#FBBF24'
      ctx.fillText('+1', c.x, cy - 10)
      ctx.restore()
    })

    // Pearl pick animation (+50 coins khi nhặt ngọc trai)
    const nowPickMs = Date.now()
    pearlPickRef.current = pearlPickRef.current.filter(p => nowPickMs - p.spawnMs < 1200)
    pearlPickRef.current.forEach(p => {
      const prog = (nowPickMs - p.spawnMs) / 1200
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - prog * 1.3)
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#F59E0B'
      ctx.fillText('+50 🪙', p.x, p.y - prog * 70)
      ctx.restore()
    })

    if (clu) {
      if (caLevelUpStartRef.current === null) caLevelUpStartRef.current = elapsedRef.current
      const trang = trangThaiChuyen.get(clu)
      if (trang) {
        const ageMs = elapsedRef.current - caLevelUpStartRef.current
        const DUR = 2000
        const p   = Math.min(ageMs / DUR, 1)   // 0→1 over 2s
        const fade = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3

        // Vòng nổ tung — 12 hạt, bán kính tăng dần
        for (let i = 0; i < 12; i++) {
          const goc = (i / 12) * Math.PI * 2
          const r   = 10 + p * 55
          const sz  = 4 * (1 - p * 0.5)
          const hue = 40 + i * 8
          ctx.save()
          ctx.globalAlpha = fade * 0.85
          ctx.beginPath()
          ctx.arc(trang.x + Math.cos(goc) * r, trang.y + Math.sin(goc) * r, sz, 0, Math.PI * 2)
          ctx.fillStyle = `hsl(${hue},100%,65%)`
          ctx.fill()
          ctx.restore()
        }

        // Chữ +1 LVL nổi lên
        const textY = trang.y - 40 - p * 20
        ctx.save()
        ctx.globalAlpha = fade
        ctx.font = `bold ${14 + Math.round(p * 4)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillStyle = '#ffd700'
        ctx.fillText('▲ LVL UP!', trang.x, textY)
        ctx.restore()
      }
    } else {
      caLevelUpStartRef.current = null
    }

  }

  // Generation counter: chỉ loop có genRef.current === myGen mới được chạy
  // → khi cleanup tăng genRef.current, mọi loop cũ dừng dứt khoát
  useEffect(() => {
    genRef.current++
    const myGen = genRef.current
    lastTimeRef.current = null
    function tick(ts) {
      if (genRef.current !== myGen) return
      animLoopRef.current(ts)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { genRef.current++ }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      vy:    20 + Math.random() * 20,     // px/sec (tăng tốc đến max 90)
      eaten: false,
    }))
    thucAnRef.current = [...thucAnRef.current, ...newPellets]
  }, [feedSignal])

  // Spawn coin animation khi thu hoạch cá no
  useEffect(() => {
    if (coinHarvestSignal === coinHarvestSigRef.current) return
    coinHarvestSigRef.current = coinHarvestSignal
    const nowTs = Date.now()
    depsRef.current.danhSachCa.forEach(ca => {
      const lastFedProp  = ca.lan_cho_an_cuoi ? new Date(ca.lan_cho_an_cuoi).getTime() : 0
      const lastFedLocal = Number(localStorage.getItem(`snd_an_${ca.id}`)) || 0
      const lastFed      = Math.max(lastFedProp, lastFedLocal)
      if (lastFed && nowTs - lastFed <= HUNGER_MS) {
        const pos = fishPosRef.current.get(ca.id)
        if (pos) coinRef.current.push({ x: pos.x, y: pos.y - 20, spawnMs: nowTs })
      }
    })
  }, [coinHarvestSignal])

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
        if (ct?.isOpen) {
          pearlPickRef.current.push({ x: pos.x, y: pos.y - pos.r, spawnMs: Date.now() })
          onClickConTrai?.(ctId)
          return
        }
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
