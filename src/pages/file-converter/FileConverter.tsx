import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import {
  type FileFormat,
  FORMAT_LABELS,
  getTargetFormats,
  getExtension,
  detectFormatFromFilename,
  canConvert,
  convertImageToImage,
  convertDataFile,
  convertPdfToImages,
  convertImageToText,
} from '../../utils/fileConverter'
import '../../App.css'
import './FileConverter.css'

const SOURCE_FORMATS: FileFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'json', 'yaml', 'yml', 'csv']

export type PdfImagesDownloadMode = 'individual' | 'zip'

export function FileConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [fromFormat, setFromFormat] = useState<FileFormat>('json')
  const [toFormat, setToFormat] = useState<FileFormat>('csv')
  const [pdfDownloadMode, setPdfDownloadMode] = useState<PdfImagesDownloadMode>('individual')
  const [error, setError] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)

  const targets = getTargetFormats(fromFormat)
  const targetOptions = targets.filter((t) => t !== fromFormat)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setError(null)
    if (f) {
      setFile(f)
      const detected = detectFormatFromFilename(f.name)
      if (detected) {
        setFromFormat(detected)
        const t = getTargetFormats(detected)
        if (t.length > 0 && !t.includes(toFormat)) setToFormat(t[0])
      }
    } else {
      setFile(null)
    }
    e.target.value = ''
  }, [toFormat])

  const handleFromChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as FileFormat
    setFromFormat(val)
    const t = getTargetFormats(val)
    if (t.length > 0) {
      const currentTo = t.includes(toFormat) ? toFormat : t[0]
      setToFormat(currentTo)
    }
    setError(null)
  }, [toFormat])

  const handleToChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setToFormat(e.target.value as FileFormat)
    setError(null)
  }, [])

  const handleConvert = useCallback(async () => {
    if (!file) {
      setError('Please select a file to convert.')
      return
    }
    if (!canConvert(fromFormat, toFormat)) {
      setError('This conversion is not supported.')
      return
    }
    setError(null)
    setConverting(true)
    try {
      const imageFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif']
      const fromIsImage = imageFormats.includes(fromFormat)
      const toIsImage = imageFormats.includes(toFormat)
      const fromIsPdf = fromFormat === 'pdf'

      if (fromIsPdf && toIsImage) {
        const blobs = await convertPdfToImages(file, toFormat)
        const base = file.name.replace(/\.[^.]+$/, '')
        const ext = getExtension(toFormat)

        if (pdfDownloadMode === 'zip') {
          const zip = new JSZip()
          const folderName = `${base}-pages`
          for (let i = 0; i < blobs.length; i++) {
            zip.file(`${folderName}/${base}-page-${i + 1}.${ext}`, blobs[i])
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          const url = URL.createObjectURL(zipBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${base}-pages.zip`
          a.click()
          URL.revokeObjectURL(url)
        } else {
          for (let i = 0; i < blobs.length; i++) {
            const url = URL.createObjectURL(blobs[i])
            const a = document.createElement('a')
            a.href = url
            a.download = `${base}-page-${i + 1}.${ext}`
            a.click()
            URL.revokeObjectURL(url)
            if (i < blobs.length - 1) {
              await new Promise((r) => setTimeout(r, 300))
            }
          }
        }
      } else if (fromIsImage && toFormat === 'txt') {
        const text = await convertImageToText(file)
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const base = file.name.replace(/\.[^.]+$/, '')
        a.download = `${base}.txt`
        a.click()
        URL.revokeObjectURL(url)
      } else if (fromIsImage && toIsImage) {
        const blob = await convertImageToImage(file, toFormat)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const base = file.name.replace(/\.[^.]+$/, '')
        a.download = `${base}.${getExtension(toFormat)}`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const content = await convertDataFile(file, fromFormat, toFormat)
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const base = file.name.replace(/\.[^.]+$/, '')
        a.download = `${base}.${getExtension(toFormat)}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed.')
    } finally {
      setConverting(false)
    }
  }, [file, fromFormat, toFormat, pdfDownloadMode])

  const supported = file && canConvert(fromFormat, toFormat)

  return (
    <div className="app">
      <header className="header">
        <h1>File Converter</h1>
        <p className="tagline">Convert between image formats (PNG, JPEG, WebP, GIF), image to text (OCR), PDF to images (one per page), and data formats (JSON, YAML, CSV)</p>
      </header>

      <main className="main file-conv-main">
        <section className="panel file-conv-panel">
          <div className="panel-header">
            <h2>File</h2>
          </div>
          <div className="file-conv-upload">
            <label className="file-conv-file-label">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.json,.yaml,.yml,.csv,image/*,application/pdf,application/json,text/yaml,text/csv"
                onChange={handleFileSelect}
                className="file-input"
              />
              Choose file
            </label>
            {file && (
              <p className="file-conv-filename" title={file.name}>
                {file.name}
              </p>
            )}
          </div>
        </section>

        <section className="panel file-conv-panel">
          <div className="panel-header">
            <h2>Convert</h2>
          </div>
          <div className="file-conv-options">
            <label className="file-conv-field">
              <span className="file-conv-label">From</span>
              <select
                value={fromFormat}
                onChange={handleFromChange}
                className="file-conv-select"
                aria-label="Source format"
              >
                {SOURCE_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
            </label>
            <span className="file-conv-arrow">→</span>
            <label className="file-conv-field">
              <span className="file-conv-label">To</span>
              <select
                value={toFormat}
                onChange={handleToChange}
                className="file-conv-select"
                aria-label="Target format"
                disabled={targetOptions.length === 0}
              >
                {targetOptions.map((t) => (
                  <option key={t} value={t}>
                    {FORMAT_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {fromFormat === 'pdf' && targets.length > 0 && (
            <div className="file-conv-pdf-options">
              <span className="file-conv-pdf-option-label">Download as</span>
              <div className="file-conv-pdf-option-group" role="group" aria-label="PDF pages download format">
                <label className="file-conv-radio-label">
                  <input
                    type="radio"
                    name="pdfDownloadMode"
                    value="individual"
                    checked={pdfDownloadMode === 'individual'}
                    onChange={() => setPdfDownloadMode('individual')}
                    className="file-conv-radio"
                  />
                  <span>Individual files</span>
                </label>
                <label className="file-conv-radio-label">
                  <input
                    type="radio"
                    name="pdfDownloadMode"
                    value="zip"
                    checked={pdfDownloadMode === 'zip'}
                    onChange={() => setPdfDownloadMode('zip')}
                    className="file-conv-radio"
                  />
                  <span>ZIP folder</span>
                </label>
              </div>
              <p className="file-conv-hint">
                {pdfDownloadMode === 'individual'
                  ? 'One image per page (e.g. myfile-page-1.png, myfile-page-2.png).'
                  : 'All pages in one compressed .zip (e.g. myfile-pages.zip).'}
              </p>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button
            type="button"
            className="btn btn-primary file-conv-btn"
            onClick={handleConvert}
            disabled={!supported || converting}
          >
            {converting ? 'Converting…' : 'Convert & download'}
          </button>
        </section>
      </main>
    </div>
  )
}
