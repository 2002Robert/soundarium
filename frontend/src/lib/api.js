import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function layHeader() {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function goiApi(path, options = {}) {
  const headers = await layHeader()
  const resp = await fetch(`${BASE}${path}`, { ...options, headers })

  if (resp.status === 401) {
    // Token hết hạn — thử refresh session một lần
    const { data, error } = await supabase.auth.refreshSession()
    if (error || !data.session) {
      // Refresh thất bại → xóa session cũ và về login
      await supabase.auth.signOut()
      window.location.href = '/login'
      return
    }
    // Retry với token mới
    const newHeaders = await layHeader()
    const retry = await fetch(`${BASE}${path}`, { ...options, headers: newHeaders })
    if (!retry.ok) {
      const err = await retry.json().catch(() => ({ detail: 'Lỗi kết nối' }))
      throw new Error(err.detail || 'Lỗi không xác định')
    }
    return retry.json()
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: 'Lỗi kết nối' }))
    throw new Error(err.detail || 'Lỗi không xác định')
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

  layDanhSachCa: () => goiApi('/api/fish/danh-sach'),

  chinhSuaCa: (caId, data) =>
    goiApi(`/api/fish/chinh-sua/${caId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  xoaCa: (caId) =>
    goiApi(`/api/fish/xoa/${caId}`, { method: 'DELETE' }),

  choAnCa: (caId) =>
    goiApi(`/api/fish/cho-an/${caId}`, { method: 'POST' }),

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

  // Tank
  layTankCuaToi: () => goiApi('/api/tank/cua-toi'),

  xemTankNguoiKhac: (username) => goiApi(`/api/tank/xem/${username}`),

  capNhatTank: (data) =>
    goiApi('/api/tank/cap-nhat', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  layTankNgauNhien: () => goiApi('/api/tank/ngau-nhien'),

  // Coins
  thuHoachCoins: () => goiApi('/api/coins/thu-hoach'),

  xemSoDuCoins: () => goiApi('/api/coins/so-du'),

  muaItem: (itemId) =>
    goiApi(`/api/coins/mua-item/${itemId}`, { method: 'POST' }),
}
