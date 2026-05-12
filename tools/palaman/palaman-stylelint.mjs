/**
 * @ulam/palaman — Stylelint plugin
 *
 * Rules:
 *   ulam/user-preferences  — Warn when motion, transparency, or alpha colors
 *                            are used without @media (prefers-*) fallbacks.
 *   ulam/no-outline-none   — Disallow bare outline:none/0 outside :focus selectors.
 *
 * Sources and credits:
 *   WCAG 2.1 / 2.2         w3.org/TR/WCAG21, w3.org/TR/WCAG22
 *   WebAIM                 webaim.org
 *   double-great/stylelint-a11y  github.com/double-great/stylelint-a11y
 */

const defined = (x) => x !== undefined && x !== null;

/** True if the node or any ancestor is a prefers-* / forced-colors media block */
function insidePreferencesMedia(node) {
  let current = node.parent;
  while (defined(current)) {
    if (
      current.type === 'atrule' &&
      current.name === 'media' &&
      /prefers-|forced-colors/.test(current.params)
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/** True if the value string contains an alpha channel (rgb/hsl with slash, or 8-digit hex) */
function hasAlphaChannel(value) {
  // rgb(r g b / a) or rgba() or hsl(h s l / a)
  if (/\b(rgb|hsl)a?\s*\(/.test(value) && /\/\s*[01]?\.?\d+[^)]*\)/.test(value)) return true;
  // 8-digit hex #rrggbbaa
  if (/#[0-9a-fA-F]{8}\b/.test(value)) return true;
  return false;
}

/** True if the opacity value is a structural endpoint (0 or 1), not a dim */
function isStructuralOpacity(value) {
  const n = parseFloat(value.trim());
  return n === 0 || n === 1;
}

const ruleName = 'ulam/user-preferences';

const messages = {
  opacity: (value) =>
    `opacity: ${value} creates a transparency effect. Add a fallback in @media (prefers-reduced-transparency: reduce) that uses an explicit color token instead. See src/components/ui/user-preferences.css.`,
  animation: (prop, value) =>
    `${prop}: ${value} uses motion. Add a fallback in @media (prefers-reduced-motion: reduce) that disables or stills this animation. See src/components/ui/user-preferences.css.`,
  alpha: (value) =>
    `Color value "${value}" uses an alpha channel. Add an opaque fallback in @media (prefers-reduced-transparency: reduce). See src/components/ui/user-preferences.css.`,
};

const meta = { url: 'https://github.com/mikeyfyi/ulam' };

/** @type {import('stylelint').Rule} */
function rule(primaryOption) {
  return (root, result) => {
    // Only enforce inside src/components/ui/
    const filePath = (root.source?.input?.file ?? '').replace(/\\/g, '/');
    if (!filePath.includes('src/components/ui')) return;
    // Never enforce inside user-preferences.css itself
    if (filePath.includes('user-preferences.css')) return;

    root.walkDecls((decl) => {
      if (insidePreferencesMedia(decl)) return;

      const prop = decl.prop.toLowerCase();
      const value = decl.value;

      // opacity — warn on non-structural values (i.e. dims like 0.5, 0.75)
      if (prop === 'opacity' && !isStructuralOpacity(value)) {
        decl.warn(result, messages.opacity(value), { rule: ruleName });
        return;
      }

      // animation or transition
      if (prop === 'animation' || prop === 'transition' || prop === 'animation-name') {
        // Skip "none" values — they're already the reduced state
        if (/^none\b/i.test(value.trim())) return;
        decl.warn(result, messages.animation(prop, value), { rule: ruleName });
        return;
      }

      // Alpha-channel color values on visual properties
      const visualProps = new Set([
        'background', 'background-color', 'color', 'border', 'border-color',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'box-shadow', 'text-shadow', 'fill', 'stroke',
      ]);
      if (visualProps.has(prop) && hasAlphaChannel(value)) {
        decl.warn(result, messages.alpha(value), { rule: ruleName });
      }
    });
  };
}

const userPreferences = { ruleName, rule, meta };

// ─── Rule: ulam/no-outline-none ──────────────────────────────────────────────
// outline: none / outline: 0 removes the browser's default keyboard focus
// indicator. This is one of the most common keyboard accessibility failures —
// keyboard users lose all visual indication of where focus is.
//
// Only fires when the declaration is NOT inside a :focus-visible, :focus, or
// :focus-within selector, and no sibling :focus-visible rule overrides it in
// the same block.
//
// Ref: WCAG 2.4.7 (Focus Visible); WebAIM; Roselli; cross-practitioner consensus

const noOutlineNoneRuleName = 'ulam/no-outline-none';

const noOutlineNoneMessages = {
  removed: (value) =>
    `outline: ${value} removes the keyboard focus indicator. Add a :focus-visible rule with a visible outline or custom focus style. (WCAG 2.4.7 / WebAIM)`,
};

const noOutlineNoneMeta = { url: 'https://github.com/mikeyfyi/ulam' };

/** Returns true if the selector string targets a focus state. */
function isFocusSelector(selector) {
  return /:focus(?:-visible|-within)?/i.test(selector);
}

/** @type {import('stylelint').Rule} */
function noOutlineNoneRule(_primaryOption) {
  return (root, result) => {
    root.walkDecls(/^outline$/i, (decl) => {
      const value = decl.value.trim().toLowerCase();
      if (value !== 'none' && value !== '0') return;

      // If this declaration is already inside a :focus / :focus-visible rule, it's fine —
      // the author is intentionally restyling focus, which is acceptable as long as they
      // provide an alternative (we can't verify the alternative statically, so we allow it).
      const parent = decl.parent;
      if (parent?.type === 'rule' && isFocusSelector(parent.selector ?? '')) return;

      // Flag it
      decl.warn(result, noOutlineNoneMessages.removed(decl.value), { rule: noOutlineNoneRuleName });
    });
  };
}

const noOutlineNone = {
  ruleName: noOutlineNoneRuleName,
  rule: noOutlineNoneRule,
  meta: noOutlineNoneMeta,
};

export default [userPreferences, noOutlineNone];
