import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LayoutProvider } from './hooks/useLayout'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LayoutProvider>
        <App />
      </LayoutProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
