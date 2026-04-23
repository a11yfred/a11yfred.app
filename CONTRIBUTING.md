# Contributing to A11yTextHelper

Thanks for your interest. Contributions are welcome — especially defect entries, keyword improvements, and bug fixes.

---

## Getting started

```bash
git clone https://github.com/<your-username>/a11ytexthelper
cd a11ytexthelper
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Adding defect entries

The corpus lives in `src/data/defects.json`. Each entry follows this schema:

```json
{
  "id": "ATH-052",
  "title": "Defect Title",
  "sc": "1.1.1",
  "scLabel": "1.1.1 Non-text Content (Level A)",
  "related": ["4.1.2 Name, Role, Value (Level A)"],
  "priority": "Critical",
  "platform": "web",
  "keywords": ["keyword1", "keyword2", "element name", "component"],
  "desc": "Defect description text.",
  "rem": "Possible remediation steps."
}
```

**`platform`**: `"web"` / `"native"` / `"both"`

**`priority`**: `Critical` / `High` / `Medium` / `Low` / `Best Practice`

**`id`**: increment from the highest existing `ATH-` number.

**`keywords`** drive Fuse.js relevance — include the element name, component type, issue type, and any terms an auditor would naturally search for.

Descriptions and remediation should be concise, technical, and written in the same direct voice as existing entries.

---

## Submitting a pull request

1. Fork the repo and create a branch: `git checkout -b add-defect-ath-052`
2. Make your changes
3. Open a pull request with a short description of what you added or changed
4. If adding defects, mention the WCAG success criterion and source/reference if applicable

---

## Bug reports and feature requests

Open a GitHub Issue. No template required — just describe what you saw or what you'd like to see.

---

## What's not in scope

The defect corpus in this repo is the public version, sourced from publicly available accessibility guidance (WCAG, WebAIM, Deque, axe-core). Private audit data is out of scope and will not be accepted.
