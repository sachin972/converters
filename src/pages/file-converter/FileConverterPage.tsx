import { FileConverter } from './FileConverter'
import '../../App.css'
import './FileConverterPage.css'

export function FileConverterPage() {
  return (
    <div className="page-wrap">
      <h1 className="page-title">File converter</h1>
      <div className="page-content">
        <FileConverter />
      </div>
    </div>
  )
}
