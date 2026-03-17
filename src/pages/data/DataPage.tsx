import { useState } from 'react'
import { JsonToCsv } from './JsonToCsv'
import { JsonFormatter } from './JsonFormatter'
import { YamlValidator } from './YamlValidator'
import { Base64Encoder } from './Base64Encoder'
import { RegexTester } from './RegexTester'
import '../../App.css'
import './DataPage.css'

const TABS = [
  { id: 'json-csv', label: 'JSON → CSV' },
  { id: 'json-fmt', label: 'JSON Formatter' },
  { id: 'yaml', label: 'YAML Validator' },
  { id: 'base64', label: 'Base64' },
  { id: 'regex', label: 'Regex' },
] as const

type TabId = (typeof TABS)[number]['id']

export function DataPage() {
  const [active, setActive] = useState<TabId>('json-csv')

  return (
    <div className="page-wrap">
      <h1 className="page-title">Data &amp; text</h1>
      <div className="page-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab ${active === tab.id ? 'active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="page-content">
        {active === 'json-csv' && <JsonToCsv />}
        {active === 'json-fmt' && <JsonFormatter />}
        {active === 'yaml' && <YamlValidator />}
        {active === 'base64' && <Base64Encoder />}
        {active === 'regex' && <RegexTester />}
      </div>
    </div>
  )
}
