const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.tokhmi.xyz',
  'https://pa.il.ax',
]

const CLIENTS = [
  // VR client — không cần auth, yt-dlp dùng client này để bypass
  {
    name: 'ANDROID_VR', version: '1.60.19', headerName: '28',
    key: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    ua: 'com.google.android.apps.youtube.vr.oculus/1.60.19 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip',
    extra: { deviceMake: 'Oculus', deviceModel: 'Quest 3', androidSdkVersion: 32, osName: 'Android', osVersion: '12L' },
  },
  {
    name: 'WEB', version: '2.20240726.00.00', headerName: '1',
    key: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    extra: {}, web: true,
  },
  {
    name: 'ANDROID', version: '19.29.37', headerName: '3',
    key: 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w',
    ua: 'com.google.android.youtube/19.29.37 (Linux; U; Android 11) gzip',
    extra: { androidSdkVersion: 30, osName: 'Android', osVersion: '11' },
  },
]

async function sapisidHash(sapisid) {
  const ts = Math.floor(Date.now() / 1000)
  const data = `${ts} ${sapisid} https://www.youtube.com`
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(data))
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `SAPISIDHASH ${ts}_${hex}`
}

function parseCookieEnv(raw) {
  if (!raw) return ''
  let text = raw
  try { text = atob(raw) } catch {}
  const cookies = {}
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const parts = t.split('\t')
    if (parts.length >= 7) cookies[parts[5]] = parts[6]
  }
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
}

export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('v')

  if (!videoId || videoId.length < 5) {
    return Response.json({ error: 'Video ID không hợp lệ' }, { status: 400 })
  }

  // 0) Piped API
  for (const base of PIPED_INSTANCES) {
    try {
      const r = await fetch(`${base}/streams/${videoId}`, {
        signal: AbortSignal.timeout(7000),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })
      if (r.ok) {
        const d = await r.json()
        const streams = d.audioStreams || []
        const m4a = streams.filter(s => s.mimeType?.includes('mp4'))
        const best = (m4a.length ? m4a : streams).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]
        if (best?.url) {
          return Response.json({ url: best.url, video_id: videoId }, {
            headers: { 'Cache-Control': 'public, max-age=3600' },
          })
        }
      }
    } catch {}
  }

  const cookieStr = parseCookieEnv(env?.YOUTUBE_COOKIES || '')

  const errors = []
  for (const cfg of CLIENTS) {
    try {
      const hdrs = {
        'User-Agent': cfg.ua,
        'Content-Type': 'application/json',
        'X-YouTube-Client-Name': cfg.headerName,
        'X-YouTube-Client-Version': cfg.version,
      }
      if (cookieStr) {
        hdrs['Cookie'] = cookieStr
        if (cfg.web) {
          const sapisid = cookieStr.split(';').map(s => s.trim())
            .find(s => s.startsWith('SAPISID='))?.slice(8)
          if (sapisid) {
            hdrs['Authorization'] = await sapisidHash(sapisid)
            hdrs['Origin'] = 'https://www.youtube.com'
            hdrs['X-Origin'] = 'https://www.youtube.com'
          }
        }
      }

      const apiUrl = `https://www.youtube.com/youtubei/v1/player?key=${cfg.key}&prettyPrint=false`
      const ctx = {
        client: { clientName: cfg.name, clientVersion: cfg.version, hl: 'en', gl: 'US', ...cfg.extra },
      }
      if (cfg.embedUrl) ctx.thirdParty = { embedUrl: cfg.embedUrl }

      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: hdrs,
        body: JSON.stringify({ videoId, context: ctx, contentCheckOk: true, racyCheckOk: true }),
      })

      if (!resp.ok) {
        errors.push(`${cfg.name}:HTTP${resp.status}`)
        continue
      }

      const data = await resp.json()
      const status = data?.playabilityStatus?.status
      if (status && status !== 'OK') {
        const reason = data.playabilityStatus?.reason || status
        errors.push(`${cfg.name}:${reason}`)
        continue
      }

      const formats = data?.streamingData?.adaptiveFormats || []
      const audio = formats.filter(f => f.mimeType?.includes('audio'))
      if (!audio.length) {
        errors.push(`${cfg.name}:no_audio`)
        continue
      }

      const m4a = audio.filter(f => f.mimeType?.includes('mp4'))
      const best = (m4a.length ? m4a : audio).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]

      if (best?.url) {
        return Response.json({ url: best.url, video_id: videoId }, {
          headers: { 'Cache-Control': 'public, max-age=3600' },
        })
      }
      errors.push(`${cfg.name}:no_url`)
    } catch (e) {
      errors.push(`${cfg.name}:${e.message}`)
    }
  }

  return Response.json({
    error: 'Innertube thất bại',
    detail: errors.join(' | '),
    hasCookie: !!cookieStr,
  }, { status: 400 })
}
