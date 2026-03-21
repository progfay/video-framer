import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { extractVideoId } from '../utils/youtube'

declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: () => void
            onStateChange?: (e: { data: number }) => void
          }
        },
      ) => YTPlayer
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getDuration(): number
  loadVideoById(videoId: string): void
  destroy(): void
}

interface UseYouTubePlayerOptions {
  containerId: string
  videoUrl: string
  onStateChange: (state: number) => void
}

export function useYouTubePlayer(options: UseYouTubePlayerOptions) {
  const { containerId, videoUrl } = options

  const playerRef = useRef<YTPlayer | null>(null)
  const [apiReady, setApiReady] = useState(false)

  const onStateChange = useEffectEvent(options.onStateChange)

  // Register onYouTubeIframeAPIReady (script is loaded via index.html)
  useEffect(() => {
    console.assert(window.YT != null, 'YouTube IFrame API not found')
    if (window.YT.Player) {
      setApiReady(true)
      return
    }
    window.onYouTubeIframeAPIReady = () => setApiReady(true)
  }, [])

  // Init player once API is ready
  useEffect(() => {
    if (!apiReady) return

    const ytPlayer = new window.YT.Player(containerId, {
      playerVars: {
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        modestbranding: 1,
        rel: 0,
        origin: location.origin,
      },
      events: {
        onReady: () => {
          playerRef.current = ytPlayer
          const videoId = extractVideoId(videoUrl)
          if (videoId) playerRef.current.loadVideoById(videoId)
        },
        onStateChange: (e) => {
          onStateChange(e.data)
        },
      },
    })

    return () => {
      const player = playerRef.current ?? ytPlayer
      player?.destroy()
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, containerId])

  // Handle videoUrl changes after player is ready
  useEffect(() => {
    if (!playerRef.current) return
    const videoId = extractVideoId(videoUrl)
    if (videoId) playerRef.current.loadVideoById(videoId)
  }, [videoUrl])

  function play() {
    playerRef.current?.playVideo()
  }

  function pause() {
    playerRef.current?.pauseVideo()
  }

  function seekTo(seconds: number) {
    playerRef.current?.seekTo(seconds, true)
  }

  function getCurrentTime() {
    return playerRef.current?.getCurrentTime() ?? 0
  }

  function getDuration() {
    return playerRef.current?.getDuration() ?? 0
  }

  function stepFrame(direction: 1 | -1, fps: number) {
    const player = playerRef.current
    if (!player) return

    player.pauseVideo()

    const before = player.getCurrentTime()
    const target = Math.max(0, before + direction * (1 / fps))
    player.seekTo(target, true)

    function poll() {
      if (player.getCurrentTime() !== before) return
      requestAnimationFrame(poll)
    }
    requestAnimationFrame(poll)
  }

  return { play, pause, seekTo, stepFrame, getCurrentTime, getDuration }
}
