export const VIDEO_URL_PARAM = 'url'
export const VIDEO_TEXT_PARAM = 'text'

export const PlayerState = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const

export function isYouTubeUrl(input: string): boolean {
  try {
    const url = new URL(input.trim())
    const host = url.hostname.replace(/^(www|m)\./, '')
    return host === 'youtube.com' || host === 'youtu.be'
  } catch {
    return false
  }
}

export function extractVideoId(input: string): string | null {
  try {
    const url = new URL(input.trim())
    const host = url.hostname.replace(/^(www|m)\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return /^[\w-]{11}$/.test(id) ? id : null
    }
    if (host === 'youtube.com') {
      if (url.pathname === '/watch') return url.searchParams.get('v')
      const m = url.pathname.match(/^\/(embed|shorts|v)\/([\w-]{11})/)
      return m ? m[2] : null
    }
  } catch {
    // not a valid URL
  }
  return null
}
