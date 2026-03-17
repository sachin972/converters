/**
 * Per-route SEO: title and meta description for each section.
 * Optimized for search: primary keywords first, natural language.
 */
export type RouteMeta = {
  path: string
  title: string
  description: string
}

const BASE_TITLE = 'Converters'

export const ROUTE_META: RouteMeta[] = [
  {
    path: '/data',
    title: `JSON to CSV Converter — Free Online JSON Formatter, YAML, Base64, Regex | ${BASE_TITLE}`,
    description:
      'Free JSON to CSV converter online. Also: JSON formatter & minify, YAML validator, Base64 encode/decode, regex tester. Convert and format data in your browser, no signup.',
  },
  {
    path: '/images',
    title: `PNG to PDF Converter — Image to PDF, Image Compressor, PDF Compressor | ${BASE_TITLE}`,
    description:
      'Convert PNG to PDF free online. Compress images (resize, reduce size) and compress PDFs. Image to PDF converter and PDF compressor — no signup.',
  },
  {
    path: '/calculators',
    title: `Salary Calculator & EMI Calculator — Tax by Country, Loan EMI | ${BASE_TITLE}`,
    description:
      'Free salary after tax calculator for multiple countries. Loan EMI calculator with interest and tenure. Calculate take-home pay and loan EMI online.',
  },
  {
    path: '/generators',
    title: `UUID Generator — Free UUID v4 Generator Online | ${BASE_TITLE}`,
    description:
      'Generate UUID v4 (random) online free. Copy single or multiple UUIDs. No signup. Free UUID generator for developers.',
  },
  {
    path: '/file-converter',
    title: `File Converter — Convert Images, PDF to Images, Image to Text OCR, JSON, YAML, CSV | ${BASE_TITLE}`,
    description:
      'Free file converter: convert between image formats, PDF to images (one per page), image to text (OCR), JSON, YAML, CSV. Download as files or ZIP. No signup.',
  },
]

export function getMetaForPath(pathname: string): RouteMeta | null {
  const normalized = (pathname.replace(/\/$/, '') || '/data').toLowerCase()
  return ROUTE_META.find((m) => m.path === normalized) ?? ROUTE_META[0]
}

export const BASE_DESCRIPTION =
  'Free online converters: JSON to CSV, image to PDF, file converter, Base64, regex, UUID, salary & EMI calculator.'
