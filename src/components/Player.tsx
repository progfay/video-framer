import { useYouTubePlayer } from '../hooks/useYouTubePlayer'
import styles from './Player.module.css'

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
  const { play, pause, seekTo, stepFrame, getCurrentTime, getDuration } = useYouTubePlayer({
    containerId: PLAYER_CONTAINER_ID,
    videoUrl,
    onStateChange,
  })

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    seekTo(parseFloat(e.target.value) * getDuration())
  }

  return (
    <div className={styles.wrapper}>
      <div id={PLAYER_CONTAINER_ID} className={styles.ytPlayer} />

      {/* Zone overlay */}
      <div className={styles.zoneOverlay}>
        {mode === 'init' && <div className={styles.zone} onClick={play} />}
        {mode === 'view' && (
          <>
            <div className={styles.zone} onClick={() => stepFrame(-1, fps)} />
            <div className={styles.zone} onClick={() => onModeChange('control')} />
            <div className={styles.zone} onClick={() => stepFrame(1, fps)} />
          </>
        )}
      </div>

      {/* Controls overlay: control mode only */}
      {mode === 'control' && (
        <div className={styles.controlsOverlay} onClick={() => onModeChange('view')}>
          <button
            className={styles.playPauseCenterBtn}
            onClick={(e) => {
              e.stopPropagation()
              if (isPlaying) pause()
              else play()
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className={styles.controlsBar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.controlsRow}>
              <input
                ref={(el) => {
                  if (!el) return
                  const inputEl = el
                  let rafId: number
                  function loop() {
                    const dur = getDuration()
                    if (dur > 0) inputEl.value = String(getCurrentTime() / dur)
                    rafId = requestAnimationFrame(loop)
                  }
                  rafId = requestAnimationFrame(loop)
                  return () => cancelAnimationFrame(rafId)
                }}
                className={styles.seekBar}
                type="range"
                min={0}
                max={1}
                step={0.001}
                defaultValue={0}
                onChange={handleSeek}
              />
              <button
                className={styles.fpsToggleBtn}
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
