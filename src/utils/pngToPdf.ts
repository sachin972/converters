import { jsPDF } from 'jspdf'

const MARGIN = 10

/**
 * Converts image data URLs (e.g. from PNG files) to a single PDF.
 * One image per page; images are scaled to fit while keeping aspect ratio.
 */
export async function imagesToPdf(dataUrls: string[]): Promise<Blob> {
  if (dataUrls.length === 0) throw new Error('No images to convert')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - MARGIN * 2
  const contentHeight = pageHeight - MARGIN * 2

  const pxToMm = 25.4 / 96

  for (let i = 0; i < dataUrls.length; i++) {
    if (i > 0) doc.addPage()
    const img = await loadImage(dataUrls[i])
    const imgW = img.naturalWidth * pxToMm
    const imgH = img.naturalHeight * pxToMm
    const scale = Math.min(contentWidth / imgW, contentHeight / imgH, 1)
    const w = imgW * scale
    const h = imgH * scale
    const x = MARGIN + (contentWidth - w) / 2
    const y = MARGIN + (contentHeight - h) / 2
    doc.addImage(dataUrls[i], 'PNG', x, y, w, h)
  }

  return doc.output('blob')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/**
 * Load file as data URL (resolves when read).
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
