import { useState, useCallback } from 'react'
import { API } from '../lib/api'

export function useCoins() {
  const [coins, setCoins] = useState(0)
  const [tocDoMoiGio, setTocDoMoiGio] = useState(0)

  const thuHoach = useCallback(async () => {
    try {
      const data = await API.xemSoDuCoins()
      setCoins(data.coins)
      return 0
    } catch {
      return 0
    }
  }, [])

  const truCoins = useCallback((so) => {
    setCoins(prev => Math.max(0, prev - so))
  }, [])

  return { coins, tocDoMoiGio, thuHoach, truCoins, setCoins }
}
