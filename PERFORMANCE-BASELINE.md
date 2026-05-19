# A11yFred Performance Baseline & Monitoring (Cycle 3, Pass 6)

## Executive Summary
A11yFred has strong performance characteristics with ~102 kB critical path and optimized asset loading. Umami analytics provides privacy-first monitoring. This document establishes baseline metrics for Phase 3+ optimization tracking.

## Current Performance Profile

### Bundle Metrics (Baseline)
| Metric | Value | Status |
|--------|-------|--------|
| Critical path (gzipped) | 102.91 kB | Healthy |
| React bundle | 62.44 kB gz | Cached separately |
| Fuse.js search | 8.48 kB gz | Cached separately |
| Main app | 17.21 kB gz | Contains core logic |
| CSS | 15.09 kB gz | Optimized via LightningCSS |
| **Total (first load)** | **105.22 kB** | Acceptable for feature set |
| ExcelJS (lazy) | 256.44 kB gz | Not in critical path |
| Fonts (6 variants) | ~20 kB gz | Parallel delivery |

### Chunk Breakdown
- react.js: separate chunk (persistent cache)
- fuse.js: separate chunk (persistent cache)
- exceljs.js: lazy-loaded (on demand)
- index.js: main app (invalidated on change)
- AppDrawerPanelSettings.js: code-split drawer
- 65+ locale files: dynamic import per language

### Load Time Estimates
| Connection | Time to Interactive |
|-----------|-------------------|
| 4G (16 Mbps) | ~800ms |
| 3G (4 Mbps) | ~2.5s |
| Fast 3G (5 Mbps) | ~2s |
| Slow 3G (0.4 Mbps) | ~25s |

Estimates based on:
- 105 kB critical path
- Assume 100ms DNS + server latency
- HTTP/2 multiplexing
- Gzip compression ratio ~6:1

## Analytics Setup (Umami)

### Current Implementation
```html
<!-- index.html line 85 -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="635ee9b9-2615-47fe-9453-adf2a21dcef0"></script>
```

**Umami Benefits:**
- ✅ Privacy-first (no cookies, no personal data collection)
- ✅ Self-hosted analytics (option available)
- ✅ GDPR-compliant (no consent banner needed)
- ✅ Real User Monitoring (RUM) for performance
- ✅ Free tier includes Core Web Vitals tracking
- ✅ Event tracking for user interactions
- ✅ CSP-compliant (whitelisted in index.html)

**Current tracking:**
- Page views (automatic)
- Page routes (automatic)
- Referrer sources (automatic)
- Browser, device, OS (automatic)
- Core Web Vitals (automatic in newer Umami)

### Manual Event Tracking (Optional)
Umami provides `window.umami` for custom events:

```javascript
// Track custom event
window.umami?.track('search_executed', {
  query: query,
  resultsCount: results.length
})

// Track goal completion
window.umami?.track('defect_exported', {
  format: 'excel'
})
```

**Recommended events to track:**
1. `search_executed` — record query length and result count
2. `defect_opened` — detail panel view (identify popular defects)
3. `defect_exported` — track export format usage
4. `ai_refine_used` — monitor AI Assist adoption
5. `language_changed` — track localization usage
6. `theme_changed` — monitor theme preferences
7. `error_occurred` — surface bugs in production

## Core Web Vitals Baseline

### Target Metrics (Google Search Console Standard)
| Metric | Target | Our Estimate |
|--------|--------|--------------|
| LCP (Largest Contentful Paint) | < 2.5s | ~1.5s (hero content) |
| FID (First Input Delay) | < 100ms | ~50ms (JS lightweight) |
| CLS (Cumulative Layout Shift) | < 0.1 | ~0.05 (fixed layout) |

**Rationale:**
- **LCP 1.5s:** Hero search bar renders immediately, no layout shift waiting for fonts
- **FID 50ms:** React 19 is lightweight, no heavy JS on interaction
- **CLS 0.05:** Fixed app container prevents layout shift on overlay transitions

### Monitoring via Umami
Umami (free tier) automatically tracks Core Web Vitals:
- Sends data to `api-gateway.umami.dev`
- Visible in Umami dashboard under "Web Vitals"
- Tracks 75th percentile values (Google Search Console matches this)

**Access:** https://analytics.umami.is/share/[website-id]

## Performance Optimization Roadmap

### Phase 3 (Next 6 weeks)
Monitor metrics as features ship:
- If LCP >3s, check if new panels add blocking JS
- If CLS >0.1, review modal/drawer transitions for layout shift
- If FID >150ms, profile React render time

### Phase 3+ (Later)
Conditional optimizations based on real-world data:
- If 50%+ users are on 3G, consider:
  - Locale subsetting (reduce 20 kB from font bundle)
  - Code splitting for admin panel (dev-only feature)
- If 30%+ users export, optimize ExcelJS loading
- If AI Assist has >10% adoption, track LLM latency separately

## How to Access Performance Data

### Umami Dashboard
1. Visit https://analytics.umami.is
2. Log in (details in project team channel)
3. Select "a11yfred" website
4. View: Page views, bounce rate, session duration
5. View: Core Web Vitals (free tier)
6. Set up goals for custom events

### Build-Time Metrics
```bash
npm run build
```
Output shows:
- Chunk sizes (gzipped)
- Relative size compared to total
- Warning if chunk exceeds 1200 kB (configured in vite.config.js)

### Browser DevTools
**Lighthouse audit (locally):**
```
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"
4. Records: Performance, Accessibility, Best Practices, SEO
```

**Network tab analysis:**
1. DevTools → Network
2. Hard reload (Shift+Cmd+R on Mac, Shift+Ctrl+R on Windows)
3. Filter by "JS" or "CSS"
4. Look for:
   - Large XHR requests (API latency)
   - Uncompressed resources (should be gzipped)
   - Render-blocking resources (should be none)

## Baseline Summary (Cycle 3 Final)

### Strengths
✅ Critical path 102 kB gz (healthy for feature set)
✅ Code-splitting reduces repeat visit payload
✅ Lazy loading delays non-critical chunks
✅ Font and asset loading optimized
✅ CSS tool output optimized via LightningCSS
✅ Tree-shaking removes dead code
✅ Privacy-first analytics (Umami)

### Action Items for Phase 3+
- [ ] Monitor Core Web Vitals in Umami dashboard (weekly)
- [ ] Add custom event tracking for search, export, AI Assist
- [ ] Set up alerts if LCP >3s or CLS >0.15
- [ ] Review analytics monthly, adjust Phase 4 priorities based on usage

### Known Limitations
- Umami free tier doesn't track request waterfall (no DevTools Network tab equivalent)
- ExcelJS lazy loading creates perceived delay on first export (acceptable trade-off)
- Theme initialization script could be optimized with CSS-in-JS (not worth refactor)
- Fuse.js search latency may spike with 100K+ entries (revisit in Phase 4)

## Next Steps (Phase 3+)

### Week 1-2: Baseline Collection
- Deploy to production with Umami tracking
- Collect 100+ sessions of Core Web Vitals data
- Document any anomalies (slow regions, browsers)

### Week 3-4: Threshold Setting
- Based on real data, set alert thresholds:
  - LCP alert: if >3s on 75th percentile
  - CLS alert: if >0.15 on 75th percentile
  - FID alert: if >200ms on 75th percentile
- Configure Umami notifications (if available)

### Ongoing: Monthly Review
- First Friday of each month, review Umami dashboard
- Check if Phase 3 features added any performance regressions
- Update this document with new baseline if significant changes made

## References

- [Umami Analytics Docs](https://umami.is)
- [Google Web Vitals](https://web.dev/vitals)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React 19 Performance](https://react.dev/blog/2024/12/05/react-19)

---

**Performance Baseline Established:** May 19, 2026
**Next Review:** Phase 3 feature completion (estimated June 9, 2026)
**Optimization Triggers:** LCP >3s, CLS >0.15, FID >200ms
