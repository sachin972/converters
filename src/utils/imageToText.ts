import { createWorker } from 'tesseract.js'

/**
 * Extract text from an image using OCR (Tesseract.js).
 * Returns the recognized text; may be empty if no text is detected.
 */
export async function imageToText(file: File, lang: string = 'eng'): Promise<string> {
  const worker = await createWorker(lang)
  try {
    const {
      data: { text },
    } = await worker.recognize(file)
    return text?.trim() ?? ''
  } finally {
    await worker.terminate()
  }
}
