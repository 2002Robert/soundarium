import { useState, useCallback } from 'react'
import { API } from '../lib/api'

export function useCoins() {
  const [coins, setCoins] = useState(0)
  const [tocDoMoiGio, setTocDoMoiGio] = useState(0)

  const thuHoach = useCallback(async () => {
    try {
      const data = await API.thuHoachCoins()
      setCoins(data.coins_hien_tai)
      setTocDoMoiGio(data.toc_do_moi_gio)
      return data.coins_nhan_duoc
    } catch {
      return 0
    }
  }, [])

  const truCoins = useCallback((so) => {
    setCoins(prev => Math.max(0, prev - so))
  }, [])

  return { coins, tocDoMoiGio, thuHoach, truCoins, setCoins }
}
