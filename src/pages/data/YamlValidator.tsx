import { useState, useCallback } from 'react'
import { validateYaml } from '../../utils/yamlValidator'
import '../../App.css'
import './YamlValidator.css'

const SAMPLE = `name: Alice
age: 30
active: true
tags:
  - a
  - b
`

export function YamlValidator() {
  const [input, setInput] = useState(SAMPLE)
  const [result, setResult] = useState<{ valid: boolean; error: string | null; parsed?: unknown } | null>(null)

  const handleValidate = useCallback(() => {
    setResult(validateYaml(input))
  }, [input])

  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setInput(String(reader.result))
      setResult(null)
    }
    reader.onerror = () => setResult({ valid: false, error: 'Could not read the file.' })
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const jsonPreview = result?.valid && result.parsed != null
    ? JSON.stringify(result.parsed, null, 2)
    : ''

  return (
    <div className="app">
      <header className="header">
        <h1>YAML Validator</h1>
        <p className="tagline">Validate YAML and see parsed result as JSON</p>
      </header>

      <main className="main yaml-val-main">
        <section className="panel yaml-val-panel">
          <div className="panel-header">
            <h2>YAML</h2>
            <label className="file-label">
              <input type="file" accept=".yaml,.yml,text/yaml,text/x-yaml" onChange={handleFileLoad} className="file-input" />
              Open file
            </label>
          </div>
          <textarea
            className="yaml-val-textarea"
            value={input}
            onChange={(e) => { setInput(e.target.value); setResult(null) }}
            placeholder="Paste YAML here…"
            spellCheck={false}
          />
        </section>

        <div className="yaml-val-actions">
          <button type="button" className="btn btn-primary" onClick={handleValidate}>
            Validate
          </button>
        </div>

        <section className="panel yaml-val-panel">
          <div className="panel-header">
            <h2>Result</h2>
          </div>
          <div className="yaml-val-result">
            {result === null && (
              <p className="yaml-val-hint">Click Validate to check your YAML.</p>
            )}
            {result !== null && !result.valid && (
              <div className="yaml-val-error-wrap">
                <span className="yaml-val-badge yaml-val-badge-invalid">Invalid</span>
                <p className="error yaml-val-err-msg">{result.error}</p>
              </div>
            )}
            {result !== null && result.valid && (
              <>
                <div className="yaml-val-success-wrap">
                  <span className="yaml-val-badge yaml-val-badge-valid">Valid</span>
                </div>
                {jsonPreview && (
                  <div className="yaml-val-preview">
                    <span className="yaml-val-preview-label">Parsed (JSON):</span>
                    <pre className="yaml-val-preview-content">{jsonPreview}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
