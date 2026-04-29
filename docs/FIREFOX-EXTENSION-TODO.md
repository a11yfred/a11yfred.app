# Firefox Extension Pre-Launch Checklist

## Required before submission

- [ ] Add PNG icons at 16, 48, and 96px — reference them in `manifest.json` under `"icons"` and `"sidebar_action.default_icon"`
- [ ] Load temporarily in Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → pick `dist-extension-firefox/manifest.json`
- [ ] Test in Firefox: search, copy, settings save, AI refine (confirm fetch to external APIs is not blocked)
- [ ] Create an account on addons.mozilla.org (AMO) and register the extension ID `a11ytexthelper@mikeyilagan.com`
- [ ] Sync version in `manifest.json` with `package.json` before each release
- [ ] Submit build zip to AMO for review (AMO requires source code submission for minified JS)

## Key difference from Chrome build

- No background script — Firefox opens the sidebar automatically via `sidebar_action`
- Use `browser.*` APIs (not `chrome.*`) if adding any extension API calls in the future; Firefox does not alias `chrome` for all MV3 APIs
