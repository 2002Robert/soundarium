import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { API } from '../lib/api'
import Toast from '../components/Toast'

const TABS = ['Cá', 'Trang trí', 'Nền hồ']
const LOAI_THEO_TAB = ['fish', 'decoration', 'background']

export default function Shop() {
  const [tab, setTab]         = useState(0)
  const [items, setItems]     = useState([])
  const [coins, setCoins]     = useState(0)
  const [dangMua, setDangMua] = useState(null)
  const [toast, setToast]     = useState(null)

  useEffect(() => {
    layItems()
    API.xemSoDuCoins().then(d => setCoins(d.coins)).catch(() => {})
  }, [])

  async function layItems() {
    const { data } = await supabase
      .from('shop_items')
      .select('*')
      .eq('la_active', true)
      .order('gia_coins')
    setItems(data || [])
  }

  async function mua(item) {
    setDangMua(item.id)
    try {
      const ket_qua = await API.muaItem(item.id)
      setCoins(ket_qua.coins_con_lai)
      setToast({ thongBao: `Đã mua ${item.ten}!`, loai: 'thanhCong' })
      // TODO STRIPE: Khi cần thanh toán thật, thay thế API.muaItem bằng Stripe Checkout
    } catch (err) {
      setToast({ thongBao: err.message, loai: 'loi' })
    } finally {
      setDangMua(null)
    }
  }

  const itemsHienThi = items.filter(i => i.loai === LOAI_THEO_TAB[tab])

  const MAUARITY = { common: 'text-white', uncommon: 'text-green-400', rare: 'text-purple-400' }

  return (
    <div className="min-h-screen bg-ho-sau text-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <a href="/" className="text-ho-anh/60 hover:text-ho-anh text-sm transition">← Hồ của tôi</a>
            <h1 className="text-xl font-bold">Cửa hàng</h1>
          </div>
          <span className="text-ho-anh font-semibold">🪙 {coins.toLocaleString()}</span>
        </div>

        {/* Tabs */}
        <div className="flex bg-ho-nong rounded-xl p-1 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex-1 py-2 text-sm rounded-lg transition ${tab === i ? 'bg-ho-anh text-ho-sau font-semibold' : 'text-ho-anh/60 hover:text-ho-anh'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Danh sách item */}
        <div className="space-y-3">
          {itemsHienThi.map(item => {
            const duTien = coins >= (item.gia_coins || 0)
            return (
              <div
                key={item.id}
                className="flex items-center justify-between bg-ho-nong border border-ho-anh/10 rounded-xl px-4 py-3"
              >
                <div>
                  <span className={`font-medium ${MAUARITY[item.rarity] || 'text-white'}`}>
                    {item.ten}
                  </span>
                  <span className="text-xs text-ho-anh/40 ml-2">{item.rarity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ho-anh text-sm">
                    {item.gia_coins ? `🪙 ${item.gia_coins}` : 'Miễn phí'}
                  </span>
                  <button
                    onClick={() => mua(item)}
                    disabled={!duTien || dangMua === item.id}
                    title={!duTien ? 'Chưa đủ coins' : ''}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      duTien
                        ? 'bg-ho-anh text-ho-sau hover:bg-ho-accent'
                        : 'bg-ho-anh/20 text-ho-anh/30 cursor-not-allowed'
                    }`}
                  >
                    {dangMua === item.id ? '...' : 'Mua'}
                  </button>
                </div>
              </div>
            )
          })}

          {itemsHienThi.length === 0 && (
            <div className="text-center text-ho-anh/40 py-12">Chưa có item nào</div>
          )}
        </div>
      </div>

      {toast && <Toast thongBao={toast.thongBao} loai={toast.loai} onHet={() => setToast(null)} />}
    </div>
  )
}
