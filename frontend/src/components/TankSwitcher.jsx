import { useState } from 'react'

const MAX_TANKS = 3

export default function TankSwitcher({ danhSachTank, selectedId, onChon, onTaoMoi, dangTao }) {
  const [hienMenu, setHienMenu] = useState(false)
  const tankHienTai = danhSachTank.find(t => t.id === selectedId)

  if (danhSachTank.length <= 1 && danhSachTank.length < MAX_TANKS) {
    return (
      <button
        onClick={onTaoMoi}
        disabled={dangTao}
        title="Tạo hồ mới"
        className="w-9 h-9 flex items-center justify-center bg-ho-nong/70 hover:bg-ho-nong border border-ho-anh/20 hover:border-ho-anh/40 rounded-xl text-ho-anh/70 hover:text-ho-anh transition text-base disabled:opacity-40"
      >
        {dangTao ? '…' : '＋'}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setHienMenu(v => !v)}
        className="flex items-center gap-1.5 px-3 h-9 bg-ho-nong/70 hover:bg-ho-nong border border-ho-anh/20 hover:border-ho-anh/40 rounded-xl text-ho-anh/70 hover:text-ho-anh transition text-sm"
      >
        🏊 {tankHienTai?.ten || 'Hồ'}
        <span className="text-xs opacity-50">{hienMenu ? '▲' : '▼'}</span>
      </button>

      {hienMenu && (
        <div
          className="absolute top-11 left-0 bg-ho-sau border border-ho-anh/20 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[120px]"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {danhSachTank.map(tank => (
            <button
              key={tank.id}
              onClick={() => { onChon(tank.id); setHienMenu(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition ${
                tank.id === selectedId
                  ? 'text-white bg-ho-anh/15'
                  : 'text-ho-anh/60 hover:text-white hover:bg-ho-anh/10'
              }`}
            >
              {tank.id === selectedId ? '✓ ' : ''}{tank.ten}
            </button>
          ))}
          {danhSachTank.length < MAX_TANKS && (
            <button
              onClick={() => { onTaoMoi(); setHienMenu(false) }}
              disabled={dangTao}
              className="w-full text-left px-4 py-2.5 text-sm text-ho-anh/40 hover:text-ho-anh/70 border-t border-ho-anh/10 transition disabled:opacity-30"
            >
              + Tạo hồ mới
            </button>
          )}
        </div>
      )}
    </div>
  )
}
