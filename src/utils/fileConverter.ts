import { jsonToCsv } from './jsonToCsv'
import { csvToJson } from './csvToJson'
import { stringify as yamlStringify } from 'yaml'
import { parse as yamlParse } from 'yaml'
import { pdfToImages, type PdfToImageFormat } from './pdfCompress'
import { imageToText } from './imageToText'

export type FileFormat =
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'gif'
  | 'json'
  | 'yaml'
  | 'yml'
  | 'csv'
  | 'pdf'
  | 'txt'

const IMAGE_FORMATS: FileFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'gif']

export const FORMAT_LABELS: Record<FileFormat, string> = {
  png: 'PNG',
  jpg: 'JPG',
  jpeg: 'JPEG',
  webp: 'WebP',
  gif: 'GIF',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YML',
  csv: 'CSV',
  pdf: 'PDF',
  txt: 'Text',
}

/** Normalize format for comparison (e.g. yml -> yaml). */
export function normalizeFormat(f: FileFormat): FileFormat {
  if (f === 'yml') return 'yaml'
  if (f === 'jpeg') return 'jpg'
  return f
}

/** Get MIME type for image format. */
function getImageMime(format: FileFormat): string {
  switch (normalizeFormat(format)) {
    case 'png':
      return 'image/png'
    case 'jpg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    default:
      return 'image/png'
  }
}

/** Check if we can convert from format A to format B. */
export function canConvert(from: FileFormat, to: FileFormat): boolean {
  const nFrom = normalizeFormat(from)
  const nTo = normalizeFormat(to)
  if (nFrom === nTo) return false
  if (IMAGE_FORMATS.includes(nFrom) && IMAGE_FORMATS.includes(nTo)) return true
  if (IMAGE_FORMATS.includes(nFrom) && nTo === 'txt') return true
  if (nFrom === 'pdf' && IMAGE_FORMATS.includes(nTo)) return true
  if (nFrom === 'json' && (nTo === 'csv' || nTo === 'yaml')) return true
  if (nFrom === 'yaml' && nTo === 'json') return true
  if (nFrom === 'csv' && nTo === 'json') return true
  return false
}

/** Get target formats that are valid for a given source format. */
export function getTargetFormats(from: FileFormat): FileFormat[] {
  const nFrom = normalizeFormat(from)
  const targets: FileFormat[] = []
  if (IMAGE_FORMATS.includes(nFrom)) {
    ;['png', 'jpg', 'webp', 'gif'].forEach((f) => {
      if (normalizeFormat(f as FileFormat) !== nFrom) targets.push(f as FileFormat)
    })
    targets.push('txt')
  }
  if (nFrom === 'pdf') targets.push('png', 'jpg', 'webp', 'gif')
  if (nFrom === 'json') targets.push('csv', 'yaml')
  if (nFrom === 'yaml') targets.push('json')
  if (nFrom === 'csv') targets.push('json')
  return targets
}

/** Get file extension for format. */
export function getExtension(format: FileFormat): string {
  const n = normalizeFormat(format)
  if (n === 'yaml') return 'yml'
  if (n === 'jpg') return 'jpg'
  if (n === 'txt') return 'txt'
  return n
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
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

/** Convert image file to another image format. */
export async function convertImageToImage(
  file: File,
  toFormat: FileFormat
): Promise<Blob> {
  const img = await loadImageFromFile(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(img, 0, 0)
  const mime = getImageMime(toFormat)
  const quality = mime === 'image/png' || mime === 'image/gif' ? undefined : 0.92
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Encoding failed'))),
      mime,
      quality
    )
  })
}

/** Convert text-based file (JSON, YAML, CSV) to another format. Returns string content. */
export async function convertDataFile(
  file: File,
  fromFormat: FileFormat,
  toFormat: FileFormat
): Promise<string> {
  const text = await file.text()
  const nFrom = normalizeFormat(fromFormat)
  const nTo = normalizeFormat(toFormat)

  let data: unknown
  if (nFrom === 'json') {
    data = JSON.parse(text)
  } else if (nFrom === 'yaml') {
    data = yamlParse(text)
  } else if (nFrom === 'csv') {
    data = csvToJson(text)
  } else {
    throw new Error(`Unsupported source format: ${fromFormat}`)
  }

  if (nTo === 'json') {
    return JSON.stringify(data, null, 2)
  }
  if (nTo === 'yaml') {
    return yamlStringify(data, { indent: 2 })
  }
  if (nTo === 'csv') {
    const arr = Array.isArray(data) ? data : [data]
    const rows = arr.map((item) =>
      item !== null && typeof item === 'object' && !Array.isArray(item)
        ? (item as Record<string, unknown>)
        : { value: item }
    )
    return jsonToCsv(rows)
  }
  throw new Error(`Unsupported target format: ${toFormat}`)
}

/** Detect format from file name (extension). */
export function detectFormatFromFilename(name: string): FileFormat | null {
  const ext = name.replace(/^.*\./, '').toLowerCase()
  const map: Record<string, FileFormat> = {
    png: 'png',
    jpg: 'jpg',
    jpeg: 'jpeg',
    webp: 'webp',
    gif: 'gif',
    json: 'json',
    yaml: 'yaml',
    yml: 'yml',
    csv: 'csv',
    pdf: 'pdf',
    txt: 'txt',
  }
  return map[ext] ?? null
}

/**
 * Extract text from an image using OCR. Returns plain text.
 */
export async function convertImageToText(file: File): Promise<string> {
  return imageToText(file)
}

/** Map image FileFormat to MIME for PDF export. */
function getPdfExportMime(format: FileFormat): PdfToImageFormat {
  const n = normalizeFormat(format)
  if (n === 'png') return 'image/png'
  if (n === 'jpg') return 'image/jpeg'
  if (n === 'webp') return 'image/webp'
  if (n === 'gif') return 'image/gif'
  return 'image/png'
}

/**
 * Convert a PDF to one image per page. Returns an array of Blobs (one per page).
 */
export async function convertPdfToImages(
  file: File,
  toFormat: FileFormat
): Promise<Blob[]> {
  const mime = getPdfExportMime(toFormat)
  return pdfToImages(file, mime)
}
