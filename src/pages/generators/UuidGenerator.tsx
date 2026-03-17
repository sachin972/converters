import { useState, useCallback } from 'react'
import { copyToClipboard } from '../../compat'
import { generateUuid } from '../../utils/uuid'
import '../../App.css'
import './UuidGenerator.css'

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>(() => [generateUuid()])
  const [count, setCount] = useState(1)

  const handleGenerate = useCallback(() => {
    const n = Math.min(100, Math.max(1, count))
    setUuids(Array.from({ length: n }, () => generateUuid()))
  }, [count])

  const handleCopyOne = useCallback((uuid: string) => {
    copyToClipboard(uuid).catch(() => {})
  }, [])

  const handleCopyAll = useCallback(() => {
    copyToClipboard(uuids.join('\n')).catch(() => {})
  }, [uuids])

  return (
    <div className="app">
      <header className="header">
        <h1>UUID Generator</h1>
        <p className="tagline">Generate UUID v4 (random) identifiers</p>
      </header>

      <main className="main uuid-main">
        <section className="panel uuid-panel">
          <div className="panel-header">
            <h2>Options</h2>
          </div>
          <div className="uuid-options">
            <label className="uuid-option">
              <span className="uuid-option-label">Number to generate</span>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
                className="uuid-input"
              />
            </label>
            <button type="button" className="btn btn-primary uuid-generate-btn" onClick={handleGenerate}>
              Generate
            </button>
          </div>
        </section>

        <section className="panel uuid-panel uuid-result-panel">
          <div className="panel-header">
            <h2>Generated UUIDs</h2>
            {uuids.length > 0 && (
              <button type="button" className="btn btn-secondary uuid-copy-all" onClick={handleCopyAll}>
                Copy all
              </button>
            )}
          </div>
          <ul className="uuid-list">
            {uuids.map((id, i) => (
              <li key={i} className="uuid-item">
                <code className="uuid-value">{id}</code>
                <button
                  type="button"
                  className="btn btn-secondary uuid-copy-one"
                  onClick={() => handleCopyOne(id)}
                  aria-label={`Copy ${id}`}
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
