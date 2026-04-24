import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [matKhau, setMatKhau]   = useState('')
  const [dangKy, setDangKy]     = useState(false)
  const [dangGui, setDangGui]   = useState(false)
  const [loi, setLoi]           = useState('')
  const navigate = useNavigate()

  async function xuLyGui(e) {
    e.preventDefault()
    setDangGui(true)
    setLoi('')

    try {
      if (dangKy) {
        const { error } = await supabase.auth.signUp({ email, password: matKhau })
        if (error) throw error
        // Trigger sẽ tự tạo profile và tank
        navigate('/')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: matKhau })
        if (error) throw error
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

          {loi && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg p-2">
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
          onClick={() => setDangKy(!dangKy)}
          className="w-full text-ho-anh/60 hover:text-ho-anh text-sm mt-4 transition"
        >
          {dangKy ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </button>
      </div>
    </div>
  )
}
