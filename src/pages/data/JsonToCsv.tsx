import { useState, useCallback } from 'react'
import { jsonToCsv, parseJson, ensureArray } from '../../utils/jsonToCsv'
import '../../App.css'

const SAMPLE_JSON = `[
  { "name": "Alice", "age": 30, "city": "New York" },
  { "name": "Bob", "age": 25, "city": "San Francisco" },
  { "name": "Carol", "age": 35, "city": "Chicago" }
]`

export function JsonToCsv() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON)
  const [csvOutput, setCsvOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleConvert = useCallback(() => {
    setError(null)
    try {
      const parsed = parseJson(jsonInput)
      const array = ensureArray(parsed)
      const csv = jsonToCsv(array)
      setCsvOutput(csv)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
      setCsvOutput('')
    }
  }, [jsonInput])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setJsonInput(text)
      setError(null)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleDownload = useCallback(() => {
    if (!csvOutput) return
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [csvOutput])

  return (
    <div className="app">
      <header className="header">
        <h1>JSON → CSV</h1>
        <p className="tagline">Paste JSON or drop a file, get CSV</p>
      </header>

      <main className="main">
        <section className="panel input-panel">
          <div className="panel-header">
            <h2>JSON</h2>
            <label className="file-label">
              <input type="file" accept=".json,application/json" onChange={handleFileSelect} className="file-input" />
              Open file
            </label>
          </div>
          <textarea
            className="editor"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[ { "key": "value" }, ... ]'
            spellCheck={false}
          />
        </section>

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={handleConvert}>
            Convert
          </button>
        </div>

        <section className="panel output-panel">
          <div className="panel-header">
            <h2>CSV</h2>
            {csvOutput && (
              <button type="button" className="btn btn-secondary" onClick={handleDownload}>
                Download CSV
              </button>
            )}
          </div>
          {error && <p className="error">{error}</p>}
          <pre className="output">{csvOutput || (error ? '' : 'Click Convert to see CSV here.')}</pre>
        </section>
      </main>
    </div>
  )
}
