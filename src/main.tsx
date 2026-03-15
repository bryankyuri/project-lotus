import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App'
import { DeviceProvider } from './contexts/DeviceContext'
import { ToastProvider } from './components/ui/Toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DeviceProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </DeviceProvider>
  </StrictMode>,
)
