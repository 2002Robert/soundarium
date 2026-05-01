import { useState, useEffect } from 'react'

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const IS_STANDALONE = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true

export default function PWAInstallBanner() {
  const [prompt, setPrompt]     = useState(null)
  const [hien, setHien]         = useState(false)
  const [isIOS, setIsIOS]       = useState(false)

  useEffect(() => {
    if (!IS_MOBILE || IS_STANDALONE) return
    if (localStorage.getItem('snd_pwa_dismissed')) return

    // Android: bắt beforeinstallprompt
    function onPrompt(e) {
      e.preventDefault()
      setPrompt(e)
      // Chờ 20 giây sau khi phát nhạc rồi mới hiện
      setTimeout(() => setHien(true), 20_000)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // iOS: không có beforeinstallprompt, hiện hướng dẫn thủ công
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (ios) {
      setIsIOS(true)
      setTimeout(() => setHien(true), 20_000)
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  function dismiss() {
    setHien(false)
    localStorage.setItem('snd_pwa_dismissed', '1')
  }

  async function caiNgay() {
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') localStorage.setItem('snd_pwa_dismissed', '1')
    }
    setHien(false)
  }

  if (!hien) return null

  return (
    <div className="fixed bottom-32 left-4 right-4 z-[200] flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto bg-ho-sau/95 border border-ho-anh/25 rounded-2xl px-4 py-3 shadow-2xl max-w-sm w-full"
        style={{ backdropFilter: 'blur(14px)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">🐟</span>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold">Nghe nhạc khi tắt màn hình</div>
            <div className="text-ho-anh/50 text-xs mt-0.5">
              {isIOS
                ? 'Nhấn chia sẻ → "Thêm vào màn hình chính"'
                : 'Cài Soundarium để nghe nhạc khi out app'}
            </div>
          </div>
          <button onClick={dismiss} className="text-ho-anh/30 hover:text-ho-anh/60 transition shrink-0 text-lg">✕</button>
        </div>
        {!isIOS && (
          <button
            onClick={caiNgay}
            className="mt-2.5 w-full bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold text-sm py-2 rounded-xl transition"
          >
            Cài ngay
          </button>
        )}
      </div>
    </div>
  )
}
