import { useState } from 'react'
import { PngToPdf } from './PngToPdf'
import { ImageCompressor } from './ImageCompressor'
import { PdfCompressor } from './PdfCompressor'
import '../../App.css'
import './ImagesPage.css'

const TABS = [
  { id: 'png-pdf', label: 'PNG → PDF' },
  { id: 'compressor', label: 'Image Compressor' },
  { id: 'pdf-compressor', label: 'PDF Compressor' },
] as const

type TabId = (typeof TABS)[number]['id']

export function ImagesPage() {
  const [active, setActive] = useState<TabId>('png-pdf')

  return (
    <div className="page-wrap">
      <h1 className="page-title">Images</h1>
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
        {active === 'png-pdf' && <PngToPdf />}
        {active === 'compressor' && <ImageCompressor />}
        {active === 'pdf-compressor' && <PdfCompressor />}
      </div>
    </div>
  )
}
