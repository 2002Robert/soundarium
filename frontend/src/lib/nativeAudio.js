/**
 * Bridge tới native Android AudioService plugin.
 * Tự động detect xem đang chạy trong Capacitor hay web browser.
 * Nếu là web → no-op (YouTube IFrame tự xử lý).
 * Nếu là Capacitor Android → start/stop ForegroundService để giữ audio chạy nền.
 */

function isCapacitor() {
  return typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.()
}

export async function startAudioService(songName = 'Soundarium') {
  if (!isCapacitor()) return
  try {
    await window.Capacitor.Plugins.AudioService?.start({ songName })
  } catch (e) {
    console.log('[native] AudioService.start error:', e)
  }
}

export async function stopAudioService() {
  if (!isCapacitor()) return
  try {
    await window.Capacitor.Plugins.AudioService?.stop()
  } catch (e) {
    console.log('[native] AudioService.stop error:', e)
  }
}

export function isNativeApp() {
  return isCapacitor()
}
