import { useState } from 'react'
import { SalaryCalculator } from './SalaryCalculator'
import { EmiCalculator } from './EmiCalculator'
import '../../App.css'
import './CalculatorsPage.css'

const TABS = [
  { id: 'salary', label: 'Salary after tax' },
  { id: 'emi', label: 'EMI Calculator' },
] as const

type TabId = (typeof TABS)[number]['id']

export function CalculatorsPage() {
  const [active, setActive] = useState<TabId>('salary')

  return (
    <div className="page-wrap">
      <h1 className="page-title">Calculators</h1>
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
        {active === 'salary' && <SalaryCalculator />}
        {active === 'emi' && <EmiCalculator />}
      </div>
    </div>
  )
}
