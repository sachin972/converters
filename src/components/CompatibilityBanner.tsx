import { useState, useMemo } from 'react'
import { hasCanvas2D, hasFileReader, hasClipboardWrite, hasBase64 } from '../compat'
import '../App.css'

/**
 * Shows a dismissible notice when the browser lacks APIs needed for full functionality.
 * Helps users on older browsers understand limitations.
 */
export function CompatibilityBanner() {
  const [dismissed, setDismissed] = useState(false)

  const missing = useMemo(() => {
    const list: string[] = []
    if (!hasFileReader()) list.push('file reading')
    if (!hasCanvas2D()) list.push('image processing')
    if (!hasBase64()) list.push('Base64 encode/decode')
    if (!hasClipboardWrite()) list.push('copy to clipboard')
    return list
  }, [])

  if (dismissed || missing.length === 0) return null

  return (
    <div className="compat-banner" role="status">
      <p className="compat-banner-text">
        Some features may not work in your browser (missing: {missing.join(', ')}).
        For full functionality, use a modern browser or update to the latest version.
      </p>
      <button
        type="button"
        className="compat-banner-dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
