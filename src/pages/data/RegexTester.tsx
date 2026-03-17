import { useState, useCallback, useMemo } from 'react'
import '../../App.css'
import './RegexTester.css'

const FLAGS = [
  { id: 'g', label: 'Global (all matches)', desc: 'g' },
  { id: 'i', label: 'Ignore case', desc: 'i' },
  { id: 'm', label: 'Multiline', desc: 'm' },
  { id: 's', label: 'Dotall', desc: 's' },
  { id: 'u', label: 'Unicode', desc: 'u' },
] as const

export function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('Hello world 123 and 456')
  const [flags, setFlags] = useState<Set<string>>(new Set(['g']))
  const [replaceWith, setReplaceWith] = useState('')

  const toggleFlag = useCallback((id: string) => {
    setFlags((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const flagsStr = useMemo(() => Array.from(flags).sort().join(''), [flags])

  const result = useMemo(() => {
    const trimmed = pattern.trim()
    if (!trimmed) return { matches: [], replaced: null, error: null as string | null }
    try {
      const re = new RegExp(trimmed, flagsStr || undefined)
      const matches: { index: number; match: string; groups: string[] }[] = []
      let m: RegExpExecArray | null
      while ((m = re.exec(testString)) !== null) {
        const groups = m.slice(1).filter((g) => g !== undefined)
        matches.push({ index: m.index, match: m[0], groups })
        if (!flags.has('g')) break
      }
      const replaced = replaceWith.trim() !== ''
        ? testString.replace(re, replaceWith)
        : null
      return { matches, replaced, error: null as string | null }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid regular expression.'
      return { matches: [], replaced: null, error: msg }
    }
  }, [pattern, testString, flagsStr, flags, replaceWith])

  const showReplace = replaceWith !== ''

  return (
    <div className="app">
      <header className="header">
        <h1>Regex Tester</h1>
        <p className="tagline">Test regular expressions and see matches and capture groups</p>
      </header>

      <main className="main regex-main">
        <section className="panel regex-panel">
          <div className="panel-header">
            <h2>Pattern</h2>
          </div>
          <div className="regex-pattern-row">
            <span className="regex-delim">/</span>
            <input
              type="text"
              className="regex-pattern-input"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \d+ or (hello|world)"
              spellCheck={false}
            />
            <span className="regex-delim">/{flagsStr}</span>
          </div>
          <div className="regex-flags">
            {FLAGS.map((f) => (
              <label key={f.id} className="regex-flag-label">
                <input
                  type="checkbox"
                  checked={flags.has(f.id)}
                  onChange={() => toggleFlag(f.id)}
                  className="regex-flag-check"
                />
                <span className="regex-flag-desc">{f.desc}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="panel regex-panel">
          <div className="panel-header">
            <h2>Test string</h2>
          </div>
          <textarea
            className="regex-textarea"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter or paste text to test against…"
            spellCheck={false}
          />
        </section>

        <section className="panel regex-panel regex-replace-panel">
          <div className="panel-header">
            <h2>Replace (optional)</h2>
          </div>
          <div className="regex-replace-wrap">
          <input
            type="text"
            className="regex-replace-input"
            value={replaceWith}
            onChange={(e) => setReplaceWith(e.target.value)}
            placeholder="Replacement string (e.g. $1)"
            spellCheck={false}
          />
          </div>
        </section>

        <section className="panel regex-panel regex-result-panel">
          <div className="panel-header">
            <h2>Results</h2>
          </div>
          {result.error && <p className="error">{result.error}</p>}
          {!result.error && pattern.trim() === '' && (
            <p className="regex-hint">Enter a pattern and test string to see matches.</p>
          )}
          {!result.error && pattern.trim() !== '' && (
            <>
              {result.matches.length === 0 ? (
                <p className="regex-no-match">No matches found.</p>
              ) : (
                <div className="regex-matches">
                  <p className="regex-match-count">{result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}</p>
                  <ul className="regex-match-list">
                    {result.matches.map((m, i) => (
                      <li key={i} className="regex-match-item">
                        <span className="regex-match-index">#{i + 1} at index {m.index}</span>
                        <code className="regex-match-text">{m.match}</code>
                        {m.groups.length > 0 && (
                          <div className="regex-groups">
                            {m.groups.map((g, j) => (
                              <span key={j} className="regex-group">Group {j + 1}: <code>{g}</code></span>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {showReplace && result.replaced !== null && (
                <div className="regex-replaced">
                  <span className="regex-replaced-label">Replaced:</span>
                  <pre className="regex-replaced-value">{result.replaced}</pre>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
