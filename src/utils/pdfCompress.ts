import * as pdfjsLib from 'pdfjs-dist'
import { jsPDF } from 'jspdf'

let workerSrc: string | null = null

async function ensureWorker(): Promise<void> {
  if (workerSrc) return
  const mod = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  const def = mod.default
  workerSrc = typeof def === 'string' ? def : (def && typeof (def as URL).href === 'string' ? (def as URL).href : '') || ''
  if (workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
}

export type PdfCompressOptions = {
  /** Scale factor for each page (0.25–1). Lower = smaller file, lower resolution. */
  scale?: number
  /** JPEG quality when embedding page images (0–1). */
  imageQuality?: number
}

const DEFAULT_SCALE = 0.75
const DEFAULT_QUALITY = 0.85
const MARGIN = 10

/**
 * Compress a PDF by re-rendering each page at lower resolution and embedding as JPEG.
 * Returns a new PDF blob (smaller file size, lossy).
 */
export async function compressPdf(
  file: File,
  options: PdfCompressOptions = {}
): Promise<Blob> {
  try {
    await ensureWorker()
  } catch {
    throw new Error(
      'PDF compression requires a modern browser with worker support. Try updating your browser or use a different device.'
    )
  }

  const scale = Math.min(1, Math.max(0.25, options.scale ?? DEFAULT_SCALE))
  const quality = Math.min(1, Math.max(0.1, options.imageQuality ?? DEFAULT_QUALITY))

  let arrayBuffer: ArrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer()
  } catch {
    throw new Error('Could not read the file. Please try another PDF.')
  }

  let pdf
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    pdf = await loadingTask.promise
  } catch {
    throw new Error(
      'Could not load the PDF. The file may be corrupted or password-protected, or your browser may not support PDF.js. Try a modern browser.'
    )
  }
  const numPages = pdf.numPages

  if (numPages === 0) throw new Error('PDF has no pages')

  const pxToMm = 25.4 / 96
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - MARGIN * 2
  const contentHeight = pageHeight - MARGIN * 2

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const w = viewport.width
    const h = viewport.height

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    const renderTask = page.render({
      canvas,
      canvasContext: ctx,
      viewport,
      intent: 'display',
    })
    await renderTask.promise

    const imgData = canvas.toDataURL('image/jpeg', quality)
    const imgW = w * pxToMm
    const imgH = h * pxToMm
    const scaleFit = Math.min(contentWidth / imgW, contentHeight / imgH, 1)
    const drawW = imgW * scaleFit
    const drawH = imgH * scaleFit
    const x = MARGIN + (contentWidth - drawW) / 2
    const y = MARGIN + (contentHeight - drawH) / 2

    if (i > 1) doc.addPage()
    doc.addImage(imgData, 'JPEG', x, y, drawW, drawH)
  }

  return doc.output('blob')
}

/** Image format for PDF page export. */
export type PdfToImageFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'

/**
 * Convert each page of a PDF to an image. Returns one Blob per page in order.
 */
export async function pdfToImages(
  file: File,
  imageFormat: PdfToImageFormat = 'image/png',
  options?: { scale?: number; quality?: number }
): Promise<Blob[]> {
  try {
    await ensureWorker()
  } catch {
    throw new Error(
      'PDF to images requires a modern browser with worker support. Try updating your browser.'
    )
  }

  let arrayBuffer: ArrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer()
  } catch {
    throw new Error('Could not read the PDF file.')
  }

  let pdf
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    pdf = await loadingTask.promise
  } catch {
    throw new Error(
      'Could not load the PDF. The file may be corrupted or password-protected.'
    )
  }

  const numPages = pdf.numPages
  if (numPages === 0) throw new Error('PDF has no pages.')

  const scale = Math.min(2, Math.max(0.5, options?.scale ?? 1.5))
  const quality = Math.min(1, Math.max(0.1, options?.quality ?? 0.92))
  const useQuality = imageFormat !== 'image/png' && imageFormat !== 'image/gif'

  const blobs: Blob[] = []
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const w = viewport.width
    const h = viewport.height

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    const renderTask = page.render({
      canvas,
      canvasContext: ctx,
      viewport,
      intent: 'display',
    })
    await renderTask.promise

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : resolve(null)),
        imageFormat,
        useQuality ? quality : undefined
      )
    })
    if (blob) blobs.push(blob)
  }

  return blobs
}
