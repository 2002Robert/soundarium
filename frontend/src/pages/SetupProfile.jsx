import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../lib/api'

export default function SetupProfile() {
  const [ten, setTen]       = useState('')
  const [loi, setLoi]       = useState('')
  const [dangLuu, setDangLuu] = useState(false)
  const navigate = useNavigate()

  async function xuLyLuu(e) {
    e.preventDefault()
    setDangLuu(true)
    setLoi('')
    try {
      await API.capNhatTenHienThi(ten.trim())
      localStorage.setItem('snd_onboarded', '0') // Trigger onboarding sau setup
      navigate('/')
    } catch (err) {
      setLoi(err.message || 'Tên không hợp lệ hoặc đã có người dùng')
    } finally {
      setDangLuu(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ho-sau px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐟</div>
          <h1 className="text-2xl font-bold text-white">Đặt tên cho hồ của bạn</h1>
          <p className="text-ho-anh/60 text-sm mt-2">
            Đây là tên người khác thấy khi ghé thăm hồ của bạn.
            <br />Bạn có thể đổi sau nếu muốn.
          </p>
        </div>

        <form onSubmit={xuLyLuu} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="tên_hồ_của_bạn"
              value={ten}
              onChange={e => setTen(e.target.value)}
              required
              minLength={2}
              maxLength={30}
              className="w-full bg-ho-nong border border-ho-anh/20 rounded-xl px-4 py-3 text-white placeholder-ho-anh/30 focus:outline-none focus:border-ho-anh text-center text-lg tracking-wide"
            />
            <p className="text-ho-anh/40 text-xs text-center mt-2">
              Chỉ dùng chữ, số, dấu _ và dấu .
            </p>
          </div>

          {/* Preview URL */}
          {ten.trim() && (
            <div className="bg-ho-nong/50 rounded-xl px-4 py-2 text-center">
              <span className="text-ho-anh/40 text-xs">Hồ của bạn sẽ ở: </span>
              <span className="text-ho-anh text-xs font-mono">
                soundarium.app/u/{ten.trim()}
              </span>
            </div>
          )}

          {loi && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 rounded-xl p-3">
              {loi}
            </div>
          )}

          <button
            type="submit"
            disabled={dangLuu || ten.trim().length < 2}
            className="w-full bg-ho-anh text-ho-sau font-bold py-3 rounded-xl hover:bg-ho-accent transition disabled:opacity-50"
          >
            {dangLuu ? 'Đang lưu...' : 'Bắt đầu →'}
          </button>
        </form>
      </div>
    </div>
  )
}
