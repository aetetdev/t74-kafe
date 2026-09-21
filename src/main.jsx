import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './store/StoreContext'
import { CafeProvider } from './store/CafeContext'
import { TenantProvider } from './store/TenantContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <StoreProvider>
          <CafeProvider>
            <App />
          </CafeProvider>
        </StoreProvider>
      </TenantProvider>
    </BrowserRouter>
  </StrictMode>
)
