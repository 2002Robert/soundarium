import { useEffect, useRef } from 'react'

let apiDaLoad = false
function loadYouTubeAPI() {
  if (apiDaLoad || window.YT) return
  apiDaLoad = true
  const script = document.createElement('script')
  script.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(script)
}

export default function YouTubePlayer({ videoId, dangPhat, onReady, onEnded }) {
  const iframeRef    = useRef(null)
  const playerRef    = useRef(null)
  const onEndedRef   = useRef(onEnded)
  const dangPhatRef  = useRef(dangPhat)
  onEndedRef.current  = onEnded
  dangPhatRef.current = dangPhat

  useEffect(() => {
    loadYouTubeAPI()
  }, [])

  // Tạo player một lần duy nhất khi API sẵn sàng
  useEffect(() => {
    function taoPlayer() {
      if (playerRef.current) return
      playerRef.current = new window.YT.Player(iframeRef.current, {
        height: '1',
        width:  '1',
        videoId: videoId || '',
        playerVars: {
          autoplay:    0,
          controls:    0,
          rel:         0,
          playsinline: 1,
        },
        events: {
          onReady: (e) => onReady?.(e.target),
          // Dùng ref để tránh stale closure — callback luôn là phiên bản mới nhất
          onStateChange: (e) => {
            if (e.data === 0) onEndedRef.current?.()
            // YouTube tự pause khi out app / tắt màn hình (state=2)
            // Nếu ta đang muốn phát → resume lại ngay
            if (e.data === 2 && dangPhatRef.current) {
              setTimeout(() => {
                if (dangPhatRef.current) playerRef.current?.playVideo?.()
              }, 500)
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      taoPlayer()
    } else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        taoPlayer()
      }
    }
  }, []) // Chỉ chạy một lần — player tồn tại suốt vòng đời app

  // Đổi bài khi videoId thay đổi
  useEffect(() => {
    if (!playerRef.current?.loadVideoById) return
    if (videoId) {
      playerRef.current.loadVideoById(videoId)
    } else {
      playerRef.current.stopVideo?.()
    }
  }, [videoId])

  // Play/pause theo state
  useEffect(() => {
    if (!playerRef.current?.playVideo) return
    if (dangPhat && videoId) playerRef.current.playVideo?.()
    else                     playerRef.current.pauseVideo?.()
  }, [dangPhat, videoId])

  /*
   * Wrapper có kích thước 0 và overflow:hidden để nhốt iframe.
   * opacity:0 + pointer-events:none đảm bảo không thể thấy hay click.
   * KHÔNG dùng display:none — YouTube API cần element có trong DOM.
   */
  return (
    <div
      style={{
        position:      'fixed',
        width:         0,
        height:        0,
        overflow:      'hidden',
        opacity:       0,
        pointerEvents: 'none',
        top:           0,
        left:          0,
        zIndex:        -9999,
      }}
    >
      <div ref={iframeRef} />
    </div>
  )
}
