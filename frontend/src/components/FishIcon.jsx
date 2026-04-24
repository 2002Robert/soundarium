// SVG fish icons — mỗi loài có hình dạng và màu riêng biệt
// viewBox 100×70, render tại size × 0.7

function CaVang() {
  return (
    <g>
      <path d="M28,35 Q10,14 6,4 Q18,20 28,35" fill="#FF8F00" />
      <path d="M28,35 Q5,35 2,35 Q10,35 28,35" fill="#FFA000" />
      <path d="M28,35 Q10,56 6,66 Q18,50 28,35" fill="#FF8F00" />
      <ellipse cx="57" cy="35" rx="28" ry="21" fill="#FFB300" />
      <path d="M40,14 Q57,8 74,14 Q65,22 57,22 Q48,22 40,22 Z" fill="#FF8F00" opacity="0.85" />
      <path d="M50,55 Q57,62 64,56" stroke="#FF8F00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="74" cy="30" rx="5" ry="5" fill="white" />
      <circle cx="75.5" cy="30" r="3" fill="#1a1a1a" />
      <circle cx="76.5" cy="28.5" r="1" fill="white" opacity="0.7" />
    </g>
  )
}

function CaNeon() {
  return (
    <g>
      <path d="M20,35 L6,22 L12,35 L6,48 Z" fill="#1565C0" />
      <ellipse cx="53" cy="35" rx="33" ry="13" fill="#1E88E5" />
      <path d="M20,29 Q53,24 84,28" stroke="#00E5FF" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M30,38 Q52,34 72,38" stroke="#F44336" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="53" cy="43" rx="30" ry="4" fill="#E3F2FD" opacity="0.3" />
      <path d="M36,22 Q50,17 64,22" stroke="#0D47A1" strokeWidth="2.5" fill="none" />
      <circle cx="77" cy="31" r="4" fill="white" />
      <circle cx="78" cy="31" r="2.5" fill="#111" />
      <circle cx="79" cy="30" r="0.9" fill="white" opacity="0.7" />
    </g>
  )
}

function CaBetta() {
  return (
    <g>
      {/* Vây đuôi dài thướt tha xuống dưới */}
      <path d="M30,35 Q12,48 6,62 Q20,52 30,38" fill="#CE93D8" opacity="0.75" />
      <path d="M30,35 Q8,38 4,42 Q14,40 30,36" fill="#BA68C8" opacity="0.7" />
      <path d="M30,35 Q10,22 6,10 Q20,20 30,32" fill="#CE93D8" opacity="0.65" />
      {/* Thân */}
      <ellipse cx="55" cy="35" rx="26" ry="16" fill="#8E24AA" />
      {/* Vảy long */}
      <ellipse cx="55" cy="35" rx="22" ry="13" fill="#AB47BC" opacity="0.5" />
      {/* Vây lưng dài */}
      <path d="M38,20 Q52,12 68,18 Q62,26 55,25 Q46,25 38,26 Z" fill="#7B1FA2" opacity="0.85" />
      {/* Vây ngực dài */}
      <path d="M58,44 Q70,56 72,62 Q62,54 54,46" fill="#CE93D8" opacity="0.7" />
      <circle cx="71" cy="30" r="4.5" fill="white" />
      <circle cx="72.5" cy="30" r="3" fill="#1a1a1a" />
      <circle cx="73.5" cy="29" r="1" fill="white" opacity="0.7" />
    </g>
  )
}

function CaHe() {
  return (
    <g>
      {/* Đuôi */}
      <path d="M28,35 L10,20 L16,35 L10,50 Z" fill="#E64A19" />
      {/* Thân oval cam */}
      <ellipse cx="57" cy="35" rx="26" ry="21" fill="#FF5722" />
      {/* Sọc trắng 1 — gần đầu */}
      <ellipse cx="70" cy="35" rx="5" ry="18" fill="white" opacity="0.92" />
      {/* Sọc trắng 2 — giữa thân */}
      <ellipse cx="52" cy="35" rx="4" ry="17" fill="white" opacity="0.85" />
      {/* Phủ cam lên để sọc trắng chỉ nhô ra */}
      <ellipse cx="57" cy="35" rx="20" ry="17" fill="#FF5722" opacity="0.5" />
      {/* Vây lưng */}
      <path d="M42,15 Q57,10 72,15 Q65,22 57,21 Q49,21 42,21 Z" fill="#E64A19" opacity="0.8" />
      {/* Vây bụng */}
      <path d="M48,54 Q57,60 66,55" stroke="#E64A19" strokeWidth="2.5" fill="none" />
      <circle cx="74" cy="29" r="4.5" fill="white" />
      <circle cx="75.5" cy="29" r="3" fill="#1a1a1a" />
      <circle cx="76.5" cy="28" r="1" fill="white" opacity="0.7" />
    </g>
  )
}

function CaTang() {
  return (
    <g>
      {/* Đuôi lưỡi liềm */}
      <path d="M26,35 Q8,18 10,8 Q20,22 26,35" fill="#1976D2" />
      <path d="M26,35 Q8,52 10,62 Q20,48 26,35" fill="#1976D2" />
      {/* Thân tròn dẹt */}
      <ellipse cx="56" cy="35" rx="28" ry="24" fill="#1565C0" />
      {/* Điểm vàng gần đuôi */}
      <ellipse cx="34" cy="35" rx="10" ry="8" fill="#FFD600" opacity="0.9" />
      {/* Đường viền đen đặc trưng */}
      <ellipse cx="56" cy="35" rx="28" ry="24" fill="none" stroke="#0D47A1" strokeWidth="2" />
      {/* Vây lưng */}
      <path d="M38,12 Q56,6 74,12 Q66,20 56,19 Q46,19 38,19 Z" fill="#1976D2" opacity="0.8" />
      {/* Vây hậu môn */}
      <path d="M38,58 Q56,64 68,60 Q60,54 56,51 Z" fill="#1976D2" opacity="0.7" />
      <circle cx="74" cy="28" r="5" fill="white" />
      <circle cx="75.5" cy="28" r="3.2" fill="#111" />
      <circle cx="76.5" cy="27" r="1.1" fill="white" opacity="0.7" />
    </g>
  )
}

function CaKoi() {
  return (
    <g>
      {/* Đuôi xòe */}
      <path d="M18,35 Q4,22 2,14 Q12,24 18,35" fill="#FFCCBC" />
      <path d="M18,35 Q2,35 0,35 Q8,35 18,35" fill="#FFB74D" opacity="0.6" />
      <path d="M18,35 Q4,48 2,56 Q12,46 18,35" fill="#FFCCBC" />
      {/* Thân dài */}
      <ellipse cx="53" cy="35" rx="34" ry="16" fill="#FAFAFA" />
      {/* Đốm cam đặc trưng */}
      <ellipse cx="60" cy="28" rx="12" ry="10" fill="#FF6D00" opacity="0.85" />
      <ellipse cx="38" cy="40" rx="9" ry="7" fill="#FF6D00" opacity="0.8" />
      <ellipse cx="72" cy="40" rx="6" ry="5" fill="#FF3D00" opacity="0.7" />
      {/* Vây lưng */}
      <path d="M32,20 Q53,14 74,20 Q63,28 53,27 Q42,27 32,27 Z" fill="#FFB74D" opacity="0.8" />
      {/* Râu cá koi */}
      <path d="M82,32 Q88,28 86,24" stroke="#BDBDBD" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M82,34 Q90,34 88,30" stroke="#BDBDBD" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="78" cy="29" r="4.5" fill="white" />
      <circle cx="79.5" cy="29" r="3" fill="#222" />
      <circle cx="80.5" cy="28" r="1" fill="white" opacity="0.7" />
    </g>
  )
}

function CaChep() {
  return (
    <g>
      {/* Đuôi chẻ đôi */}
      <path d="M20,35 Q4,20 6,10 Q16,24 20,35" fill="#607D8B" />
      <path d="M20,35 Q4,50 6,60 Q16,46 20,35" fill="#607D8B" />
      {/* Thân to */}
      <ellipse cx="55" cy="35" rx="34" ry="22" fill="#78909C" />
      {/* Vảy — các cung bán nguyệt */}
      {[30,42,54,66].map(x =>
        [24,32,40,48].map(y =>
          <path key={`${x}${y}`} d={`M${x-6},${y} Q${x},${y-5} ${x+6},${y}`}
            stroke="#546E7A" strokeWidth="1" fill="none" opacity="0.6" />
        )
      )}
      {/* Vây lưng lớn */}
      <path d="M28,14 Q45,7 62,12 Q55,21 48,20 Q38,20 28,20 Z" fill="#546E7A" opacity="0.85" />
      {/* Vây ngực */}
      <path d="M60,50 Q68,60 74,58" stroke="#607D8B" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Râu cá chép */}
      <path d="M84,30 Q90,24 88,18" stroke="#90A4AE" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M84,32 Q92,30 90,24" stroke="#90A4AE" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="76" cy="28" r="5" fill="white" />
      <circle cx="77.5" cy="28" r="3.2" fill="#1a1a1a" />
      <circle cx="78.5" cy="27" r="1.1" fill="white" opacity="0.7" />
    </g>
  )
}

function CaDia() {
  return (
    <g>
      {/* Đuôi nhỏ */}
      <path d="M30,35 L16,25 L20,35 L16,45 Z" fill="#00838F" />
      {/* Thân tròn như cái đĩa */}
      <ellipse cx="57" cy="35" rx="26" ry="26" fill="#00838F" />
      {/* Sọc dọc đặc trưng */}
      {[42, 50, 57, 64, 72].map((x, i) => (
        <ellipse key={i} cx={x} cy="35" rx="2.5" ry="24"
          fill="#006064" opacity={0.45 + i * 0.08} />
      ))}
      {/* Ánh sáng */}
      <ellipse cx="57" cy="35" rx="22" ry="22" fill="#4DD0E1" opacity="0.12" />
      {/* Vây lưng ngắn */}
      <path d="M42,10 Q57,6 72,10 Q65,16 57,15 Q49,15 42,15 Z" fill="#005662" opacity="0.8" />
      {/* Vây bụng */}
      <path d="M42,60 Q57,64 72,60 Q65,56 57,55 Q49,55 42,56 Z" fill="#005662" opacity="0.7" />
      <circle cx="73" cy="29" r="5" fill="white" />
      <circle cx="74.5" cy="29" r="3.2" fill="#111" />
      <circle cx="75.5" cy="28" r="1.1" fill="white" opacity="0.7" />
    </g>
  )
}

function renderFish(loaiCa) {
  switch (loaiCa) {
    case 'ca_neon':      return <CaNeon />
    case 'ca_betta':     return <CaBetta />
    case 'ca_clownfish': return <CaHe />
    case 'ca_tang':      return <CaTang />
    case 'ca_koi':       return <CaKoi />
    case 'ca_chep':      return <CaChep />
    case 'ca_dia':       return <CaDia />
    default:             return <CaVang />
  }
}

export default function FishIcon({ loaiCa, size = 72, fill = false }) {
  const fishEl = renderFish(loaiCa)

  if (fill) {
    return (
      <svg
        viewBox="0 0 100 70"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {fishEl}
      </svg>
    )
  }

  const h = Math.round(size * 0.7)
  return (
    <svg
      width={size} height={h}
      viewBox="0 0 100 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      {fishEl}
    </svg>
  )
}
