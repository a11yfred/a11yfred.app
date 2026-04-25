import { createContext, useContext, useMemo } from 'react'
import en from './en.json'
import es from './es.json'
import fr from './fr.json'
import de from './de.json'
import nl from './nl.json'
import ja from './ja.json'
import tl from './tl.json'
import zh from './zh.json'
import ko from './ko.json'
import sv from './sv.json'

const MESSAGES = { en, es, fr, de, nl, ja, tl, zh, ko, sv }

const I18nContext = createContext(null)

export function I18nProvider({ locale, children }) {
  const t = useMemo(() => {
    const msgs = MESSAGES[locale] ?? MESSAGES.en
    return (key, vars) => {
      let str = msgs[key] ?? MESSAGES.en[key] ?? key
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        })
      }
      return str
    }
  }, [locale])

  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>
}

export function useT() {
  return useContext(I18nContext)
}
