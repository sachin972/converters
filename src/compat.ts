/**
 * Backward-compatibility layer: polyfills and fallbacks so features work in older browsers.
 * Import this once at app entry (e.g. main.tsx) before rendering.
 */

/** Whether Canvas 2D is available. */
export function hasCanvas2D(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('2d')
  } catch {
    return false
  }
}

/** Whether FileReader is available. */
export function hasFileReader(): boolean {
  return typeof FileReader !== 'undefined'
}

/** Whether clipboard write is available (navigator.clipboard or document.execCommand). */
export function hasClipboardWrite(): boolean {
  const nav = typeof navigator !== 'undefined' ? navigator : null
  const clip = nav?.clipboard as { writeText?: unknown } | undefined
  if (clip && typeof clip.writeText === 'function') return true
  return typeof document !== 'undefined' && typeof document.execCommand === 'function'
}

/** Whether btoa/atob are available for Base64. */
export function hasBase64(): boolean {
  const g = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : undefined)
  const o = g as unknown as { btoa?: unknown; atob?: unknown }
  return typeof o?.btoa === 'function' && typeof o?.atob === 'function'
}

/**
 * Polyfill for HTMLCanvasElement.prototype.toBlob (missing in some older browsers).
 * Uses toDataURL + manual base64 decode to Blob.
 */
function polyfillCanvasToBlob(): void {
  if (typeof HTMLCanvasElement === 'undefined') return
  const proto = HTMLCanvasElement.prototype as { toBlob?: unknown }
  if (typeof proto.toBlob === 'function') return

  HTMLCanvasElement.prototype.toBlob = function (
    callback: BlobCallback,
    type?: string,
    quality?: number
  ): void {
    const mime = type || 'image/png'
    let dataUrl: string
    try {
      dataUrl = this.toDataURL(mime, quality)
    } catch {
      callback(null)
      return
    }
    const base64 = dataUrl.split(',')[1]
    if (!base64) {
      callback(null)
      return
    }
    try {
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      callback(new Blob([bytes], { type: mime }))
    } catch {
      callback(null)
    }
  }
}

/**
 * Copy text to clipboard. Uses navigator.clipboard when available,
 * otherwise falls back to document.execCommand('copy') with a temporary textarea.
 */
export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Clipboard not available'))
      return
    }
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    ta.style.top = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    try {
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      if (ok) resolve()
      else reject(new Error('Copy failed'))
    } catch (e) {
      document.body.removeChild(ta)
      reject(e)
    }
  })
}

/**
 * Run all compatibility polyfills. Call once at app startup.
 */
export function installPolyfills(): void {
  polyfillCanvasToBlob()
}
