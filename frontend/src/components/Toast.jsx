import { useEffect, useState } from 'react'

export default function Toast({ thongBao, loai = 'info', onHet }) {
  const [hienThi, setHienThi] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHienThi(false)
      setTimeout(onHet, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onHet])

  const mauNen = {
    info:    'bg-ho-anh/90',
    loi:     'bg-red-500/90',
    thanhCong: 'bg-green-500/90',
  }[loai] || 'bg-ho-anh/90'

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg transition-all duration-300 ${mauNen} ${hienThi ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {thongBao}
    </div>
  )
}
