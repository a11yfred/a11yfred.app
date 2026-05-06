# Electron App Pre-Launch Checklist

## Required before distribution

- [ ] Add app icons: `build/icon.icns` (macOS), `build/icon.ico` (Windows), `build/icon.png` (Linux) — electron-builder references these paths
- [ ] Test `npm run electron:dev` end-to-end: search, copy, settings save, AI refine with a real key
- [ ] Verify API keys persist across restarts (safeStorage + fs now wired — confirm on each target OS)
- [ ] Code-sign the macOS build (requires Apple Developer account + certificate in CI)
- [ ] Test the Windows NSIS installer on a clean machine

## Nice to have

- [ ] Add a native app menu (File, Edit, Help) via `Menu.buildFromTemplate` in main.js
- [ ] Persist window size and position across launches (`electron-store` or manual fs write)
- [ ] Add `electron-updater` for auto-update via GitHub Releases
- [ ] Wire `window.electronAPI.theme.onChange` in App.jsx so OS dark/light switches apply live without a restart
- [ ] Use `dialog.showOpenDialog` for XLSX import instead of the browser file input (optional — browser input works fine in Electron)
