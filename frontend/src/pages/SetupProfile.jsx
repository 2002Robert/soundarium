import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../lib/api'

// Quy tắc username — phải khớp với backend routers/profile.py CapNhatTen
const USERNAME_MIN = 3
const USERNAME_MAX = 20
const USERNAME_RE  = /^[a-zA-Z0-9_]+$/

function validate(ten) {
  if (ten.length < USERNAME_MIN) return `Tối thiểu ${USERNAME_MIN} ký tự`
  if (ten.length > USERNAME_MAX) return `Tối đa ${USERNAME_MAX} ký tự`
  if (!USERNAME_RE.test(ten))    return 'Chỉ dùng chữ cái (a-z A-Z), số (0-9) và dấu gạch dưới _'
  return null
}

export default function SetupProfile() {
  const [ten, setTen]         = useState('')
  const [loi, setLoi]         = useState('')
  const [dangLuu, setDangLuu] = useState(false)
  const navigate = useNavigate()

  function thayDoi(e) {
    const val = e.target.value
    setTen(val)
    // Validate real-time để user biết ngay
    const err = validate(val.trim())
    setLoi(val.trim() ? (err || '') : '')
  }

  async function xuLyLuu(e) {
    e.preventDefault()
    const trimmed = ten.trim()
    const err = validate(trimmed)
    if (err) { setLoi(err); return }

    setDangLuu(true)
    setLoi('')
    try {
      await API.capNhatTenHienThi(trimmed)
      // Xóa snd_onboarded để Home.jsx hiện onboarding sau khi setup xong
      localStorage.removeItem('snd_onboarded')
      navigate('/')
    } catch (err) {
      setLoi(err.message || 'Tên không hợp lệ hoặc đã có người dùng')
    } finally {
      setDangLuu(false)
    }
  }

  const trimmed   = ten.trim()
  const coLoi     = !!loi
  const hopLe     = trimmed.length >= USERNAME_MIN && !validate(trimmed)

  return (
    <div className="min-h-screen flex items-center justify-center bg-ho-sau px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐟</div>
          <h1 className="text-2xl font-bold text-white">Đặt tên cho hồ của bạn</h1>
          <p className="text-ho-anh/60 text-sm mt-2">
            Đây là tên người khác thấy khi ghé thăm hồ của bạn.
          </p>
        </div>

        <form onSubmit={xuLyLuu} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="vi_du_ten_ho"
              value={ten}
              onChange={thayDoi}
              required
              maxLength={USERNAME_MAX}
              className={`w-full bg-ho-nong border rounded-xl px-4 py-3 text-white placeholder-ho-anh/30 focus:outline-none text-center text-lg tracking-wide transition ${
                coLoi ? 'border-red-400/60 focus:border-red-400' : 'border-ho-anh/20 focus:border-ho-anh'
              }`}
            />

            {/* Quy tắc */}
            <div className="mt-2 space-y-0.5 text-center">
              <p className="text-ho-anh/40 text-xs">
                {USERNAME_MIN}–{USERNAME_MAX} ký tự · chữ cái, số, dấu _ (không dấu cách, không dấu chấm)
              </p>
              <p className="text-ho-anh/30 text-xs">
                Chú ý: chỉ được đổi tên <strong className="text-ho-anh/50">1 lần duy nhất</strong>
              </p>
            </div>
          </div>

          {/* Preview URL */}
          {trimmed && hopLe && (
            <div className="bg-ho-nong/50 rounded-xl px-4 py-2 text-center">
              <span className="text-ho-anh/40 text-xs">Hồ của bạn: </span>
              <span className="text-ho-anh text-xs font-mono">
                soundarium.pages.dev/u/{trimmed}
              </span>
            </div>
          )}

          {/* Lỗi */}
          {loi && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 rounded-xl p-3">
              {loi}
            </div>
          )}

          <button
            type="submit"
            disabled={dangLuu || !hopLe}
            className="w-full bg-ho-anh text-ho-sau font-bold py-3 rounded-xl hover:bg-ho-accent transition disabled:opacity-40"
          >
            {dangLuu ? 'Đang lưu...' : 'Bắt đầu →'}
          </button>
        </form>
      </div>
    </div>
  )
}
