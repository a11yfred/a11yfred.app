# Chrome Extension Pre-Launch Checklist

## Required before submission

- [ ] Add PNG icons at 16, 48, and 128px (`extension-static/icons/icon16.png`, etc.) and reference them in `manifest.json`
- [ ] Load unpacked from `dist-extension/` and manually test: search, copy, settings save, AI refine
- [ ] Confirm AI provider fetch calls work in side panel context (no CSP errors in DevTools)
- [ ] Sync version in `manifest.json` with `package.json` before each release
- [ ] Write a Chrome Web Store listing description and prepare a screenshot of the side panel

## Nice to have

- [ ] Migrate `localStorage` to `chrome.storage.sync` so pins/ratings follow the user across devices
- [ ] Add a `web_accessible_resources` entry if any assets need to be exposed to page content scripts
