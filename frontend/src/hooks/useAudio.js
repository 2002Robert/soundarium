import { useState, useRef, useCallback, useEffect } from 'react'
import { API } from '../lib/api'

const KHOANG_CAP_NHAT_NGHE_MS = 5 * 60 * 1000

export function useAudio({ onNgheCapNhat } = {}) {
  const [dangPhat, setDangPhat] = useState(null)
  const [player, setPlayer]     = useState(null)
  const demGioRef  = useRef(null)
  const caIdRef    = useRef(null)
  const onNgheRef  = useRef(onNgheCapNhat)

  useEffect(() => { onNgheRef.current = onNgheCapNhat }, [onNgheCapNhat])
  useEffect(() => { caIdRef.current = dangPhat }, [dangPhat])

  const batDauDemGio = useCallback((caId) => {
    if (demGioRef.current) clearInterval(demGioRef.current)
    demGioRef.current = setInterval(async () => {
      if (!caIdRef.current) return
      try {
        const res = await API.capNhatNghe(caIdRef.current, 5)
        onNgheRef.current?.(caIdRef.current, res)
      } catch {}
    }, KHOANG_CAP_NHAT_NGHE_MS)
  }, [])

  const dungDemGio = useCallback(() => {
    if (demGioRef.current) { clearInterval(demGioRef.current); demGioRef.current = null }
  }, [])

  const phatCa = useCallback((caId) => {
    setDangPhat(caId)
    batDauDemGio(caId)
  }, [batDauDemGio])

  const dungPhat = useCallback(() => {
    setDangPhat(null)
    dungDemGio()
    player?.pauseVideo?.()
  }, [player, dungDemGio])

  const dangKyPlayer = useCallback((ytPlayer) => setPlayer(ytPlayer), [])

  useEffect(() => () => dungDemGio(), [dungDemGio])

  return { dangPhat, phatCa, dungPhat, dangKyPlayer, player }
}
