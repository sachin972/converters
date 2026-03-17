import { useState, useCallback } from 'react'
import { compressPdf } from '../../utils/pdfCompress'
import '../../App.css'
import './PdfCompressor.css'

const ACCEPT = 'application/pdf'

export function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [scale, setScale] = useState(75)
  const [quality, setQuality] = useState(85)
  const [error, setError] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError(null)
    e.target.value = ''
  }, [])

  const handleCompress = useCallback(async () => {
    if (!file) {
      setError('Select a PDF first.')
      return
    }
    setError(null)
    setCompressing(true)
    try {
      const blob = await compressPdf(file, {
        scale: scale / 100,
        imageQuality: quality / 100,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const base = file.name.replace(/\.[^.]+$/, '')
      a.download = `${base}-compressed.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compression failed')
    } finally {
      setCompressing(false)
    }
  }, [file, scale, quality])

  return (
    <div className="app">
      <header className="header">
        <h1>PDF Compressor</h1>
        <p className="tagline">
          Shrink PDF file size by re-rendering pages at lower resolution
        </p>
      </header>

      <main className="main pdf-compressor-main">
        <section className="panel input-panel">
          <div className="panel-header">
            <h2>PDF</h2>
            <label className="file-label">
              <input
                type="file"
                accept={ACCEPT}
                onChange={handleFileSelect}
                className="file-input"
              />
              Choose PDF
            </label>
          </div>
          <div className="pdf-compressor-preview-area">
            {file ? (
              <p className="file-info">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            ) : (
              <p className="placeholder">Select a PDF to compress.</p>
            )}
          </div>
        </section>

        <section className="panel options-panel">
          <div className="panel-header">
            <h2>Options</h2>
          </div>
          <div className="compressor-options">
            <label className="option-row">
              <span className="option-label">Resolution scale {scale}%</span>
              <input
                type="range"
                min={25}
                max={100}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="option-range"
              />
            </label>
            <label className="option-row">
              <span className="option-label">Image quality {quality}%</span>
              <input
                type="range"
                min={20}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="option-range"
              />
            </label>
          </div>
          <p className="option-hint">
            Lower scale and quality produce smaller files; higher values keep more detail.
          </p>
          {error && <p className="error">{error}</p>}
          <div className="compressor-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCompress}
              disabled={!file || compressing}
            >
              {compressing ? 'Compressing…' : 'Compress & download'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
