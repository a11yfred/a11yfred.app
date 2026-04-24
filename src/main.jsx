import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Axe a11y runtime checks — dev only, never included in the production bundle
if (import.meta.env.DEV) {
  Promise.all([import('@axe-core/react'), import('react-dom')]).then(
    ([{ default: axe }, { default: ReactDOMCompat }]) => {
      axe(React, ReactDOMCompat, 1000)
    }
  )
}
import './tokens.css'
import './typography.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
