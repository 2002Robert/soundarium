import { useState, useRef, useCallback, useEffect } from 'react'
import { API } from '../lib/api'

const KHOANG_CAP_NHAT_NGHE_MS = 5 * 60 * 1000 // 5 phút

export function useAudio() {
  const [dangPhat, setDangPhat] = useState(null)    // ca_id đang phát
  const [player, setPlayer] = useState(null)         // YouTube player object
  const demGioRef = useRef(null)                     // setInterval đếm giờ nghe
  const caIdRef = useRef(null)

  // Đồng bộ ref với state để interval closure luôn có giá trị mới
  useEffect(() => {
    caIdRef.current = dangPhat
  }, [dangPhat])

  const batDauDemGio = useCallback((caId) => {
    if (demGioRef.current) clearInterval(demGioRef.current)

    demGioRef.current = setInterval(async () => {
      if (!caIdRef.current) return
      try {
        await API.capNhatNghe(caIdRef.current, 5)
      } catch {
        // Lỗi mạng không dừng trải nghiệm nghe — im lặng bỏ qua
      }
    }, KHOANG_CAP_NHAT_NGHE_MS)
  }, [])

  const dungDemGio = useCallback(() => {
    if (demGioRef.current) {
      clearInterval(demGioRef.current)
      demGioRef.current = null
    }
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

  const dangKyPlayer = useCallback((ytPlayer) => {
    setPlayer(ytPlayer)
  }, [])

  // Dọn dẹp khi unmount
  useEffect(() => {
    return () => dungDemGio()
  }, [dungDemGio])

  return { dangPhat, phatCa, dungPhat, dangKyPlayer, player }
}
