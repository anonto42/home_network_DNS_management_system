import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LayoutProvider } from './hooks/useLayout'
import { AuthProvider } from '@/features/auth'
import { ThemeProvider } from './hooks/useTheme'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LayoutProvider>
            <App />
          </LayoutProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
