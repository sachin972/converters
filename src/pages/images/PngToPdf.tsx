import { useState, useCallback } from 'react'
import { imagesToPdf, fileToDataUrl } from '../../utils/pngToPdf'
import '../../App.css'
import './PngToPdf.css'

const ACCEPT = 'image/png,image/jpeg,image/webp'

export function PngToPdf() {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [converting, setConverting] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return
    setFiles((prev) => [...prev, ...selected])
    setError(null)
    e.target.value = ''
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }, [])

  const handleConvert = useCallback(async () => {
    if (files.length === 0) {
      setError('Add at least one image.')
      return
    }
    setError(null)
    setConverting(true)
    try {
      const dataUrls = await Promise.all(files.map((f) => fileToDataUrl(f)))
      const blob = await imagesToPdf(dataUrls)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'images.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }, [files])

  return (
    <div className="app">
      <header className="header">
        <h1>PNG → PDF</h1>
        <p className="tagline">Upload images, get a single PDF (one image per page)</p>
      </header>

      <main className="main png-to-pdf-main">
        <section className="panel input-panel">
          <div className="panel-header">
            <h2>Images</h2>
            <label className="file-label">
              <input
                type="file"
                accept={ACCEPT}
                multiple
                onChange={handleFileSelect}
                className="file-input"
              />
              Add images
            </label>
          </div>
          <div className="image-list">
            {files.length === 0 ? (
              <p className="placeholder">Add PNG, JPEG or WebP images. Order = page order.</p>
            ) : (
              <ul className="image-items">
                {files.map((file, i) => (
                  <li key={`${file.name}-${i}`} className="image-item">
                    <span className="image-name" title={file.name}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConvert}
            disabled={files.length === 0 || converting}
          >
            {converting ? 'Converting…' : 'Convert to PDF'}
          </button>
        </div>

        <section className="panel output-panel output-panel-pdf">
          <div className="panel-header">
            <h2>Result</h2>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="output-hint">
            {files.length > 0 && !error && (
              <p>Click &quot;Convert to PDF&quot; to generate and download the PDF.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
