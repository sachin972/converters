import { UuidGenerator } from './UuidGenerator'
import '../../App.css'
import './GeneratorsPage.css'

export function GeneratorsPage() {
  return (
    <div className="page-wrap">
      <h1 className="page-title">Generators</h1>
      <div className="page-content">
        <UuidGenerator />
      </div>
    </div>
  )
}
