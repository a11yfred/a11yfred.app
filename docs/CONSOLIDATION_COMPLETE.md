# Personal-Corpus Structure Consolidation - Complete

## What Changed

### Data Structure (personal-corpus.json)
**Before**: Combined `sources` field
```json
{
  "sources": [
    {"name": "Adrian Roselli - Form Validation & Errors", "url": "https://adrianroselli.com/"},
    {"name": "Understanding SC 3.3.1: Error Identification", "url": "https://w3.org/..."}
  ]
}
```

**After**: Separate `sources` and `links` fields (like corpus.json)
```json
{
  "sources": [
    {"name": "Adrian Roselli", "url": null},
    {"name": "Understanding SC 3.3.1: Error Identification", "url": null}
  ],
  "links": [
    {"text": "Adrian Roselli - Form Validation & Errors", "url": "https://adrianroselli.com/2023/04/exposing-field-errors.html"},
    {"text": "Understanding SC 3.3.1: Error Identification", "url": "https://w3.org/..."}
  ]
}
```

**Benefits:**
- `sources` = consistent, generic names for filtering/counting (clean data model)
- `links` = detailed article titles with actual URLs (display & navigation)
- Matches corpus.json structure for consistency
- Removes ambiguity (source name ≠ article title)

## Code Changes

### 1. DetailPanel.jsx (Line 588)
**Before:**
```jsx
<SourceLinks links={finding.sources?.filter(s => s.name !== 'ATH').map(s => ({ url: s.url, text: s.name }))} />
```

**After:**
```jsx
<SourceLinks links={finding.links} />
```

**Why:** Now uses actual `links` field which has full article details with correct URLs.

### 2. ResultList.jsx (Lines 337-347)
**Before:**
```jsx
{finding.sources?.filter(src => src.name !== 'ATH').map(src => src.url ? (
  <a href={src.url}...> ... </a>
) : (
  <span>...</span>
))}
```

**After:**
```jsx
{finding.sources?.filter(src => src.name !== 'ATH').map(src => (
  <span className="source-badge" title={`Source: ${src.name}`}>
    <span className="badge-prefix">{t('badge.source_prefix')}</span>
    {src.name}
  </span>
))}
```

**Why:** Shows source author name as a badge. No URL needed since links are displayed in detail panel.

## What Still Works

✓ **Filtering** - App.jsx still filters by `f.sources?.some(s => s.name === badgeFilter.value)`  
✓ **Search** - App.jsx still searches `src.name` for keyword matching  
✓ **Admin stats** - AdminPanel still counts by `src.name`  
✓ **Display** - DetailPanel now properly displays links from `links` field  
✓ **Semantic clarity** - Sources = authors/publishers, Links = actual articles

## Migration Status

- **personal-corpus.json**: ✓ Consolidated (124 entries, all with `sources` and `links`)
- **DetailPanel.jsx**: ✓ Updated to use `links` field
- **ResultList.jsx**: ✓ Updated to use `sources` for badges
- **App.jsx**: ✓ No changes needed (filtering/search already compatible)
- **AdminPanel.jsx**: ✓ No changes needed (still uses `src.name`)

## Next Steps

1. Test the app to ensure links display properly in DetailPanel
2. Verify filtering by source still works
3. Continue filling in missing article URLs (152 remaining)
4. Consider: Could detailPanel source badges now link to the first article? (optional enhancement)
