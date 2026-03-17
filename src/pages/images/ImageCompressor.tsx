import { useState, useCallback } from 'react'
import { compressImage, getExtension, type CompressOptions } from '../../utils/imageCompress'
import '../../App.css'
import './ImageCompressor.css'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif'

const FORMAT_OPTIONS: { value: CompressOptions['outputFormat']; label: string }[] = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' },
]

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1080)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<CompressOptions['outputFormat']>('image/jpeg')
  const [error, setError] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setError(null)
    e.target.value = ''
  }, [previewUrl])

  const handleCompress = useCallback(async () => {
    if (!file) {
      setError('Select an image first.')
      return
    }
    setError(null)
    setCompressing(true)
    try {
      const blob = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality: quality / 100,
        outputFormat: format,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const base = file.name.replace(/\.[^.]+$/, '')
      a.download = `${base}-compressed.${getExtension(format)}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Compression failed')
    } finally {
      setCompressing(false)
    }
  }, [file, maxWidth, maxHeight, quality, format])

  return (
    <div className="app">
      <header className="header">
        <h1>Image Compressor</h1>
        <p className="tagline">Resize and compress images — smaller file size, same quality feel</p>
      </header>

      <main className="main image-compressor-main">
        <section className="panel input-panel">
          <div className="panel-header">
            <h2>Image</h2>
            <label className="file-label">
              <input
                type="file"
                accept={ACCEPT}
                onChange={handleFileSelect}
                className="file-input"
              />
              Choose image
            </label>
          </div>
          <div className="compressor-preview-area">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="compressor-preview" />
            ) : (
              <p className="placeholder">Select an image to compress.</p>
            )}
            {file && (
              <p className="file-info">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </section>

        <section className="panel options-panel">
          <div className="panel-header">
            <h2>Options</h2>
          </div>
          <div className="compressor-options">
            <label className="option-row">
              <span className="option-label">Max width</span>
              <input
                type="number"
                min={100}
                max={4096}
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value) || 1920)}
                className="option-input"
              />
            </label>
            <label className="option-row">
              <span className="option-label">Max height</span>
              <input
                type="number"
                min={100}
                max={4096}
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value) || 1080)}
                className="option-input"
              />
            </label>
            <label className="option-row">
              <span className="option-label">Quality {quality}%</span>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="option-range"
              />
            </label>
            <label className="option-row">
              <span className="option-label">Format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as CompressOptions['outputFormat'])}
                className="option-select"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
