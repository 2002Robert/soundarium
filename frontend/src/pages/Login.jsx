import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail]         = useState('')
  const [matKhau, setMatKhau]     = useState('')
  const [dangKy, setDangKy]       = useState(false)
  const [nhoDangNhap, setNhoDangNhap] = useState(true)
  const [dangGui, setDangGui]     = useState(false)
  const [loi, setLoi]             = useState('')
  const navigate = useNavigate()

  async function xuLyGui(e) {
    e.preventDefault()
    setDangGui(true)
    setLoi('')

    try {
      if (dangKy) {
        const { error } = await supabase.auth.signUp({
          email,
          password: matKhau,
          options: { data: { remember: nhoDangNhap } },
        })
        if (error) throw error
        // Sau đăng ký → đặt tên hồ trước khi vào app
        navigate('/setup-profile')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: matKhau,
        })
        if (error) throw error

        // Nếu không tích nhớ → xóa session khi đóng tab
        if (!nhoDangNhap) {
          localStorage.setItem('snd_no_persist', '1')
        } else {
          localStorage.removeItem('snd_no_persist')
        }
        navigate('/')
      }
    } catch (err) {
      setLoi(err.message || 'Có lỗi xảy ra')
    } finally {
      setDangGui(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ho-sau px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🐟</div>
          <h1 className="text-2xl font-bold text-white">Soundarium</h1>
          <p className="text-ho-anh/60 text-sm mt-1">Hồ cá nhạc của bạn</p>
        </div>

        <form onSubmit={xuLyGui} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-ho-nong border border-ho-anh/20 rounded-xl px-4 py-3 text-white placeholder-ho-anh/40 focus:outline-none focus:border-ho-anh"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={matKhau}
            onChange={e => setMatKhau(e.target.value)}
            required
            minLength={6}
            className="w-full bg-ho-nong border border-ho-anh/20 rounded-xl px-4 py-3 text-white placeholder-ho-anh/40 focus:outline-none focus:border-ho-anh"
          />

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer select-none px-1">
            <div
              onClick={() => setNhoDangNhap(!nhoDangNhap)}
              className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                nhoDangNhap
                  ? 'bg-ho-anh border-ho-anh'
                  : 'border-ho-anh/30 bg-transparent'
              }`}
            >
              {nhoDangNhap && <span className="text-ho-sau text-xs font-bold">✓</span>}
            </div>
            <span className="text-ho-anh/60 text-sm">Lưu thông tin đăng nhập</span>
          </label>

          {loi && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 rounded-xl p-3">
              {loi}
            </div>
          )}

          <button
            type="submit"
            disabled={dangGui}
            className="w-full bg-ho-anh text-ho-sau font-bold py-3 rounded-xl hover:bg-ho-accent transition disabled:opacity-50"
          >
            {dangGui ? '...' : dangKy ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </form>

        <button
          onClick={() => { setDangKy(!dangKy); setLoi('') }}
          className="w-full text-ho-anh/60 hover:text-ho-anh text-sm mt-4 transition"
        >
          {dangKy ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </button>
      </div>
    </div>
  )
}
