import { useYouTubePlayer } from '../hooks/useYouTubePlayer'

const PLAYER_CONTAINER_ID = 'yt-player'

export type Mode = 'init' | 'view' | 'control'

interface PlayerProps {
  videoUrl: string
  mode: Mode
  fps: 30 | 60
  isPlaying: boolean
  onModeChange: (mode: Mode) => void
  onFpsChange: (fps: 30 | 60) => void
  onStateChange: (state: number) => void
}

export default function Player({
  videoUrl,
  mode,
  fps,
  isPlaying,
  onModeChange,
  onFpsChange,
  onStateChange,
}: PlayerProps) {
  const { play, pause, seekTo, stepFrame, getCurrentTime, getDuration } =
    useYouTubePlayer({ containerId: PLAYER_CONTAINER_ID, videoUrl, onStateChange })

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    seekTo(parseFloat(e.target.value) * getDuration())
  }

  return (
    <div className="player-wrapper">
      <div id={PLAYER_CONTAINER_ID} />

      {/* Zone overlay */}
      <div className="zone-overlay">
        {mode === 'init' && <div className="zone zone-full" onClick={play} />}
        {mode === 'view' && (
          <>
            <div className="zone zone-left" onClick={() => stepFrame(-1, fps)} />
            <div className="zone zone-center" onClick={() => onModeChange('control')} />
            <div className="zone zone-right" onClick={() => stepFrame(1, fps)} />
          </>
        )}
      </div>

      {/* Controls overlay: control mode only */}
      {mode === 'control' && (
        <div
          className="controls-overlay"
          onClick={() => onModeChange('view')}
        >
          <button
            className="play-pause-center-btn"
            onClick={(e) => {
              e.stopPropagation()
              isPlaying ? pause() : play()
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div
            className="controls-bar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="controls-row">
              <input
                ref={(el) => {
                  if (!el) return
                  let rafId: number
                  function loop() {
                    const dur = getDuration()
                    if (dur > 0) el.value = String(getCurrentTime() / dur)
                    rafId = requestAnimationFrame(loop)
                  }
                  rafId = requestAnimationFrame(loop)
                  return () => cancelAnimationFrame(rafId)
                }}
                className="seek-bar"
                type="range"
                min={0}
                max={1}
                step={0.001}
                defaultValue={0}
                onChange={handleSeek}
              />
              <button
                className="fps-toggle-btn"
                onClick={() => onFpsChange(fps === 30 ? 60 : 30)}
              >
                1/{fps}s
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
