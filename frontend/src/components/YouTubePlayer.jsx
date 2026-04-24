import { useEffect, useRef } from 'react'

// YouTube IFrame API load một lần duy nhất cho cả app
let apiDaLoad = false
function loadYouTubeAPI() {
  if (apiDaLoad || window.YT) return
  apiDaLoad = true
  const script = document.createElement('script')
  script.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(script)
}

export default function YouTubePlayer({ videoId, dangPhat, onReady, onEnded }) {
  const containerRef = useRef(null)
  const playerRef    = useRef(null)

  useEffect(() => {
    loadYouTubeAPI()
  }, [])

  useEffect(() => {
    if (!videoId) return

    function taoPlayer() {
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId)
        return
      }
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '0',
        width:  '0',
        videoId,
        playerVars: {
          autoplay:       1,
          controls:       0,
          rel:            0,
          playsinline:    1,  // iOS không mở fullscreen
        },
        events: {
          onReady: (e) => {
            e.target.playVideo()
            onReady?.(e.target)
          },
          onStateChange: (e) => {
            // YT.PlayerState.ENDED = 0
            if (e.data === 0) onEnded?.()
          },
        },
      })
    }

    if (window.YT?.Player) {
      taoPlayer()
    } else {
      // API chưa load xong — đợi callback toàn cục
      const prevCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.()
        taoPlayer()
      }
    }

    return () => {
      playerRef.current?.stopVideo?.()
    }
  }, [videoId])

  useEffect(() => {
    if (!playerRef.current) return
    if (dangPhat) playerRef.current.playVideo?.()
    else          playerRef.current.pauseVideo?.()
  }, [dangPhat])

  // Player ẩn hoàn toàn — chỉ âm thanh
  return <div ref={containerRef} style={{ display: 'none' }} />
}
