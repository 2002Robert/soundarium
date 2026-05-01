import { useState, useEffect } from 'react'
import { API } from '../lib/api'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-ho-nong/60 border border-ho-anh/15 rounded-2xl p-4">
      <div className="text-ho-anh/50 text-xs mb-1">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
      {sub && <div className="text-ho-anh/40 text-xs mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Admin() {
  const [data, setData]     = useState(null)
  const [loi, setLoi]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.layDashboard()
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setLoi(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-ho-sau flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ho-anh/50 border-t-ho-anh rounded-full animate-spin" />
    </div>
  )

  if (loi) return (
    <div className="min-h-screen bg-ho-sau flex items-center justify-center">
      <div className="text-red-400 text-sm">{loi}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ho-sau text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-1">📊 Admin Dashboard</h1>
        <p className="text-ho-anh/40 text-xs mb-6">soundarium.pages.dev</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Tổng người dùng" value={data.tong_nguoi_dung} />
          <StatCard label="Chơi hôm nay (DAU)" value={data.nguoi_choi_hom_nay} sub={`Hôm qua: ${data.nguoi_choi_hom_qua}`} />
          <StatCard label="Tỉ lệ quay lại" value={`${data.ti_le_quay_lai}%`} sub="user hôm qua còn hôm nay" />
          <StatCard label="Thời gian TB" value={`${data.thoi_gian_trung_binh_phut} phút`} sub={`Max: ${data.thoi_gian_lau_nhat_phut} phút`} />
        </div>

        <div className="bg-ho-nong/60 border border-ho-anh/15 rounded-2xl p-4">
          <div className="text-ho-anh/50 text-xs mb-3">Feedback</div>
          <div className="flex gap-6 items-center">
            <div>
              <div className="text-2xl">👍 {data.so_like}</div>
            </div>
            <div>
              <div className="text-2xl">👎 {data.so_dislike}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-white text-2xl font-bold">{data.ti_le_like}%</div>
              <div className="text-ho-anh/40 text-xs">tỉ lệ thích</div>
            </div>
          </div>
          {data.so_like + data.so_dislike > 0 && (
            <div className="mt-3 h-2 rounded-full bg-red-500/30 overflow-hidden">
              <div
                className="h-full bg-green-400/70 rounded-full transition-all"
                style={{ width: `${data.ti_le_like}%` }}
              />
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-ho-anh/40 hover:text-ho-anh text-sm transition">← Về trang chủ</a>
        </div>
      </div>
    </div>
  )
}
