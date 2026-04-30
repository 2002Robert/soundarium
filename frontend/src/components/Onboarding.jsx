import { useState } from 'react'

// ── Slide 1: fish + music note ────────────────────────────────────
function IconCaMusic() {
  return (
    <svg width="140" height="88" viewBox="0 0 140 88" fill="none">
      {/* Fish tail */}
      <path d="M 22 45 L 5 32 L 10 45 L 5 58 Z" fill="rgba(255,155,40,0.9)"/>
      {/* Fish body */}
      <ellipse cx="46" cy="45" rx="28" ry="18" fill="rgba(255,155,40,0.92)"/>
      {/* Dorsal fin */}
      <path d="M 28 27 Q 44 17 60 27 Q 44 28 28 27 Z" fill="rgba(255,115,20,0.65)"/>
      {/* Eye */}
      <circle cx="63" cy="40" r="4.5" fill="rgba(255,255,255,0.92)"/>
      <circle cx="64" cy="40" r="2.5" fill="#111"/>
      <circle cx="65" cy="38.5" r="0.9" fill="rgba(255,255,255,0.85)"/>
      {/* Bubbles */}
      <circle cx="78" cy="30" r="2.2" stroke="rgba(148,210,255,0.5)" strokeWidth="1.2" fill="none"/>
      <circle cx="86" cy="22" r="1.5" stroke="rgba(148,210,255,0.38)" strokeWidth="0.9" fill="none"/>
      {/* Music note stem */}
      <line x1="108" y1="18" x2="108" y2="54" stroke="rgba(96,165,250,0.92)" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Flag */}
      <path d="M 108 18 Q 130 26 122 44" stroke="rgba(96,165,250,0.88)" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <ellipse cx="104" cy="56" rx="8" ry="5.5" transform="rotate(-18 104 56)" fill="rgba(96,165,250,0.92)"/>
      {/* Water glow */}
      <ellipse cx="70" cy="82" rx="48" ry="5.5" fill="rgba(96,165,250,0.06)"/>
    </svg>
  )
}

// ── Slide 2: food pellets falling + coin ─────────────────────────
function IconThucAnCoin() {
  return (
    <svg width="140" height="88" viewBox="0 0 140 88" fill="none">
      {/* Finger dropping pellets */}
      <path d="M 40 2 L 40 14" stroke="rgba(210,185,160,0.45)" strokeWidth="7" strokeLinecap="round"/>
      {/* Pellets at different heights */}
      <circle cx="40" cy="24" r="5.5" fill="rgba(195,130,65,0.92)"/>
      <ellipse cx="34" cy="40" rx="5" ry="4.5" fill="rgba(195,130,65,0.82)"/>
      <ellipse cx="48" cy="44" rx="4.5" ry="4" fill="rgba(195,130,65,0.75)"/>
      <circle cx="36" cy="60" r="4" fill="rgba(195,130,65,0.6)"/>
      <circle cx="46" cy="68" r="3" fill="rgba(195,130,65,0.42)"/>
      {/* Motion lines */}
      <line x1="40" y1="30" x2="40" y2="35" stroke="rgba(195,130,65,0.28)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="34" y1="46" x2="34" y2="50" stroke="rgba(195,130,65,0.22)" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Coin glow */}
      <circle cx="104" cy="50" r="30" fill="rgba(230,185,20,0.07)"/>
      {/* Coin outer */}
      <circle cx="104" cy="50" r="22" fill="rgba(225,180,20,0.9)" stroke="rgba(175,130,10,0.7)" strokeWidth="2.5"/>
      {/* Coin inner rings */}
      <circle cx="104" cy="50" r="17" fill="none" stroke="rgba(255,220,80,0.42)" strokeWidth="1.8"/>
      <circle cx="104" cy="50" r="10" fill="rgba(205,155,10,0.38)"/>
      {/* Sparkles */}
      <line x1="88" y1="32" x2="85" y2="28" stroke="rgba(255,215,80,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="120" y1="32" x2="123" y2="28" stroke="rgba(255,215,80,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="81" y1="50" x2="76" y2="50" stroke="rgba(255,215,80,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="127" y1="50" x2="132" y2="50" stroke="rgba(255,215,80,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

// ── Slide 3: two tanks connected by arrow ─────────────────────────
function IconHaiHo() {
  return (
    <svg width="160" height="88" viewBox="0 0 160 88" fill="none">
      {/* ── Left tank ── */}
      <rect x="4" y="14" width="56" height="64" rx="5" fill="rgba(10,22,50,0.72)" stroke="rgba(96,165,250,0.32)" strokeWidth="1.5"/>
      {/* Water surface shimmer */}
      <path d="M 6 26 Q 18 22 32 26 Q 46 22 58 26" stroke="rgba(96,165,250,0.2)" strokeWidth="1" fill="none"/>
      {/* Left fish (goldfish) */}
      <path d="M 14 52 L 7 46 L 10 52 L 7 58 Z" fill="rgba(255,155,40,0.88)"/>
      <ellipse cx="25" cy="52" rx="14" ry="9" fill="rgba(255,155,40,0.88)"/>
      <circle cx="35" cy="49" r="2.5" fill="rgba(255,255,255,0.88)"/>
      <circle cx="36" cy="49" r="1.3" fill="#111"/>
      {/* Left note */}
      <line x1="46" y1="24" x2="46" y2="38" stroke="rgba(96,165,250,0.82)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 46 24 Q 56 29 52 38" stroke="rgba(96,165,250,0.75)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <ellipse cx="43.5" cy="40" rx="4" ry="2.8" transform="rotate(-15 43.5 40)" fill="rgba(96,165,250,0.82)"/>
      {/* Left bubbles */}
      <circle cx="18" cy="36" r="1.5" stroke="rgba(148,210,255,0.38)" strokeWidth="0.8" fill="none"/>
      <circle cx="28" cy="28" r="1.1" stroke="rgba(148,210,255,0.28)" strokeWidth="0.8" fill="none"/>

      {/* ── Arrow ── */}
      <path d="M 62 46 Q 80 38 98 46" stroke="rgba(96,165,250,0.52)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4 3"/>
      <polygon points="98,41 107,46 98,51" fill="rgba(96,165,250,0.65)"/>

      {/* ── Right tank ── */}
      <rect x="100" y="14" width="56" height="64" rx="5" fill="rgba(10,22,50,0.72)" stroke="rgba(96,165,250,0.32)" strokeWidth="1.5"/>
      {/* Water surface shimmer */}
      <path d="M 102 26 Q 114 22 128 26 Q 142 22 154 26" stroke="rgba(96,165,250,0.2)" strokeWidth="1" fill="none"/>
      {/* Right fish (neon blue) */}
      <path d="M 112 52 L 105 46 L 108 52 L 105 58 Z" fill="rgba(50,185,225,0.88)"/>
      <ellipse cx="123" cy="52" rx="14" ry="9" fill="rgba(50,185,225,0.88)"/>
      <path d="M 116 49 Q 123 47 132 49" stroke="rgba(20,120,185,0.6)" strokeWidth="1.5" fill="none"/>
      <circle cx="133" cy="49" r="2.5" fill="rgba(255,255,255,0.88)"/>
      <circle cx="134" cy="49" r="1.3" fill="#111"/>
      {/* Right note */}
      <line x1="144" y1="24" x2="144" y2="38" stroke="rgba(96,165,250,0.82)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M 144 24 Q 154 29 150 38" stroke="rgba(96,165,250,0.75)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <ellipse cx="141.5" cy="40" rx="4" ry="2.8" transform="rotate(-15 141.5 40)" fill="rgba(96,165,250,0.82)"/>
    </svg>
  )
}

const SLIDES = [
  {
    Icon: IconCaMusic,
    tieu_de: 'Mỗi con cá là một bài nhạc',
    mo_ta: 'Vào Shop → chọn loài cá → paste link YouTube.\nCon cá sẽ bơi trong hồ và mang theo bài nhạc đó.',
  },
  {
    Icon: IconThucAnCoin,
    tieu_de: 'Cho cá ăn để kiếm coin',
    mo_ta: 'Nhấn nút 🍖 để thả thức ăn. Cá đói sẽ bơi đến ăn,\nno 45 phút và nhả coin mỗi 5 phút.\nDùng coin mua thêm cá và trang trí hồ.',
  },
  {
    Icon: IconHaiHo,
    tieu_de: 'Khoe hồ, khám phá nhạc mới',
    mo_ta: 'Chia sẻ link hồ cho bạn bè.\nGhé hồ người khác để nghe nhạc của họ\nvà copy bài nhạc bạn thích về hồ mình.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ho-sau/95 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div
          className="rounded-3xl border border-ho-anh/12 px-8 py-8 text-center"
          style={{ background: 'rgba(8,16,36,0.82)', backdropFilter: 'blur(16px)' }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <s.Icon />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-white mb-3 leading-snug">
            {s.tieu_de}
          </h2>

          {/* Description */}
          <p className="text-ho-anh/70 text-sm leading-relaxed whitespace-pre-line mb-7">
            {s.mo_ta}
          </p>

          {/* Slide dots */}
          <div className="flex justify-center gap-1.5 mb-7">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width:      i === slide ? 24 : 6,
                  background: i === slide ? 'rgba(96,165,250,0.9)' : 'rgba(96,165,250,0.22)',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onXong}
              className="text-ho-anh/40 hover:text-ho-anh/65 text-sm transition px-2 py-2"
            >
              Bỏ qua
            </button>
            <button
              onClick={tiepTheo}
              className="flex-1 bg-ho-anh hover:bg-ho-accent text-ho-sau font-semibold py-2.5 rounded-full transition text-sm"
            >
              {slide < SLIDES.length - 1 ? 'Tiếp →' : 'Bắt đầu 🐟'}
            </button>
          </div>
        </div>

        {/* Slide counter */}
        <p className="text-center text-ho-anh/25 text-xs mt-3">
          {slide + 1} / {SLIDES.length}
        </p>
      </div>
    </div>
  )
}
