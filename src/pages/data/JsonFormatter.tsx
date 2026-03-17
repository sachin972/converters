import { useState, useCallback } from 'react'
import { copyToClipboard } from '../../compat'
import { formatJson, minifyJson } from '../../utils/jsonFormatter'
import '../../App.css'
import './JsonFormatter.css'

const SAMPLE = '{"name":"Alice","age":30,"active":true,"tags":["a","b"]}'

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [indent, setIndent] = useState(2)

  const handleFormat = useCallback(() => {
    setError(null)
    const { output: out, error: err } = formatJson(input, indent)
    setOutput(out)
    setError(err)
  }, [input, indent])

  const handleMinify = useCallback(() => {
    setError(null)
    const { output: out, error: err } = minifyJson(input)
    setOutput(out)
    setError(err)
  }, [input])

  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setInput(String(reader.result))
      setOutput('')
    }
    reader.onerror = () => setError('Could not read the file.')
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleCopy = useCallback(() => {
    if (output) copyToClipboard(output).catch(() => {})
  }, [output])

  return (
    <div className="app">
      <header className="header">
        <h1>JSON Formatter</h1>
        <p className="tagline">Pretty-print or minify JSON</p>
      </header>

      <main className="main json-fmt-main">
        <section className="panel json-fmt-panel">
          <div className="panel-header">
            <h2>Input</h2>
            <label className="file-label">
              <input type="file" accept=".json,application/json" onChange={handleFileLoad} className="file-input" />
              Open file
            </label>
          </div>
          <textarea
            className="json-fmt-textarea"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null) }}
            placeholder='Paste JSON here…'
            spellCheck={false}
          />
        </section>

        <div className="json-fmt-actions">
          <div className="json-fmt-options">
            <label className="json-fmt-option">
              <span className="json-fmt-option-label">Indent (spaces)</span>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="json-fmt-select"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={0}>0 (compact)</option>
              </select>
            </label>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleFormat}>
            Format
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleMinify}>
            Minify
          </button>
        </div>

        <section className="panel json-fmt-panel">
          <div className="panel-header">
            <h2>Output</h2>
            {output && (
              <button type="button" className="btn btn-secondary json-fmt-copy" onClick={handleCopy}>
                Copy
              </button>
            )}
          </div>
          {error && <p className="error">{error}</p>}
          <textarea
            className="json-fmt-textarea json-fmt-output"
            value={output}
            readOnly
            placeholder="Formatted or minified JSON will appear here…"
          />
        </section>
      </main>
    </div>
  )
}
