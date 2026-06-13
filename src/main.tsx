import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { TRPCProvider } from './lib/trpc-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TRPCProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TRPCProvider>
  </StrictMode>,
)
