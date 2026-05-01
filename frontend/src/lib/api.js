import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Pre-warm Render free-tier server on page load
fetch(`${BASE}/health`).catch(() => {})

async function layHeader() {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function goiApi(path, options = {}, _retry = true) {
  const headers = await layHeader()
  const fullUrl = `${BASE}${path}`
  console.log(`[API] ${options.method || 'GET'} ${fullUrl}`, {
    hasAuth: !!headers.Authorization,
    retry: !_retry,
  })

  const ctrl = new AbortController()
  const tid  = setTimeout(() => ctrl.abort(), 40000)
  let resp
  try {
    resp = await fetch(fullUrl, { ...options, headers, signal: ctrl.signal })
  } catch (err) {
    clearTimeout(tid)
    console.error(`[API] NETWORK ERROR on ${fullUrl}`, {
      name: err.name,
      message: err.message,
      isAbort: err.name === 'AbortError',
    })
    if (err.name === 'AbortError') throw new Error('Server đang khởi động, thử lại sau')
    if (_retry) {
      console.log('[API] Polling /health until server wakes...')
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 5000))
        try {
          const ping = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(4000) })
          console.log(`[API] Health poll ${i + 1}: ${ping.status}`)
          if (ping.ok) break
        } catch (pe) {
          console.log(`[API] Health poll ${i + 1}: error (${pe.message})`)
        }
      }
      return goiApi(path, options, false)
    }
    throw new Error('Server không phản hồi — thử tắt ad blocker hoặc đổi mạng')
  }
  clearTimeout(tid)

  console.log(`[API] ${resp.status} ${fullUrl}`)

  if (resp.status === 401) {
    const { data, error } = await supabase.auth.refreshSession()
    if (error || !data.session) {
      await supabase.auth.signOut()
      window.location.href = '/login'
      return
    }
    const newHeaders = await layHeader()
    const retry = await fetch(fullUrl, { ...options, headers: newHeaders })
    console.log(`[API] retry after 401: ${retry.status}`)
    if (!retry.ok) {
      const body = await retry.json().catch(() => ({ detail: 'Lỗi kết nối' }))
      console.error('[API] retry error body:', body)
      throw new Error(body.detail || 'Lỗi không xác định')
    }
    return retry.json()
  }

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ detail: 'Lỗi kết nối' }))
    console.error(`[API] HTTP ${resp.status} error body:`, body)
    throw new Error(body.detail || 'Lỗi không xác định')
  }
  return resp.json()
}

export const API = {
  // Profile
  layProfile: () => goiApi('/api/profile/cua-toi'),

  capNhatTenHienThi: (ten_hien_thi) =>
    goiApi('/api/profile/cap-nhat-ten', {
      method: 'PATCH',
      body: JSON.stringify({ ten_hien_thi }),
    }),

  capNhatAvatar: (loai_ca) =>
    goiApi('/api/profile/cap-nhat-avatar', {
      method: 'PATCH',
      body: JSON.stringify({ loai_ca }),
    }),

  // Fish
  themCa: (youtubeUrl, nickname, loaiCa) =>
    goiApi('/api/fish/them-ca', {
      method: 'POST',
      body: JSON.stringify({ youtube_url: youtubeUrl, nickname, loai_ca: loaiCa }),
    }),

  layDanhSachCa: (tankId) =>
    goiApi(`/api/fish/danh-sach${tankId ? `?tank_id=${tankId}` : ''}`),

  chinhSuaCa: (caId, data) =>
    goiApi(`/api/fish/chinh-sua/${caId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  xoaCa: (caId) =>
    goiApi(`/api/fish/xoa/${caId}`, { method: 'DELETE' }),

  choAnCa: (caId, tankId) =>
    goiApi(`/api/fish/cho-an/${caId}${tankId ? `?tank_id=${tankId}` : ''}`, { method: 'POST' }),

  thuHoachCaNo: (tankId) =>
    goiApi(`/api/fish/thu-hoach-ca-no${tankId ? `?tank_id=${tankId}` : ''}`, { method: 'POST' }),

  capNhatNghe: (caId, soPhut = 5) =>
    goiApi(`/api/fish/cap-nhat-nghe/${caId}`, {
      method: 'POST',
      body: JSON.stringify({ so_phut: soPhut }),
    }),

  testCapXP: (caId, soGio) =>
    goiApi(`/api/fish/test-cap-xp/${caId}`, {
      method: 'POST',
      body: JSON.stringify({ so_gio: soGio }),
    }),

  // Pearl & Jellyfish
  thuNgoc:    () => goiApi('/api/profile/thu-ngoc',     { method: 'POST' }),
  muaSua:     () => goiApi('/api/profile/mua-sua',      { method: 'POST' }),
  muaConTrai: () => goiApi('/api/profile/mua-con-trai', { method: 'POST' }),
  nhatNgoc:   () => goiApi('/api/profile/nhat-ngoc',    { method: 'POST' }),

  // Tank
  layDanhSachTank: () => goiApi('/api/tank/danh-sach'),
  layTankCuaToi: () => goiApi('/api/tank/cua-toi'),
  layTankTheoId: (tankId) => goiApi(`/api/tank/theo-id/${tankId}`),
  taoTankMoi: () => goiApi('/api/tank/tao-moi', { method: 'POST' }),

  xemTankNguoiKhac: (username) => goiApi(`/api/tank/xem/${username}`),

  capNhatTank: (data, tankId) =>
    goiApi(`/api/tank/cap-nhat${tankId ? `?tank_id=${tankId}` : ''}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  layTankNgauNhien: () => goiApi('/api/tank/ngau-nhien'),

  // Decorations
  layDecor: (tankId) =>
    goiApi(`/api/decor/danh-sach${tankId ? `?tank_id=${tankId}` : ''}`),

  muaDecor: (loai, tankId) =>
    goiApi('/api/decor/mua', {
      method: 'POST',
      body: JSON.stringify({ loai, tank_id: tankId || null }),
    }),

  capNhatDecor: (id, data) =>
    goiApi(`/api/decor/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  xoaDecor: (id) => goiApi(`/api/decor/${id}`, { method: 'DELETE' }),

  // Coins
  thuHoachCoins: () => goiApi('/api/coins/thu-hoach'),

  xemSoDuCoins: () => goiApi('/api/coins/so-du'),

  muaItem: (itemId) =>
    goiApi(`/api/coins/mua-item/${itemId}`, { method: 'POST' }),

  // Analytics
  batDauSession: () => goiApi('/api/analytics/bat-dau-session', { method: 'POST' }),

  capNhatSession: (sessionId, durationSeconds) =>
    goiApi('/api/analytics/cap-nhat-session', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, duration_seconds: durationSeconds }),
    }),

  ketThucSession: (sessionId, durationSeconds) =>
    goiApi('/api/analytics/ket-thuc-session', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, duration_seconds: durationSeconds }),
    }),

  ketThucSessionSync: (sessionId, durationSeconds, token) =>
    fetch(`${BASE}/api/analytics/ket-thuc-session`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ session_id: sessionId, duration_seconds: durationSeconds }),
    }),

  layDashboard: () => goiApi('/api/analytics/dashboard'),

  // Feedback
  danhGia: (liked) =>
    goiApi('/api/feedback/danh-gia', {
      method: 'POST',
      body: JSON.stringify({ liked }),
    }),

  trangThaiFeedback: () => goiApi('/api/feedback/trang-thai'),

  // Audio (yt-dlp)
  layAudioUrl: (videoId) => goiApi(`/audio/url?v=${encodeURIComponent(videoId)}`),
}
