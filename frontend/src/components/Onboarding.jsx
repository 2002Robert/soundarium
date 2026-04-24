import { useState } from 'react'

const SLIDES = [
  {
    icon: '🎵',
    tieu_de: 'Paste link YouTube để tạo cá',
    mo_ta: 'Mỗi bài nhạc trở thành một con cá bơi trong hồ của bạn.',
  },
  {
    icon: '🐟',
    tieu_de: 'Click cá để nghe nhạc',
    mo_ta: 'Cá nào đang phát nhạc sẽ có nốt nhạc bay ra. Nhạc chạy ngầm khi bạn chuyển tab.',
  },
  {
    icon: '✨',
    tieu_de: 'Cá lớn theo thời gian nghe',
    mo_ta: 'Nghe nhiều → cá lên level → cá to hơn → nhả nhiều coins hơn. Đừng bỏ quên cá nhé!',
  },
]

export default function Onboarding({ onXong }) {
  const [slide, setSlide] = useState(0)

  function tiepTheo() {
    if (slide < SLIDES.length - 1) setSlide(slide + 1)
    else onXong()
  }

  const s = SLIDES[slide]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ho-sau/95 backdrop-blur-sm">
      <div className="text-center max-w-xs px-6">
        <div className="text-7xl mb-6">{s.icon}</div>
        <h2 className="text-xl font-bold text-white mb-3">{s.tieu_de}</h2>
        <p className="text-ho-anh/80 mb-8">{s.mo_ta}</p>

        {/* Chấm trang */}
        <div className="flex justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-ho-anh w-5' : 'bg-ho-anh/30'}`}
            />
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onXong}
            className="text-ho-anh/50 hover:text-ho-anh text-sm transition"
          >
            Bỏ qua
          </button>
          <button
            onClick={tiepTheo}
            className="bg-ho-anh text-ho-sau font-semibold px-6 py-2 rounded-full hover:bg-ho-accent transition"
          >
            {slide < SLIDES.length - 1 ? 'Tiếp' : 'Bắt đầu'}
          </button>
        </div>
      </div>
    </div>
  )
}
