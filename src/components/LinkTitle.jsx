import { useEffect, useState } from 'react'

export default function LinkTitle({ url, fallback }) {
  const [title, setTitle] = useState(fallback)

  const decodeHtml = (html) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  useEffect(() => {
    if (!url) return

    // Skip fetching for WCAG Understanding pages - use the slug-generated title
    if (url.includes('w3.org/WAI/WCAG')) return

    // Try to fetch page title from meta tags
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    fetch(url, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          return null
        }
        return response.text()
      })
      .catch(() => {
        // CORS errors or timeout - keep the initial title
        return null
      })
      .then(html => {
        clearTimeout(timeoutId)
        if (!html) return
        // Extract title from <title> tag
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (titleMatch?.[1]) {
          const rawTitle = decodeHtml(titleMatch[1]).trim()
          // Clean up overly long titles by taking just the main part before separators
          const cleanTitle = rawTitle.split(/\s*[|·—-]\s*/)[0].trim()
          setTitle(cleanTitle || rawTitle)
          return
        }
        // Extract from og:title as fallback
        const ogMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
        if (ogMatch?.[1]) {
          setTitle(decodeHtml(ogMatch[1]).trim())
        }
      })

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [url])

  return title
}
