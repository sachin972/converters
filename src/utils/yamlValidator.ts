import { parse } from 'yaml'

export interface YamlValidationResult {
  valid: boolean
  error: string | null
  line?: number
  column?: number
  parsed?: unknown
}

export function validateYaml(input: string): YamlValidationResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { valid: false, error: 'Please enter or paste YAML to validate.' }
  }
  try {
    const parsed = parse(trimmed, { strict: true })
    return { valid: true, error: null, parsed }
  } catch (e) {
    const err = e as Error & { line?: number; col?: number; source?: { line?: number; col?: number } }
    let message = err.message || 'Invalid YAML.'
    const line = err.line ?? err.source?.line
    const col = err.col ?? err.source?.col
    if (line != null) message += ` (line ${line})`
    if (col != null) message += ` (column ${col})`
    return { valid: false, error: message, line, column: col }
  }
}
