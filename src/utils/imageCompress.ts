export interface CompressOptions {
  maxWidth: number
  maxHeight: number
  quality: number
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp'
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  outputFormat: 'image/jpeg',
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

function getScaledDimensions(
  img: HTMLImageElement,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  let { naturalWidth: w, naturalHeight: h } = img
  if (w <= maxW && h <= maxH) return { width: w, height: h }
  const scale = Math.min(maxW / w, maxH / h)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

/**
 * Compress an image file: resize to fit max dimensions and encode with given quality/format.
 * Returns a Blob (e.g. for download).
 */
export async function compressImage(
  file: File,
  options: Partial<CompressOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const img = await loadImage(file)
  const { width, height } = getScaledDimensions(img, opts.maxWidth, opts.maxHeight)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(img, 0, 0, width, height)

  const mime = opts.outputFormat
  const quality = mime === 'image/png' ? undefined : opts.quality

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Encoding failed'))),
      mime,
      quality
    )
  })
}

/**
 * Get extension for download filename from MIME type.
 */
export function getExtension(format: string): string {
  switch (format) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'jpg'
  }
}
