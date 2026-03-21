import { useEffect, useState } from 'react'
import UrlInput from './components/UrlInput'
import Player, { type Mode } from './components/Player'
import { isYouTubeUrl, PlayerState, VIDEO_TEXT_PARAM, VIDEO_URL_PARAM } from './utils/youtube'

export default function App() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('init')
  const [fps, setFps] = useState<30 | 60>(30)
  const [isPlaying, setIsPlaying] = useState(false)

  // Read query params on mount (Web Share Target sends url, text, title)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const url = [params.get(VIDEO_URL_PARAM), params.get(VIDEO_TEXT_PARAM)].find(
      (v) => v !== null && isYouTubeUrl(v),
    )
    if (url) {
      setVideoUrl(url)
    }
  }, [])

  function handleVideoUrl(url: string) {
    setVideoUrl(url)
    setIsPlaying(false)
    setMode('init')

    const params = new URLSearchParams()
    params.set(VIDEO_URL_PARAM, url)
    history.replaceState(null, '', `${location.pathname}?${params.toString()}`)
  }

  function handleStateChange(state: number) {
    switch (state) {
      case PlayerState.PLAYING:
        setIsPlaying(true)
        setMode((prev) => (prev === 'init' ? 'view' : prev))
        break
      case PlayerState.ENDED:
      case PlayerState.PAUSED:
        setIsPlaying(false)
        break
    }
  }

  if (!videoUrl) {
    return <UrlInput onSubmit={handleVideoUrl} />
  }

  return (
    <Player
      videoUrl={videoUrl}
      mode={mode}
      fps={fps}
      isPlaying={isPlaying}
      onModeChange={setMode}
      onFpsChange={setFps}
      onStateChange={handleStateChange}
    />
  )
}
