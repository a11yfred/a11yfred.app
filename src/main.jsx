import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Axe a11y runtime checks, dev only, never included in the production bundle
if (import.meta.env.DEV) {
  Promise.all([import('@axe-core/react'), import('react-dom')]).then(
    ([{ default: axe }, { default: ReactDOMCompat }]) => {
      axe(React, ReactDOMCompat, 1000)
    }
  )
}
import './reset.css'
import '@fontsource/inter/latin-ext-400.css'
import '@fontsource/inter/latin-ext-500.css'
import '@fontsource/inter/latin-ext-600.css'
import '@fontsource/inter/latin-ext-700.css'
import './tokens.css'
import './typography.css'
import './plugins/router/router.css'
import './components/ui/ui.css'
import './index.css'
import './locales.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
