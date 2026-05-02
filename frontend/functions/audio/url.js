const CLIENTS = [
  {
    name: 'ANDROID', version: '17.31.35', headerName: '3',
    ua: 'com.google.android.youtube/17.31.35 (Linux; U; Android 11) gzip',
    extra: { androidSdkVersion: 30 },
  },
  {
    name: 'ANDROID_TESTSUITE', version: '1.9', headerName: '30',
    ua: 'com.google.android.youtube/1.9 (Linux; U; Android 11) gzip',
    extra: { androidSdkVersion: 30 },
  },
  {
    name: 'TV_EMBEDDED', version: '2.0', headerName: '85',
    ua: 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/538.1',
    extra: {},
  },
]

export async function onRequestGet({ request }) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('v')

  if (!videoId || videoId.length < 5) {
    return Response.json({ error: 'Video ID không hợp lệ' }, { status: 400 })
  }

  for (const cfg of CLIENTS) {
    try {
      const resp = await fetch('https://www.youtube.com/youtubei/v1/player', {
        method: 'POST',
        headers: {
          'User-Agent': cfg.ua,
          'Content-Type': 'application/json',
          'X-YouTube-Client-Name': cfg.headerName,
          'X-YouTube-Client-Version': cfg.version,
        },
        body: JSON.stringify({
          videoId,
          context: {
            client: {
              clientName: cfg.name,
              clientVersion: cfg.version,
              hl: 'en',
              gl: 'US',
              ...cfg.extra,
            },
          },
        }),
      })

      if (!resp.ok) continue

      const data = await resp.json()
      const status = data?.playabilityStatus?.status
      if (status && status !== 'OK') continue

      const formats = data?.streamingData?.adaptiveFormats || []
      const audio = formats.filter(f => f.mimeType?.includes('audio'))
      if (!audio.length) continue

      const m4a = audio.filter(f => f.mimeType?.includes('mp4'))
      const best = (m4a.length ? m4a : audio).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]

      if (best?.url) {
        return Response.json({ url: best.url, video_id: videoId }, {
          headers: { 'Cache-Control': 'public, max-age=3600' },
        })
      }
    } catch {
      continue
    }
  }

  return Response.json({ error: 'Tất cả Innertube clients thất bại' }, { status: 400 })
}
