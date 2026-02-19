import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WebsiteAnalyzer from './pages/WebsiteAnalyzer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <WebsiteAnalyzer/>
  </StrictMode>,
)
