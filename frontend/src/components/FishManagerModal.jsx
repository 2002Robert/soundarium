import { useState } from 'react'
import { API } from '../lib/api'
import FishIcon from './FishIcon'
import { LOAI_CA } from '../constants/fishTypes'

export default function FishManagerModal({ danhSachCa, onXoa, onDong }) {
  const [dangXoa, setDangXoa] = useState(null)    // caId đang hỏi xác nhận
  const [dangGui, setDangGui] = useState(false)

  async function xoaCa(ca) {
    setDangGui(true)
    try {
      await API.xoaCa(ca.id)
      onXoa?.(ca.id)
      setDangXoa(null)
    } catch {
      // silent — fish list will still show
    } finally {
      setDangGui(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-2 sm:px-4"
      onClick={onDong}
    >
      <div
        className="bg-ho-sau border border-ho-anh/15 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ backdropFilter: 'blur(12px)' }}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ho-anh/10 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold">Danh sách cá</h2>
            <p className="text-ho-anh/45 text-xs mt-0.5">{danhSachCa.length} con trong hồ</p>
          </div>
          <button
            onClick={onDong}
            className="text-ho-anh/40 hover:text-ho-anh text-xl leading-none transition"
          >×</button>
        </div>

        {/* Danh sách */}
        <div
          className="overflow-y-auto flex-1 px-3 py-3 space-y-1.5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(96,165,250,0.25) transparent' }}
        >
          {danhSachCa.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-ho-anh/30">
              <div className="text-4xl mb-3">🐠</div>
              <p className="text-sm">Hồ đang trống</p>
            </div>
          ) : (
            danhSachCa.map(ca => {
              const tenHienThi = ca.nickname || ca.ten_bai || 'Không tên'
              const tenLoai    = LOAI_CA[ca.loai_ca]?.ten || ca.loai_ca || 'Cá'
              const dangHoiXoa = dangXoa === ca.id

              return (
                <div
                  key={ca.id}
                  className="rounded-xl border transition-all duration-200"
                  style={{
                    background:   dangHoiXoa ? 'rgba(248,113,113,0.07)' : 'rgba(255,255,255,0.03)',
                    borderColor:  dangHoiXoa ? 'rgba(248,113,113,0.35)' : 'rgba(96,165,250,0.1)',
                  }}
                >
                  {/* Row chính */}
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    {/* Icon cá */}
                    <div className="shrink-0">
                      <FishIcon loaiCa={ca.loai_ca || 'ca_vang'} size={40} />
                    </div>

                    {/* Tên + nhạc */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{tenHienThi}</div>
                      <div className="text-ho-anh/45 text-xs truncate">🎵 {ca.ten_bai}</div>
                      <div className="text-ho-anh/30 text-[11px]">{tenLoai} · Lv.{ca.level}</div>
                    </div>

                    {/* Nút xóa */}
                    {!dangHoiXoa ? (
                      <button
                        onClick={() => setDangXoa(ca.id)}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-red-400/15 hover:border-red-400/45 text-red-400/40 hover:text-red-400 transition text-sm"
                        title="Xóa cá"
                      >
                        🗑
                      </button>
                    ) : (
                      <button
                        onClick={() => setDangXoa(null)}
                        className="shrink-0 text-ho-anh/40 hover:text-ho-anh text-xs transition px-2"
                      >
                        Huỷ
                      </button>
                    )}
                  </div>

                  {/* Xác nhận xóa — xuất hiện inline */}
                  {dangHoiXoa && (
                    <div className="px-3 pb-3 flex items-center gap-2">
                      <p className="text-red-300/80 text-xs flex-1">
                        Xóa "{tenHienThi}" khỏi hồ?
                      </p>
                      <button
                        onClick={() => xoaCa(ca)}
                        disabled={dangGui}
                        className="bg-red-500 hover:bg-red-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {dangGui ? '...' : 'Xóa'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
