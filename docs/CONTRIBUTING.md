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

The **public** corpus lives in `src/data/corpus.json`. Each entry follows this schema:

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

Descriptions and remediation should be written at a plain reading level — short sentences, common words, no jargon without explanation. Write as if explaining the issue to a developer who has never done accessibility work before. Source from publicly available guidance (WCAG Understanding docs, axe-core rules, Deque University, WebAIM).

---

## Submitting a pull request

1. Fork the repo and create a branch: `git checkout -b add-defect-ath-052`
2. Make your changes
3. Open a pull request with a short description of what you added or changed
4. If adding defects, mention the WCAG success criterion and the public source/reference

---

## Bug reports and feature requests

Open a GitHub Issue. No template required — just describe what you saw or what you'd like to see.

---

## Pull request template

A PR template lives at `.github/PULL_REQUEST_TEMPLATE.md` and loads automatically when you open a pull request on GitHub. Fill out the relevant sections — you can delete any that don't apply to your change.

---

## What's not in scope

The corpus in this repo (`corpus.json`) is the **public** version — entries sourced entirely from publicly available accessibility guidance (WCAG, WebAIM, Deque, axe-core). Private or personal audit data will not be accepted.
