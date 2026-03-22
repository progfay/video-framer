export const VIDEO_URL_PARAM = 'url'
export const VIDEO_TEXT_PARAM = 'text'

export const PlayerState = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const

function parseYouTubeUrl(input: string): { url: URL; host: string } {
  const url = new URL(input.trim())
  const host = url.hostname.replace(/^(www|m)\./, '')
  if (host !== 'youtube.com' && host !== 'youtu.be') throw new Error(`Not a YouTube URL: ${input}`)
  return { url, host }
}

export function extractVideoId(input: string): string | null {
  try {
    const { url, host } = parseYouTubeUrl(input)
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return /^[\w-]{11}$/.test(id) ? id : null
    }
    if (url.pathname === '/watch') return url.searchParams.get('v')
    const m = url.pathname.match(/^\/(embed|shorts|v)\/([\w-]{11})/)
    return m ? m[2] : null
  } catch {
    return null
  }
}
