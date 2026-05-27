# Contributing to A11yFred

Contributions are welcome! Whether you are adding new defect entries, correcting keyboard flows, reporting accessibility bugs, or expanding locale files, we appreciate your help in making accessibility testing tools better.

---

## 1. Setup & Local Development

To run the application locally:

```bash
git clone https://github.com/a11yfred/a11yfred
cd a11yfred
npm install
npm run dev   # Runs the dev server at http://localhost:5173
```

---

## 2. Improving Accessibility & Custom Code

We strive to maintain WCAG 2.2 AA standards. If you are proposing UI changes or fixing keyboard/screen reader bugs:

- **Review the Accessibility Architecture**: Read our [Accessibility Design Document](ACCESSIBILITY.md) to understand how focus, landmarks, and live regions are handled.
- **Focus Order & Management**: Never break the focus loop. Ensure that when dialogs/panels close, focus returns to the triggering button.
- **Tab Sequence and Interactivity**: Form controls should use `aria-disabled` rather than native `disabled` to preserve keyboard discoverability, unless they are native controls inside basic forms.
- **Linters**: Run `npm run lint` before committing to ensure the code passes ESLint (`eslint-plugin-jsx-a11y` and `@a11yfred/neighbor` custom rules), Stylelint, and Markdownlint.

---

## 3. Contributing Defect Entries

Corpus entries reside in `src/data/corpus.json`. When suggesting a new defect or writing description overlays:

- **Sources**: Entries must contain at least 2 public expert references (e.g. WebAIM, Deque, Adrian Roselli).
- **Language**: Use plain language and avoid speculative sentences. Descriptions should explain what the barrier is, and fixes should use direct, imperative verbs (e.g., "Use a native button" instead of "Ensure you should use a button").
- **IDs**: Increment from the highest existing `ACC-` ID in the file.

---

## 4. Submitting a Pull Request

1. Fork the repository and create a branch (e.g., `feature/improve-skip-links` or `bugfix/acc-112-focus-loop`).
2. Implement your changes, verifying with keyboard navigation or a screen reader (NVDA/VoiceOver) if editing UI components.
3. Verify that the build and lint commands pass:

   ```bash
   npm run lint
   npm run build
   ```

4. Submit the PR on GitHub, filling out the PR template detail sections.
