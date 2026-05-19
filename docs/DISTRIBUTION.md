# Distribution Guide

Publishing A11yFred extensions and Electron app to app stores and distribution channels.

---

## Chrome Web Store

### Prerequisites

- Google Developer account ($5 one-time registration fee at [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole))

### Submission Steps

1. **Build the extension**

   ```bash
   npm run build:extension
   ```

   Output: `dist-extension/` folder

2. **Prepare upload package**

   - Zip the entire `dist-extension/` folder (Vite output, not source)
   - File: `a11yfred-chrome-extension.zip`

3. **Create store item**

   - Log in to Chrome Web Store Developer Console
   - Create new item
   - Upload the zip file

4. **Fill in store listing**

   - **Name:** A11yFred
   - **Description (140 chars max):** Accessible entry reference for web, iOS, and Android -- search, filter, copy, refine entries
   - **Detailed Description:** Full description from README
   - **Screenshots:**
     - 1280x800px or 640x400px minimum
     - Show key features: search, filter, detail panel, settings
     - Include both light and dark theme screenshots
   - **Promotional image (440x280px):** Feature graphic for store listing
   - **Icon (128x128px):** Already in extension-static/icons/

5. **Set visibility and submit**

   - Visibility: Public
   - Submit for review
   - Expected review time: 1–3 business days for new extensions, faster for updates

### Updates

1. Increment version in `extension-static/manifest.json`
2. Run `npm run build:extension` and re-zip
3. Upload in Chrome Web Store Console
4. Submit for review

---

## Firefox Add-ons (AMO)

### Prerequisites

- Mozilla account (free) at [AMO Developers](https://addons.mozilla.org/developers)

### Submission Steps

1. **Build the extension**

   ```bash
   npm run build:extension
   ```

   (Same build; Firefox reads `extension-firefox-static/manifest.json` at runtime)

2. **Prepare upload packages**

   - Zip `dist-extension/` folder → `a11yfred-firefox-extension.zip`
   - Zip entire source repository → `a11yfred-source.zip`
   - AMO requires source code for review of minified code

3. **Submit at AMO**

   Go to [AMO Submit](https://addons.mozilla.org/en-US/developers/addons/submit/)

   - Choose "Upload Version"
   - Upload extension zip
   - Upload source code zip
   - Fill in listing details

4. **Fill in store listing**

   - **Name:** A11yFred
   - **Summary (50 chars max):** Accessible entry reference for web and mobile
   - **Description:** Full description from README
   - **Screenshots (800x600px or 1024x768px):** Same as Chrome (light + dark themes)
   - **Icons:** Same as Chrome
   - **Category:** Accessibility
   - **Permissions justification:** "Reads the active tab to display entries in the side panel"

5. **Submit for review**

   - AMO review for new add-ons: manual review, 1–7 days (can be longer during high volume)
   - Updates to approved add-ons: often same-day auto-approval if code changes are minimal

### Self-Distribution (Optional)

To bypass AMO and distribute directly:

1. Sign the .xpi with an AMO API key:

   ```bash
   npx web-ext sign --api-key=YOUR_KEY --api-secret=YOUR_SECRET
   ```

   (Generate keys at [AMO API](https://addons.mozilla.org/en-US/developers/addon/a11yfred/edit))

2. Distribute the signed `.xpi` file directly
3. Users install via `about:addons` (drag-and-drop) or direct download link

---

## Electron: Mac, Windows, Linux

### Prerequisites

- **Node/npm:** Already set up
- **electron-builder:** Already installed (dev dependency)
- **Icons:**
  - `build/icon.png` (512×512, source for Linux and macOS)
  - `build/icon.icns` (macOS App Bundle)
  - `build/icon.ico` (Windows)
  - **Tools to generate:** `electron-icon-builder` or `icns-gen` from PNG

### Build Steps

1. **Add app icons**

   ```text
   build/
   ├── icon.png      (512×512)
   ├── icon.icns     (macOS)
   └── icon.ico      (Windows)
   ```

2. **Build Electron app**

   ```bash
   npm run build          # Build web assets to dist/
   npx electron-builder  # (or add script: "dist": "electron-builder")
   ```

3. **Output by platform**

   - **macOS:** `dist/A11yFred-x.x.x.dmg` (installer), `dist/A11yFred-x.x.x.app` (bundle)
   - **Windows:** `dist/A11yFred-x.x.x.exe` (NSIS installer)
   - **Linux:** `dist/a11yfred-x.x.x.AppImage` (portable), `.deb`, `.rpm` (if configured)

### Code Signing

#### macOS (Required for distribution)

- **Apple Developer Account:** $99/year
- **Developer ID Application Certificate:** From Apple Developer
- **Notarization:**
  1. Sign the app with your certificate (electron-builder does this if `certificateFile` and `certificatePassword` are set)
  2. Upload to Apple Notary Service via `notarytool`
  3. Staple the notarization ticket to the app
- **Without signing:** Users see Gatekeeper warning ("cannot be opened because the developer cannot be verified")

#### Windows (Recommended)

- **Code-signing certificate:** DigiCert, Sectigo, or Microsoft Trusted Signing (Azure, often cheaper)
- **Without signing:** Windows Defender SmartScreen shows warning on first run (users can dismiss)

#### Linux

- No signing required

### Distribution Channels

#### GitHub Releases (Recommended)

1. Tag the commit: `git tag v1.0.0`
2. Push tag: `git push origin v1.0.0`
3. Create GitHub Release from tag
4. Attach built artifacts:
   - `A11yFred-x.x.x.dmg` (macOS)
   - `A11yFred-x.x.x.exe` (Windows)
   - `a11yfred-x.x.x.AppImage` (Linux portable)
5. Users download directly from releases page

#### Mac App Store

- **Requirements:**
  - Separate `mas` build target in electron-builder config
  - App Store provisioning profile
  - Apple Developer account ($99/yr)
  - Apple review process (manual, 1–5 days)
- **Tradeoffs:** Sandboxing restrictions, update control via App Store, reach Apple's ecosystem
- **Status:** Most Electron apps skip this and use GitHub Releases instead

#### Windows Store (MSIX)

- **Requirements:**
  - Microsoft Partner Center account
  - electron-builder configured for `appx` target
  - Microsoft review (optional but recommended)
- **Tradeoffs:** Reach Windows users searching the Store, but store submission process is slower
- **Status:** Optional; GitHub Releases sufficient for most use cases

#### Linux (Snap / Flathub)

- **Snapcraft:** electron-builder can produce Snap packages

  ```bash
  npx electron-builder --linux snap
  ```

  - Deploy to Snapcraft Store

- **Flathub:** Submit manifest PR to Flathub
  - More work upfront, but reaches apt/dnf users

- **Status:** Optional; AppImage alone covers most desktop Linux users

### Cross-Compilation

- **macOS targets** (`.dmg`, `.app`): Requires a Mac or macOS CI runner (GitHub Actions `macos-latest`)
- **Windows targets** (`.exe`): Can cross-compile from Linux/macOS with limitations
- **Linux targets** (`.AppImage`, `.deb`, `.rpm`): Can cross-compile from Windows/macOS with limitations
- **Recommended:** Use GitHub Actions with matrix strategy (`macos-latest`, `windows-latest`, `ubuntu-latest`) for all three platforms in one CI run

### Updates

Use `electron-updater` for auto-updates:

1. Publish new release to GitHub
2. App automatically checks and downloads update
3. Users restart to apply (or auto-restart on idle if configured)

---

## Testing Before Distribution

- [ ] **Manual smoke test** on target OS (macOS, Windows, Linux)
- [ ] **App icon visibility** at various zoom levels
- [ ] **Signature verification** (if signed)
- [ ] **Auto-update check** (if using electron-updater)
- [ ] **Store submission screenshots** (all platforms)
- [ ] **Store listing text** for accuracy and tone
