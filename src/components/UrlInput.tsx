import { isYouTubeUrl } from '../utils/youtube'
import styles from './UrlInput.module.css'

interface UrlInputProps {
  onSubmit: (videoUrl: string) => void
}

export default function UrlInput({ onSubmit }: UrlInputProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = e.currentTarget.elements.namedItem('url')
    if (!(input instanceof HTMLInputElement)) {
      return
    }
    if (isYouTubeUrl(input.value)) {
      onSubmit(input.value.trim())
    } else {
      input.setCustomValidity('Invalid YouTube URL')
      input.reportValidity()
    }
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Video Framer</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          name="url"
          type="text"
          placeholder="YouTube URL"
          onChange={(e) => e.currentTarget.setCustomValidity('')}
          autoFocus
        />
        <button type="submit">Load</button>
      </form>
    </div>
  )
}
