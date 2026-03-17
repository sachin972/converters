export interface FormatResult {
  output: string
  error: string | null
}

export function formatJson(input: string, indent = 2): FormatResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { output: '', error: 'Please enter or paste JSON.' }
  }
  try {
    const parsed = JSON.parse(trimmed)
    const output = JSON.stringify(parsed, null, indent)
    return { output, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON.'
    return { output: '', error: msg }
  }
}

export function minifyJson(input: string): FormatResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { output: '', error: 'Please enter or paste JSON.' }
  }
  try {
    const parsed = JSON.parse(trimmed)
    const output = JSON.stringify(parsed)
    return { output, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON.'
    return { output: '', error: msg }
  }
}
