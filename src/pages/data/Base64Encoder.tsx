import { useState, useCallback } from 'react'
import { copyToClipboard } from '../../compat'
import '../../App.css'
import './Base64Encoder.css'

const BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/

function getDecodeError(message: string): string {
  if (message.includes('atob') || message.includes('Invalid character')) return 'Invalid Base64: only A–Z, a–z, 0–9, +, / and padding = are allowed.'
  if (message.includes('URI') || message.includes('malformed')) return 'Decoded bytes are not valid UTF-8 text.'
  return message || 'Decode failed. Check that the input is valid Base64.'
}

export function Base64Encoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const handleEncode = useCallback(() => {
    setError(null)
    const trimmed = input.trim()
    if (!trimmed) {
      setError('Please enter some text to encode.')
      setOutput('')
      return
    }
    try {
      const encoded = btoa(unescape(encodeURIComponent(trimmed)))
      setOutput(encoded)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Encode failed.'
      setError(msg.includes('character') ? 'Input contains characters that cannot be encoded. Try encoding a file instead for binary data.' : msg)
      setOutput('')
    }
  }, [input])

  const handleDecode = useCallback(() => {
    setError(null)
    const trimmed = input.trim().replace(/\s/g, '')
    if (!trimmed) {
      setError('Please paste Base64 string to decode.')
      setOutput('')
      return
    }
    if (trimmed.length % 4 !== 0) {
      setError('Invalid Base64: length must be a multiple of 4 (use = for padding).')
      setOutput('')
      return
    }
    if (!BASE64_REGEX.test(trimmed)) {
      setError('Invalid Base64: only letters A–Z, a–z, digits 0–9, and + / = are allowed. Remove spaces or other characters.')
      setOutput('')
      return
    }
    try {
      const decoded = decodeURIComponent(escape(atob(trimmed)))
      setOutput(decoded)
    } catch (e) {
      setError(getDecodeError(e instanceof Error ? e.message : 'Decode failed.'))
      setOutput('')
    }
  }, [input])

  const handleAction = useCallback(() => {
    if (mode === 'encode') handleEncode()
    else handleDecode()
  }, [mode, handleEncode, handleDecode])

  const handleFileEncode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(result)
        let binary = ''
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
        const encoded = btoa(binary)
        setInput('')
        setOutput(encoded)
        setMode('encode')
      }
    }
    reader.onerror = () => setError('Could not read the file. It may be in use or inaccessible.')
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }, [])

  const handleCopy = useCallback(() => {
    if (!output) return
    copyToClipboard(output).catch(() => {})
  }, [output])

  return (
    <div className="app">
      <header className="header">
        <h1>Base64 Encoder</h1>
        <p className="tagline">Encode text to Base64 or decode Base64 to text</p>
      </header>

      <main className="main base64-main">
        <section className="panel base64-panel">
          <div className="panel-header">
            <h2>Input</h2>
            <div className="base64-actions">
              <label className="file-label">
                <input type="file" onChange={handleFileEncode} className="file-input" />
                Encode file
              </label>
            </div>
          </div>
          <textarea
            className="base64-textarea"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null) }}
            placeholder={mode === 'encode' ? 'Enter text to encode…' : 'Paste Base64 to decode…'}
            spellCheck={false}
          />
        </section>

        <div className="base64-buttons">
          <label className="base64-mode-label">
            <span className="base64-mode-text">Mode</span>
            <select
              value={mode}
              onChange={(e) => { setMode(e.target.value as 'encode' | 'decode'); setError(null) }}
              className="base64-select"
              aria-label="Encode or decode"
            >
              <option value="encode">Encode to Base64</option>
              <option value="decode">Decode from Base64</option>
            </select>
          </label>
          <button type="button" className="btn btn-primary" onClick={handleAction}>
            {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
        </div>

        <section className="panel base64-panel">
          <div className="panel-header">
            <h2>Output</h2>
            {output && (
              <button type="button" className="btn btn-secondary base64-copy" onClick={handleCopy}>
                Copy
              </button>
            )}
          </div>
          {error && <p className="error">{error}</p>}
          <textarea
            className="base64-textarea base64-output"
            value={output}
            readOnly
            placeholder="Result will appear here…"
          />
        </section>
      </main>
    </div>
  )
}
