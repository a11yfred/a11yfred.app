/**
 * neighbor/lib/rules.js
 * Framework-agnostic rule factories.
 *
 * Every factory is called as makeXxx(h) where h is the framework-specific
 * helpers object from helpers-jsx.js / helpers-vue.js / helpers-angular.js.
 * Each factory returns a complete ESLint rule object { meta, create }.
 *
 * Sources and credits:
 *   Adrian Roselli         adrianroselli.com
 *   Heydon Pickering       heydonworks.com, inclusive-components.design
 *   Scott O'Hara           scottohara.me
 *   Patrick Lauke          splintered.co.uk, patrickhlauke.github.io/aria
 *   Karl Groves            karlgroves.com
 *   Marcy Sutton           marcysutton.com
 *   Eric Eggert            yatil.net
 *   WAI-ARIA APG           w3.org/WAI/ARIA/apg
 *   ARIA 1.2 spec          w3.org/TR/wai-aria-1.2
 *   WebAIM Million         webaim.org/projects/million
 *   Deque / axe-core       deque.com — rule concepts reimplemented under MPL-2.0
 */

import {
  INTERACTIVE_ELEMENTS,
  INTERACTIVE_ROLES,
  GENERIC_CONTAINERS,
  VOID_ELEMENTS,
  HEADING_ELEMENTS,
  NAV_MENU_ROLES,
  ROLES_REQUIRING_NAME,
  FORM_ELEMENTS,
} from './helpers.js'

// ─── no-aria-label-on-generic ────────────────────────────────────────────────

export function makeNoAriaLabelOnGeneric(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow aria-label / aria-labelledby on generic elements with no role' },
      messages: {
        noLabel:
          '{{attr}} on <{{el}}> has no semantic target — add a role, or move the label to a landmark or interactive element. (Roselli / O\'Hara)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          if (!el || !GENERIC_CONTAINERS.has(el)) return
          const labelAttr = h.getAttr(node, 'aria-label') ?? h.getAttr(node, 'aria-labelledby')
          if (!labelAttr) return
          if (h.hasAttr(node, 'role')) return
          const attrName = labelAttr.name?.name ?? labelAttr.key?.name ?? labelAttr.name
          context.report({ node: labelAttr, messageId: 'noLabel', data: { attr: attrName, el } })
        },
      }
    },
  }
}

// ─── no-assertive-live-overuse ───────────────────────────────────────────────

export function makeNoAssertiveLiveOveruse(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow aria-live="assertive" outside role="alert" elements' },
      messages: {
        assertiveWithoutAlert:
          'aria-live="assertive" without role="alert" interrupts the user unexpectedly. Use aria-live="polite" for status/progress, or add role="alert" only for genuine errors or time-critical messages. (APG / Sutton / Eggert)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const liveVal = h.getAttrStringValue(h.getAttr(node, 'aria-live'))
          if (liveVal !== 'assertive') return
          if (h.getRoleValue(node) === 'alert') return
          if (h.getElementName(node) === 'dialog') return
          context.report({ node: h.getAttr(node, 'aria-live'), messageId: 'assertiveWithoutAlert' })
        },
      }
    },
  }
}

// ─── no-unblocked-aria-disabled ──────────────────────────────────────────────

export function makeNoUnblockedAriaDisabled(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow aria-disabled="true" on interactive elements that still have an active onClick' },
      messages: {
        unblocked:
          'aria-disabled="true" does not block clicks — onClick still fires. Guard the handler, remove it when disabled, or use the native `disabled` attribute. (ARIA 1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getAttrStringValue(h.getAttr(node, 'aria-disabled')) !== 'true') return
          if (!h.isInteractiveElement(node)) return
          // onClick is JSX-specific; Vue/Angular use @click / (click) — check both
          if (!h.hasAttr(node, 'onClick') && !h.hasAttr(node, '@click') && !h.hasAttr(node, '(click)')) return
          context.report({ node: h.getAttr(node, 'aria-disabled'), messageId: 'unblocked' })
        },
      }
    },
  }
}

// ─── no-tooltip-role-misuse ──────────────────────────────────────────────────

export function makeNoTooltipRoleMisuse(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow role="tooltip" with no id or on interactive elements' },
      messages: {
        noId:
          'role="tooltip" requires an `id` so an interactive element can reference it via aria-describedby. Without an id no AT can associate this tooltip with its trigger. (APG: Tooltip Pattern)',
        onInteractive:
          'role="tooltip" belongs on the tooltip container, not the trigger. The trigger should have aria-describedby pointing to the tooltip\'s id. (APG: Tooltip Pattern)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) !== 'tooltip') return
          const el = h.getElementName(node)
          if (el && INTERACTIVE_ELEMENTS.has(el)) {
            context.report({ node: h.getAttr(node, 'role'), messageId: 'onInteractive' })
            return
          }
          if (!h.hasAttr(node, 'id'))
            context.report({ node: h.getAttr(node, 'role'), messageId: 'noId' })
        },
      }
    },
  }
}

// ─── no-roles-without-name ───────────────────────────────────────────────────

const ROLE_REASONS = {
  region:      'browsers do not expose it as a landmark without a name',
  dialog:      'users cannot identify what the dialog is for',
  alertdialog: 'users cannot identify what the alert dialog is for',
  application: 'users have no context for the application region',
  marquee:     'name required per ARIA 1.2',
  searchbox:   'name required per ARIA 1.2',
}

export function makeNoRolesWithoutName(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require accessible names on roles that need them to be usable' },
      messages: {
        missingName:
          'role="{{role}}" requires an accessible name (aria-label or aria-labelledby) to be meaningful: {{reason}}. (APG / ARIA 1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const role = h.getRoleValue(node)
          if (!role || !ROLES_REQUIRING_NAME.has(role)) return
          if (h.hasAccessibleName(node)) return
          context.report({
            node: h.getAttr(node, 'role'),
            messageId: 'missingName',
            data: { role, reason: ROLE_REASONS[role] },
          })
        },
      }
    },
  }
}

// ─── no-application-role ─────────────────────────────────────────────────────

export function makeNoApplicationRole(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Warn when role="application" is used — disables AT browse mode' },
      messages: {
        application:
          'role="application" disables AT browse/reading mode and requires the author to implement ALL keyboard interaction. Only use it for genuine application-like widgets (spreadsheets, code editors). (Roselli / Sutton / Lauke / APG)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) === 'application')
            context.report({ node: h.getAttr(node, 'role'), messageId: 'application' })
        },
      }
    },
  }
}

// ─── no-grid-role ─────────────────────────────────────────────────────────────

export function makeNoGridRole(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Warn when role="grid" is used — almost always wrong outside spreadsheet widgets' },
      messages: {
        grid:
          'role="grid" is for spreadsheet-like widgets with arrow-key cell navigation. Using it on data tables or result lists breaks natural table navigation. Use a native <table> instead. (Roselli: ARIA Grid As an Anti-Pattern)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) === 'grid')
            context.report({ node: h.getAttr(node, 'role'), messageId: 'grid' })
        },
      }
    },
  }
}

// ─── no-menu-role-on-nav ──────────────────────────────────────────────────────

export function makeNoMenuRoleOnNav(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Warn when menu/menubar/menuitem roles are used — triggers AT application-mode keyboard handling' },
      messages: {
        navMenu:
          'role="{{role}}" on a <nav> triggers AT application-mode keyboard expectations (arrow keys, not Tab). Use <nav><ul><li><a> for site navigation. (Roselli / Lauke)',
        anyMenu:
          'role="{{role}}" triggers AT application-mode keyboard handling. Only use menu roles for true app menus (File > Edit > View). For nav use <nav>, for disclosure use <button aria-expanded>. (Roselli / Lauke / Groves)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const role = h.getRoleValue(node)
          if (!role || !NAV_MENU_ROLES.has(role)) return
          const el = h.getElementName(node)
          if (el === 'nav') {
            context.report({ node: h.getAttr(node, 'role'), messageId: 'navMenu', data: { role } })
            return
          }
          for (const ancestor of h.getAncestors(node)) {
            if (h.getElementName(ancestor) === 'nav') {
              context.report({ node: h.getAttr(node, 'role'), messageId: 'navMenu', data: { role } })
              return
            }
          }
          context.report({ node: h.getAttr(node, 'role'), messageId: 'anyMenu', data: { role } })
        },
      }
    },
  }
}

// ─── no-aria-roledescription ──────────────────────────────────────────────────

export function makeNoAriaRoledescription(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow aria-roledescription — almost always misused and does not translate' },
      messages: {
        roledescription:
          'aria-roledescription overrides the AT role label and does not auto-translate. Use semantic HTML, visually-hidden text, or aria-labelledby instead. (Roselli: Avoid aria-roledescription)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const attr = h.getAttr(node, 'aria-roledescription')
          if (attr) context.report({ node: attr, messageId: 'roledescription' })
        },
      }
    },
  }
}

// ─── no-aria-readonly ────────────────────────────────────────────────────────

export function makeNoAriaReadonly(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow aria-readonly — virtually unsupported across AT' },
      messages: {
        readonly:
          'aria-readonly has limited and inconsistent AT support. TalkBack has been known to misread it as "disabled". Prefer displaying read-only values as plain text, or use a visually-distinct disabled state with a visible explanation. (Roselli)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const attr = h.getAttr(node, 'aria-readonly')
          if (attr) context.report({ node: attr, messageId: 'readonly' })
        },
      }
    },
  }
}


// ─── no-aria-hidden-in-link ──────────────────────────────────────────────────

export function makeNoAriaHiddenInLink(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow <a> elements whose only content is aria-hidden (phantom link)' },
      messages: {
        hiddenInLink:
          'This <a> contains only aria-hidden content — AT users encounter a link with no name. Add visible text, a visually-hidden <span>, or an SVG <title> inside the link. (Roselli)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'a') return
          if (h.hasAccessibleName(node)) return
          if (h.hasOnlyHiddenChildren(node))
            context.report({ node, messageId: 'hiddenInLink' })
        },
      }
    },
  }
}

// ─── no-log-with-interactive-children ────────────────────────────────────────

const INTERACTIVE_JSX_ELEMENTS = new Set(['button', 'input', 'select', 'textarea', 'a'])

export function makeNoLogWithInteractiveChildren(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow interactive elements inside role="log"' },
      messages: {
        interactiveChild:
          '<{{el}}> inside role="log" breaks AT expectations. role="log" is for read-only async content (chat history, server logs). Move interactive controls outside the log region. (APG: Log Role)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          if (!el || !INTERACTIVE_JSX_ELEMENTS.has(el)) return
          for (const ancestor of h.getAncestors(node)) {
            if (h.getRoleValue(ancestor) === 'log') {
              context.report({ node, messageId: 'interactiveChild', data: { el } })
              return
            }
          }
        },
      }
    },
  }
}

// ─── no-presentation-on-focusable ────────────────────────────────────────────

export function makeNoPresentationOnFocusable(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow role="presentation" or role="none" on focusable elements' },
      messages: {
        presentationFocusable:
          'role="{{role}}" removes semantics but NOT focus. Keyboard users reach this element but AT users cannot identify it — a phantom control. Remove tabIndex/interactivity or remove the role. (Roselli / Lauke / O\'Hara — WCAG 2.1 SC 2.1.1)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const role = h.getRoleValue(node)
          if (role !== 'presentation' && role !== 'none') return
          const isFocusable =
            h.hasAttr(node, 'tabIndex') || h.hasAttr(node, 'tabindex') ||
            h.hasAttr(node, 'onClick') || h.hasAttr(node, 'onKeyDown') || h.hasAttr(node, 'onKeyPress') ||
            h.hasAttr(node, '@click') || h.hasAttr(node, '(click)') ||
            (h.getElementName(node) === 'a' && h.hasAttr(node, 'href'))
          if (isFocusable)
            context.report({ node: h.getAttr(node, 'role'), messageId: 'presentationFocusable', data: { role } })
        },
      }
    },
  }
}

// ─── no-group-without-name ───────────────────────────────────────────────────

export function makeNoGroupWithoutName(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Require accessible name on role="group" that contains form controls' },
      messages: {
        missingName:
          'role="group" containing form controls must have aria-label or aria-labelledby. Without a name the grouping is invisible to AT. Use <fieldset>/<legend> for form groups where possible. (APG / Groves — WCAG 1.3.1)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementWithChildrenVisitor](node) {
          const opening = h.getOpeningElement(node)
          if (h.getRoleValue(opening) !== 'group') return
          if (h.hasAccessibleName(opening)) return
          const hasFormChild = h.getChildOpeningElementsFromWrapper(node).some(childEl => {
            const name = h.getElementName(childEl)
            return name && FORM_ELEMENTS.has(name)
          })
          if (hasFormChild)
            context.report({ node: opening, messageId: 'missingName' })
        },
      }
    },
  }
}

// ─── no-redundant-aria-hidden-with-presentation ──────────────────────────────

export function makeNoRedundantAriaHiddenWithPresentation(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow redundant aria-hidden="true" combined with role="none" or role="presentation"' },
      messages: {
        redundant:
          'aria-hidden="true" already removes this element from the accessibility tree — role="{{role}}" is redundant. Use one or the other, not both. (O\'Hara)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const role = h.getRoleValue(node)
          if (role !== 'none' && role !== 'presentation') return
          const hiddenVal = h.getAttrStringValue(h.getAttr(node, 'aria-hidden'))
          if (hiddenVal === 'true')
            context.report({ node: h.getAttr(node, 'role'), messageId: 'redundant', data: { role } })
        },
      }
    },
  }
}

// ─── no-title-as-label ───────────────────────────────────────────────────────

const INPUT_TYPES_NEEDING_LABEL = new Set(['text', 'email', 'password', 'search', 'tel', 'url', 'number'])

export function makeNoTitleAsLabel(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow title attribute as the only accessible name on interactive elements' },
      messages: {
        titleOnly:
          'The `title` attribute is not keyboard accessible (requires hover) and has inconsistent AT support. Interactive elements need a visible label, aria-label, or aria-labelledby. (Groves / O\'Hara)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (!h.isInteractiveElement(node)) return
          if (!h.hasAttr(node, 'title')) return
          if (h.hasAccessibleName(node)) return
          const el = h.getElementName(node)
          if (el === 'input') {
            const typeAttr = h.getAttrStringValue(h.getAttr(node, 'type')) ?? 'text'
            if (INPUT_TYPES_NEEDING_LABEL.has(typeAttr))
              context.report({ node: h.getAttr(node, 'title'), messageId: 'titleOnly' })
          }
        },
      }
    },
  }
}

// ─── no-aria-owns-on-void ────────────────────────────────────────────────────

export function makeNoAriaOwnsOnVoid(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow aria-owns on void elements that cannot have children' },
      messages: {
        voidOwns:
          'aria-owns on <{{el}}> is meaningless — void elements cannot have children. If you need to associate elements, use aria-controls (for widget relationships) or restructure the DOM. (O\'Hara / ARIA 1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (!h.hasAttr(node, 'aria-owns')) return
          const el = h.getElementName(node)
          if (el && VOID_ELEMENTS.has(el))
            context.report({ node: h.getAttr(node, 'aria-owns'), messageId: 'voidOwns', data: { el } })
        },
      }
    },
  }
}

// ─── no-href-hash ─────────────────────────────────────────────────────────────

export function makeNoHrefHash(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow <a href="#"> — use <button> for actions' },
      messages: {
        hrefHash:
          '<a href="#"> is a link used as a button. Links navigate, buttons perform actions. Use <button> for click handlers. If you need a hash link, use a real fragment id. (Sutton: Links vs Buttons)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'a') return
          const hrefVal = h.getAttrStringValue(h.getAttr(node, 'href'))
          if (hrefVal === '#' || hrefVal === '#/')
            context.report({ node: h.getAttr(node, 'href'), messageId: 'hrefHash' })
        },
      }
    },
  }
}


// ─── warn-role-alert ─────────────────────────────────────────────────────────

export function makeWarnRoleAlert(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Warn when role="alert" is used — prompt developer to confirm the interruption is warranted' },
      messages: {
        alert:
          'role="alert" immediately interrupts the user. Confirm this is a genuine error or time-critical message. For status updates use role="status" (polite). For progress use aria-live="polite". (APG / Roselli / Sutton)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) === 'alert')
            context.report({ node: h.getAttr(node, 'role'), messageId: 'alert' })
        },
      }
    },
  }
}

// ─── prefer-aria-disabled ────────────────────────────────────────────────────

// Native form controls that support HTML disabled per spec — aria-disabled is
// not the right substitute for these; native disabled is correct and expected.
const NATIVE_DISABLED_ELEMENTS = new Set(['input', 'select', 'textarea', 'option', 'optgroup', 'fieldset'])

export function makePreferAriaDisabled(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Suggest aria-disabled over the HTML disabled attribute for better AT discoverability' },
      messages: {
        disabled:
          '`disabled` removes the element from the tab order — keyboard and AT users cannot discover it or learn why it\'s unavailable. Consider aria-disabled="true" instead, which keeps the element reachable and lets you explain the reason. Guard the onClick handler when using aria-disabled. (Roselli: Don\'t Disable Form Controls)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (!h.isInteractiveElement(node)) return
          // Native form controls: HTML disabled is correct per spec, not aria-disabled
          const elName = h.getElementName(node)
          if (elName && NATIVE_DISABLED_ELEMENTS.has(elName)) return
          const attr = h.getAttr(node, 'disabled')
          if (!attr) return
          // Only flag boolean disabled (not disabled={false})
          const val = attr.value
          // JSX: val === null is boolean true; val.type=JSXExpressionContainer with false literal is false
          if (val === null) {
            context.report({ node: attr, messageId: 'disabled' })
            return
          }
          if (val.type === 'JSXExpressionContainer' && val.expression?.value === false) return
          // Vue/Angular: empty string value means boolean true
          if (typeof val === 'string' && val === '') {
            context.report({ node: attr, messageId: 'disabled' })
            return
          }
          // Generic: string value of "true" or empty
          const strVal = h.getAttrStringValue(attr)
          if (strVal === null || strVal === 'true' || strVal === '')
            context.report({ node: attr, messageId: 'disabled' })
        },
      }
    },
  }
}

// ─── no-tabs-without-structure ───────────────────────────────────────────────

export function makeNoTabsWithoutStructure(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Enforce required ARIA attributes on tab/tablist/tabpanel roles' },
      messages: {
        tabMissingSelected:
          'role="tab" requires aria-selected="true" or aria-selected="false". Without it AT cannot determine which tab is active. (APG: Tabs Pattern)',
        tabpanelMissingLabel:
          'role="tabpanel" requires aria-labelledby="TAB_ID" pointing to its controlling tab. Without it the panel has no accessible name. (APG: Tabs Pattern)',
        tablistMissingName:
          'role="tablist" with multiple tab sets on the page needs aria-label or aria-labelledby to distinguish them. (APG: Tabs Pattern)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const role = h.getRoleValue(node)

          if (role === 'tab') {
            if (!h.hasAttr(node, 'aria-selected'))
              context.report({ node: h.getAttr(node, 'role'), messageId: 'tabMissingSelected' })
          }

          if (role === 'tabpanel') {
            if (!h.hasAttr(node, 'aria-labelledby'))
              context.report({ node: h.getAttr(node, 'role'), messageId: 'tabpanelMissingLabel' })
          }

          if (role === 'tablist') {
            if (!h.hasAccessibleName(node))
              context.report({ node: h.getAttr(node, 'role'), messageId: 'tablistMissingName' })
          }
        },
      }
    },
  }
}

// ─── no-tab-without-controls ─────────────────────────────────────────────────
// Separate warn-level rule for aria-controls on tabs. The APG recommends it but
// does not require it — aria-labelledby on the panel is sufficient. Many solid
// production implementations omit aria-controls without breaking AT.
// Ref: APG Tabs Pattern

export function makeNoTabWithoutControls(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Warn when role="tab" lacks aria-controls pointing to its tabpanel' },
      messages: {
        tabMissingControls:
          'role="tab" should have aria-controls="PANEL_ID" pointing to its tabpanel. The explicit relationship helps JAWS users; aria-labelledby on the panel is the minimum required. (APG: Tabs Pattern)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) !== 'tab') return
          if (!h.hasAttr(node, 'aria-controls'))
            context.report({ node: h.getAttr(node, 'role'), messageId: 'tabMissingControls' })
        },
      }
    },
  }
}

// ─── no-positive-tabindex ────────────────────────────────────────────────────

export function makeNoPositiveTabindex(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow tabIndex values greater than 0' },
      messages: {
        positive:
          'tabIndex={{value}} creates an artificial tab order that overrides natural DOM flow, breaking keyboard and AT navigation. Use tabIndex={0} to add to the flow, or tabIndex={-1} to remove from it. (WebAIM / Lauke)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const attr = h.getAttr(node, 'tabIndex') ?? h.getAttr(node, 'tabindex')
          if (!attr) return
          const val = attr.value
          let num = null
          if (val?.type === 'JSXExpressionContainer' && val.expression.type === 'Literal')
            num = Number(val.expression.value)
          else if (val?.type === 'Literal')
            num = Number(val.value)
          else {
            // Vue/Angular: plain string value
            const strVal = h.getAttrStringValue(attr)
            if (strVal !== null) num = Number(strVal)
          }
          if (num !== null && num > 0)
            context.report({ node: attr, messageId: 'positive', data: { value: num } })
        },
      }
    },
  }
}

// ─── no-target-blank-without-label ───────────────────────────────────────────

export function makeNoTargetBlankWithoutLabel(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Warn when target="_blank" is used without communicating the new-tab behaviour' },
      messages: {
        targetBlank:
          'target="_blank" opens a new tab without warning AT users. Add visually-hidden text "(opens in new tab)" or include it in aria-label/the link text so users can anticipate the context switch. (WebAIM / WCAG 3.2.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'a') return
          const targetVal = h.getAttrStringValue(h.getAttr(node, 'target'))
          if (targetVal !== '_blank') return
          if (h.hasNewTabWarning?.(node)) return
          context.report({ node: h.getAttr(node, 'target'), messageId: 'targetBlank' })
        },
      }
    },
  }
}

// ─── no-autoplay-without-controls ────────────────────────────────────────────

export function makeNoAutoplayWithoutControls(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow autoPlay on media elements without controls' },
      messages: {
        autoplay:
          '<{{el}} autoPlay> without controls violates WCAG 1.4.2. Users cannot pause or mute it; screen reader audio is disrupted. Add the controls attribute or a custom control UI. (WCAG 1.4.2 / WebAIM)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          if (el !== 'video' && el !== 'audio') return
          if (!h.hasAttr(node, 'autoPlay') && !h.hasAttr(node, 'autoplay')) return
          if (h.hasAttr(node, 'controls')) return
          const autoPlayAttr = h.getAttr(node, 'autoPlay') ?? h.getAttr(node, 'autoplay')
          context.report({ node: autoPlayAttr, messageId: 'autoplay', data: { el } })
        },
      }
    },
  }
}

// ─── no-heading-inside-interactive ───────────────────────────────────────────

export function makeNoHeadingInsideInteractive(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow heading elements nested inside interactive elements' },
      messages: {
        headingInInteractive:
          '<{{heading}}> inside <{{parent}}> breaks AT heading navigation and causes double-announcement. Move the heading outside the interactive element, or use CSS to style text without a heading tag. (Roselli / Pickering)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          if (!el || !HEADING_ELEMENTS.has(el)) return
          for (const ancestor of h.getAncestors(node)) {
            const parentEl = h.getElementName(ancestor)
            const parentRole = h.getRoleValue(ancestor)
            if ((parentEl && INTERACTIVE_ELEMENTS.has(parentEl)) ||
                (parentRole && INTERACTIVE_ROLES.has(parentRole))) {
              context.report({
                node,
                messageId: 'headingInInteractive',
                data: { heading: el, parent: parentEl ?? `[role="${parentRole}"]` },
              })
              return
            }
          }
        },
      }
    },
  }
}

// ─── no-placeholder-only ─────────────────────────────────────────────────────

export function makeNoPlaceholderOnly(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow form inputs that rely solely on placeholder as their accessible label' },
      messages: {
        placeholderOnly:
          'placeholder disappears on focus — it cannot be the sole label for this input. Add a <label>, aria-label, or aria-labelledby. Placeholder may remain as supplemental hint text. (WebAIM Million #3 / WCAG 1.3.1)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'input') return
          if (!h.hasAttr(node, 'placeholder')) return
          if (h.hasAccessibleName(node)) return
          context.report({ node: h.getAttr(node, 'placeholder'), messageId: 'placeholderOnly' })
        },
      }
    },
  }
}

// ─── no-empty-button ─────────────────────────────────────────────────────────
// WebAIM Million #2 failure: empty or icon-only buttons with no accessible name.
// An icon <button> with only aria-hidden children has no accessible name.
// Ref: WebAIM Million 2024; WCAG 4.1.2; axe-core (MPL-2.0, reimplemented)

export function makeNoEmptyButton(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow <button> elements with no accessible name' },
      messages: {
        emptyButton:
          'This <button> has no accessible name — AT users encounter a nameless control. Add visible text, aria-label, or aria-labelledby. For icon-only buttons, add aria-label or a visually-hidden <span>. (WebAIM Million #2 / WCAG 4.1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'button') return
          if (h.hasAccessibleName(node)) return
          if (!h.hasOnlyHiddenChildren(node)) return
          context.report({ node, messageId: 'emptyButton' })
        },
      }
    },
  }
}

// ─── no-image-role-without-name ──────────────────────────────────────────────
// role="img" marks a container as an image. Without an accessible name the image
// is meaningless to AT. Particularly common with SVG composed of multiple shapes.
// Ref: APG; ARIA 1.2; O'Hara scottohara.me/blog/2019/05/22/contextual-images-svgs-and-a11y.html

export function makeNoImageRoleWithoutName(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require accessible name on role="img"' },
      messages: {
        missingName:
          'role="img" requires an accessible name (aria-label or aria-labelledby) to convey what the image depicts. (APG / O\'Hara — WCAG 4.1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) !== 'img') return
          if (h.hasAccessibleName(node)) return
          context.report({ node: h.getAttr(node, 'role'), messageId: 'missingName' })
        },
      }
    },
  }
}


// ─── no-spinbutton-without-range ─────────────────────────────────────────────
// role="spinbutton" requires aria-valuenow, aria-valuemin, and aria-valuemax.
// Without these the widget is incomplete and AT cannot convey the value.
// Ref: ARIA 1.2 §5.3.21; APG Spinbutton Pattern

export function makeNoSpinbuttonWithoutRange(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require aria-valuenow/min/max on role="spinbutton"' },
      messages: {
        missingValueNow:
          'role="spinbutton" requires aria-valuenow so AT can announce the current value. (ARIA 1.2 / APG: Spinbutton)',
        missingValueRange:
          'role="spinbutton" requires aria-valuemin and aria-valuemax to define the valid range. (ARIA 1.2 / APG: Spinbutton)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) !== 'spinbutton') return
          if (!h.hasAttr(node, 'aria-valuenow'))
            context.report({ node: h.getAttr(node, 'role'), messageId: 'missingValueNow' })
          if (!h.hasAttr(node, 'aria-valuemin') || !h.hasAttr(node, 'aria-valuemax'))
            context.report({ node: h.getAttr(node, 'role'), messageId: 'missingValueRange' })
        },
      }
    },
  }
}

// ─── no-slider-without-range ─────────────────────────────────────────────────
// role="slider" requires aria-valuenow, aria-valuemin, aria-valuemax.
// Ref: ARIA 1.2 §5.3.20; APG Slider Pattern

export function makeNoSliderWithoutRange(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require aria-valuenow/min/max on role="slider"' },
      messages: {
        missingRange:
          'role="slider" requires aria-valuenow, aria-valuemin, and aria-valuemax. Without them AT cannot announce the current value or valid range. (ARIA 1.2 / APG: Slider)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) !== 'slider') return
          const missing = ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].filter(a => !h.hasAttr(node, a))
          if (missing.length)
            context.report({ node: h.getAttr(node, 'role'), messageId: 'missingRange' })
        },
      }
    },
  }
}

// ─── no-combobox-without-expanded ────────────────────────────────────────────
// role="combobox" requires aria-expanded to convey open/closed state to AT.
// Ref: ARIA 1.2 §5.3.3; APG Combobox Pattern

export function makeNoComboboxWithoutExpanded(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require aria-expanded on role="combobox"' },
      messages: {
        missingExpanded:
          'role="combobox" requires aria-expanded to communicate open/closed state to AT. (ARIA 1.2 / APG: Combobox)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getRoleValue(node) !== 'combobox') return
          if (!h.hasAttr(node, 'aria-expanded'))
            context.report({ node: h.getAttr(node, 'role'), messageId: 'missingExpanded' })
        },
      }
    },
  }
}


// ─── no-mouse-only-events ────────────────────────────────────────────────────
// onMouseEnter/onMouseLeave/onMouseOver without keyboard equivalents (onFocus/
// onBlur) leaves those interactions unreachable for keyboard and switch users.
// This is a direct WCAG 2.1.1 (Keyboard) failure.
// Note: onMouseMove is intentionally excluded — drag/drawing interactions
// have no keyboard equivalent by nature and should be handled separately.
// Ref: WCAG 2.1.1; MDN Accessibility; cross-practitioner consensus

const MOUSE_ONLY_PAIRS = [
  { mouse: 'onMouseEnter', keyboard: 'onFocus' },
  { mouse: 'onMouseLeave', keyboard: 'onBlur' },
  { mouse: 'onMouseOver',  keyboard: 'onFocus' },
  { mouse: 'onMouseOut',   keyboard: 'onBlur' },
]

export function makeNoMouseOnlyEvents(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow mouse-only event handlers without keyboard equivalents' },
      messages: {
        missingKeyboard:
          '{{mouse}} without {{keyboard}} leaves this interaction unreachable by keyboard. Add {{keyboard}} (and {{blur}} for cleanup if needed) to support keyboard and switch users. (WCAG 2.1.1)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          // aria-hidden elements are removed from the AT tree — mouse-only events can't harm keyboard users there
          if (h.getAttrStringValue(h.getAttr(node, 'aria-hidden')) === 'true') return
          for (const { mouse, keyboard } of MOUSE_ONLY_PAIRS) {
            if (!h.hasAttr(node, mouse)) continue
            if (h.hasAttr(node, keyboard)) continue
            // onClick already implies keyboard access — skip if onClick present
            if (h.hasAttr(node, 'onClick')) continue
            context.report({
              node: h.getAttr(node, mouse),
              messageId: 'missingKeyboard',
              data: { mouse, keyboard, blur: keyboard === 'onFocus' ? ' and onBlur' : '' },
            })
          }
        },
      }
    },
  }
}

// ─── no-listbox-without-option ───────────────────────────────────────────────
// ARIA 1.2: listbox required owned elements = option (or group > option).
// A listbox with no option children is an empty, non-functional widget.
// Ref: ARIA 1.2 §5.3.13; APG Listbox Pattern

export function makeNoListboxWithoutOption(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require role="option" children inside role="listbox"' },
      messages: {
        missingOption:
          'role="listbox" must contain elements with role="option" (directly or via role="group"). Without options the listbox is empty and non-functional for AT. (ARIA 1.2 §5.3.13 / APG: Listbox Pattern)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementWithChildrenVisitor](node) {
          const opening = h.getOpeningElement(node)
          if (h.getRoleValue(opening) !== 'listbox') return
          const hasOption = h.getChildOpeningElementsFromWrapper(node).some(
            child => h.getRoleValue(child) === 'option' || h.getRoleValue(child) === 'group'
          )
          if (!hasOption)
            context.report({ node: opening, messageId: 'missingOption' })
        },
      }
    },
  }
}

// ─── no-tree-without-treeitem ─────────────────────────────────────────────────
// APG: "Each element serving as a tree node has role treeitem."
// A tree with no treeitem children is structurally broken.
// Ref: ARIA 1.2 §5.3.25; APG Tree View Pattern

export function makeNoTreeWithoutTreeitem(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require role="treeitem" children inside role="tree"' },
      messages: {
        missingTreeitem:
          'role="tree" must contain elements with role="treeitem". Without treeitems the tree is structurally broken and non-functional for AT. (ARIA 1.2 §5.3.25 / APG: Tree View Pattern)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementWithChildrenVisitor](node) {
          const opening = h.getOpeningElement(node)
          if (h.getRoleValue(opening) !== 'tree') return
          const hasTreeitem = h.getChildOpeningElementsFromWrapper(node).some(
            child => h.getRoleValue(child) === 'treeitem' || h.getRoleValue(child) === 'group'
          )
          if (!hasTreeitem)
            context.report({ node: opening, messageId: 'missingTreeitem' })
        },
      }
    },
  }
}

// ─── no-feed-without-article ──────────────────────────────────────────────────
// APG: "Each unit of content in a feed is contained in an element with role article."
// A feed with no article children violates the required owned elements contract.
// Ref: ARIA 1.2 feed role; APG Feed Pattern

export function makeNoFeedWithoutArticle(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require role="article" children inside role="feed"' },
      messages: {
        missingArticle:
          'role="feed" must contain elements with role="article". The APG requires all feed content to be in article elements so AT can navigate between items. (ARIA 1.2 / APG: Feed Pattern)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementWithChildrenVisitor](node) {
          const opening = h.getOpeningElement(node)
          if (h.getRoleValue(opening) !== 'feed') return
          const hasArticle = h.getChildOpeningElementsFromWrapper(node).some(
            child => h.getRoleValue(child) === 'article' || h.getElementName(child) === 'article'
          )
          if (!hasArticle)
            context.report({ node: opening, messageId: 'missingArticle' })
        },
      }
    },
  }
}

// ─── no-aria-activedescendant-without-id ─────────────────────────────────────
// ARIA 1.2: aria-activedescendant must reference a valid ID.
// At lint time we can verify the value is a non-empty static string ID
// (not empty, not a dynamic expression we can't resolve).
// Ref: ARIA 1.2 §6.6.3

export function makeNoAriaActivedescendantWithoutId(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require aria-activedescendant to have a non-empty static ID value' },
      messages: {
        emptyId:
          'aria-activedescendant must reference a non-empty element ID. An empty or missing value means no descendant is active, which confuses AT. (ARIA 1.2 §6.6.3)',
        dynamicOnly:
          'aria-activedescendant value cannot be verified statically — ensure it always resolves to a valid element ID at runtime. (ARIA 1.2 §6.6.3)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const attr = h.getAttr(node, 'aria-activedescendant')
          if (!attr) return
          const val = h.getAttrStringValue(attr)
          if (val === null) {
            // Dynamic value — warn but don't error, we can't resolve it
            context.report({ node: attr, messageId: 'dynamicOnly' })
            return
          }
          if (val.trim() === '')
            context.report({ node: attr, messageId: 'emptyId' })
        },
      }
    },
  }
}

// ─── no-dialog-without-close ─────────────────────────────────────────────────
// APG: "It is strongly recommended that the tab sequence of all dialogs include
// a visible element with role button that closes the dialog."
// We can only detect a close button statically by looking for a button with
// a close-like aria-label or text content. Warn rather than error — Escape key
// alone satisfies the keyboard requirement even without a visible close button.
// Ref: APG Dialog (Modal) Pattern; WCAG 2.1.2

export function makeNoDialogWithoutClose(h) {
  const CLOSE_PATTERN = /\b(close|dismiss|cancel|✕|×|x)\b/i

  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Warn when role="dialog" has no detectable close button' },
      messages: {
        missingClose:
          'role="dialog" has no detectable close button. The APG strongly recommends a visible close button inside every dialog. Escape key alone is insufficient for pointer-only users. (APG: Dialog Pattern / WCAG 2.1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementWithChildrenVisitor](node) {
          const opening = h.getOpeningElement(node)
          if (h.getRoleValue(opening) !== 'dialog') return
          const hasClose = h.getChildOpeningElementsFromWrapper(node).some(child => {
            const el = h.getElementName(child)
            const role = h.getRoleValue(child)
            if (el !== 'button' && role !== 'button') return false
            const label = h.getAttrStringValue(h.getAttr(child, 'aria-label')) ?? ''
            return CLOSE_PATTERN.test(label)
          })
          if (!hasClose)
            context.report({ node: opening, messageId: 'missingClose' })
        },
      }
    },
  }
}

// ═══ Rules that fill jsx-a11y gaps for Vue/Angular consumers ═════════════════
// These are NOT included in the JSX config — jsx-a11y already covers them there.
// They are included in neighbor-eslint-vue.mjs and neighbor-eslint-angular.mjs.

// ─── no-anchor-ambiguous-text ────────────────────────────────────────────────
// Links with generic text like "click here", "read more" are meaningless out of
// context for AT users navigating by links. WCAG 2.4.4 Link Purpose (In Context).
// Ref: WCAG 2.4.4; WebAIM: Links and Hypertext

const AMBIGUOUS_LINK_TEXT = new Set([
  'click here', 'here', 'read more', 'more', 'learn more', 'this',
  'link', 'button', 'details', 'info', 'information', 'click', 'tap',
])

export function makeNoAnchorAmbiguousText(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow ambiguous link text like "click here" or "read more"' },
      messages: {
        ambiguous:
          'Link text "{{text}}" is ambiguous out of context. AT users navigating by links cannot determine the link destination. Use descriptive text or supplement with aria-label. (WCAG 2.4.4)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'a') return
          // If there's an aria-label it overrides visible text — skip
          if (h.hasAttr(node, 'aria-label') || h.hasAttr(node, 'aria-labelledby')) return
          // We can only check static className/text at lint time — skip dynamic content
          const role = h.getRoleValue(node)
          if (role && role !== 'link') return
          // Check aria-label value if present
          const label = (h.getAttrStringValue(h.getAttr(node, 'aria-label')) ?? '').trim().toLowerCase()
          if (label && AMBIGUOUS_LINK_TEXT.has(label))
            context.report({ node, messageId: 'ambiguous', data: { text: label } })
        },
      }
    },
  }
}

// ─── no-anchor-no-content ─────────────────────────────────────────────────────
// <a> with no children and no aria-label has no accessible name — phantom link.
// Ref: WCAG 4.1.2 Name, Role, Value; WCAG 2.4.4

export function makeNoAnchorNoContent(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow <a> elements with no content and no accessible name' },
      messages: {
        noContent:
          'This <a> has no content and no aria-label — AT users encounter a nameless link. Add visible text, aria-label, or a visually-hidden <span>. (WCAG 4.1.2 / 2.4.4)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'a') return
          if (h.hasAccessibleName(node)) return
          // hasOnlyHiddenChildren returns false for truly empty elements too
          if (!h.hasOnlyHiddenChildren(node)) return
          context.report({ node, messageId: 'noContent' })
        },
      }
    },
  }
}

// ─── no-aria-activedescendant-no-tabindex ────────────────────────────────────
// Elements using aria-activedescendant to manage focus must themselves be
// focusable (tabIndex >= 0) so AT can reach the composite widget.
// Ref: ARIA 1.2 §6.6.3; APG Composite Widget Pattern

export function makeNoAriaActivedescendantNoTabindex(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require tabIndex on elements using aria-activedescendant' },
      messages: {
        missingTabindex:
          'Elements using aria-activedescendant must have tabIndex (0 or -1) so they can receive DOM focus and manage keyboard interaction. (ARIA 1.2 §6.6.3)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (!h.hasAttr(node, 'aria-activedescendant')) return
          if (h.hasAttr(node, 'tabIndex') || h.hasAttr(node, 'tabindex')) return
          // Native interactive elements are already focusable
          const el = h.getElementName(node)
          if (el && INTERACTIVE_ELEMENTS.has(el)) return
          context.report({ node: h.getAttr(node, 'aria-activedescendant'), messageId: 'missingTabindex' })
        },
      }
    },
  }
}

// ─── no-invalid-aria-prop-value ───────────────────────────────────────────────
// ARIA attributes have defined value types. Boolean props must be "true"/"false",
// tristate props "true"/"false"/"mixed", token props must use valid tokens.
// Ref: ARIA 1.2 §6.6 State and Property Attribute Processing

const ARIA_BOOLEAN_PROPS = new Set([
  'aria-atomic', 'aria-busy', 'aria-disabled', 'aria-grabbed',
  'aria-hidden', 'aria-modal', 'aria-multiline', 'aria-multiselectable',
  'aria-pressed', 'aria-readonly', 'aria-required', 'aria-selected',
])
const ARIA_TRISTATE_PROPS = new Set(['aria-checked', 'aria-pressed'])
const ARIA_TRISTATE_VALUES = new Set(['true', 'false', 'mixed'])
const ARIA_BOOLEAN_VALUES = new Set(['true', 'false'])

const ARIA_TOKEN_PROPS = {
  'aria-autocomplete':  new Set(['inline', 'list', 'both', 'none']),
  'aria-current':       new Set(['page', 'step', 'location', 'date', 'time', 'true', 'false']),
  'aria-dropeffect':    new Set(['copy', 'execute', 'link', 'move', 'none', 'popup']),
  'aria-haspopup':      new Set(['false', 'true', 'menu', 'listbox', 'tree', 'grid', 'dialog']),
  'aria-invalid':       new Set(['grammar', 'false', 'spelling', 'true']),
  'aria-live':          new Set(['assertive', 'off', 'polite']),
  'aria-orientation':   new Set(['horizontal', 'undefined', 'vertical']),
  'aria-relevant':      new Set(['additions', 'all', 'removals', 'text', 'additions text']),
  'aria-sort':          new Set(['ascending', 'descending', 'none', 'other']),
}

export function makeNoInvalidAriaPropValue(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow invalid ARIA attribute values' },
      messages: {
        invalidBoolean:
          '"{{attr}}" must be "true" or "false", got "{{value}}". AT may misinterpret invalid values. (ARIA 1.2)',
        invalidTristate:
          '"{{attr}}" must be "true", "false", or "mixed", got "{{value}}". (ARIA 1.2)',
        invalidToken:
          '"{{attr}}" must be one of [{{valid}}], got "{{value}}". (ARIA 1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          for (const [prop, validValues] of Object.entries(ARIA_TOKEN_PROPS)) {
            const attr = h.getAttr(node, prop)
            if (!attr) continue
            const val = h.getAttrStringValue(attr)
            if (val === null) continue
            if (!validValues.has(val.toLowerCase()))
              context.report({ node: attr, messageId: 'invalidToken', data: { attr: prop, value: val, valid: [...validValues].join(', ') } })
          }
          for (const prop of ARIA_TRISTATE_PROPS) {
            const attr = h.getAttr(node, prop)
            if (!attr) continue
            const val = h.getAttrStringValue(attr)
            if (val === null) continue
            if (!ARIA_TRISTATE_VALUES.has(val.toLowerCase()))
              context.report({ node: attr, messageId: 'invalidTristate', data: { attr: prop, value: val } })
          }
          for (const prop of ARIA_BOOLEAN_PROPS) {
            if (ARIA_TRISTATE_PROPS.has(prop)) continue
            const attr = h.getAttr(node, prop)
            if (!attr) continue
            const val = h.getAttrStringValue(attr)
            if (val === null) continue
            if (!ARIA_BOOLEAN_VALUES.has(val.toLowerCase()))
              context.report({ node: attr, messageId: 'invalidBoolean', data: { attr: prop, value: val } })
          }
        },
      }
    },
  }
}

// ─── no-autocomplete-invalid ──────────────────────────────────────────────────
// autocomplete must use valid HTML spec token values. Invalid values are ignored
// by browsers, breaking autofill for AT users. WCAG 1.3.5 Identify Input Purpose.
// Ref: WCAG 1.3.5; HTML Living Standard autocomplete attribute

const VALID_AUTOCOMPLETE_TOKENS = new Set([
  'off', 'on', 'name', 'honorific-prefix', 'given-name', 'additional-name',
  'family-name', 'honorific-suffix', 'nickname', 'email', 'username',
  'new-password', 'current-password', 'one-time-code', 'organization-title',
  'organization', 'street-address', 'address-line1', 'address-line2',
  'address-line3', 'address-level4', 'address-level3', 'address-level2',
  'address-level1', 'country', 'country-name', 'postal-code',
  'cc-name', 'cc-given-name', 'cc-additional-name', 'cc-family-name',
  'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type',
  'transaction-currency', 'transaction-amount', 'language', 'bday',
  'bday-day', 'bday-month', 'bday-year', 'sex', 'tel', 'tel-country-code',
  'tel-national', 'tel-area-code', 'tel-local', 'tel-extension',
  'impp', 'url', 'photo', 'webauthn',
])

export function makeNoAutocompleteInvalid(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require valid autocomplete attribute values' },
      messages: {
        invalid:
          '"{{value}}" is not a valid autocomplete token. Invalid values are ignored by browsers, breaking autofill for AT users. (WCAG 1.3.5 / HTML spec)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          if (el !== 'input' && el !== 'select' && el !== 'textarea') return
          const attr = h.getAttr(node, 'autocomplete')
          if (!attr) return
          const val = h.getAttrStringValue(attr)
          if (val === null) return
          const tokens = val.trim().toLowerCase().split(/\s+/)
          for (const token of tokens) {
            if (!VALID_AUTOCOMPLETE_TOKENS.has(token))
              context.report({ node: attr, messageId: 'invalid', data: { value: token } })
          }
        },
      }
    },
  }
}

// ─── no-heading-no-content ────────────────────────────────────────────────────
// Headings with no text content are meaningless to AT — they appear in the
// heading tree but convey nothing. WCAG 2.4.6 Headings and Labels.
// Ref: WCAG 2.4.6; WebAIM: Headings

export function makeNoHeadingNoContent(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow heading elements with no content' },
      messages: {
        noContent:
          '<{{el}}> has no content — AT users encounter an empty heading in the page outline. Add visible text or aria-label, or remove the heading. (WCAG 2.4.6)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          if (!el || !HEADING_ELEMENTS.has(el)) return
          if (h.hasAccessibleName(node)) return
          if (h.hasOnlyHiddenChildren(node))
            context.report({ node, messageId: 'noContent', data: { el } })
        },
      }
    },
  }
}

// ─── no-iframe-no-title ───────────────────────────────────────────────────────
// <iframe> without a title has no accessible name — AT users cannot determine
// the purpose of the embedded content. WCAG 4.1.2 Name, Role, Value.
// Ref: WCAG 4.1.2; HTML spec

export function makeNoIframeNoTitle(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require title attribute on <iframe> elements' },
      messages: {
        missingTitle:
          '<iframe> must have a title attribute describing its content. Without it AT users cannot identify the embedded content. (WCAG 4.1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'iframe') return
          const title = h.getAttrStringValue(h.getAttr(node, 'title'))
          if (!title || title.trim() === '')
            context.report({ node, messageId: 'missingTitle' })
        },
      }
    },
  }
}

// ─── no-img-redundant-alt ─────────────────────────────────────────────────────
// Alt text saying "image of", "photo of", "picture of" is redundant — AT already
// announces the element is an image. WCAG 1.1.1 Non-text Content.
// Ref: WCAG 1.1.1; WebAIM: Alternative Text

const REDUNDANT_ALT_PATTERN = /\b(image|photo|photograph|picture|graphic|icon|thumbnail)\b/i

export function makeNoImgRedundantAlt(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow redundant words like "image" or "photo" in alt text' },
      messages: {
        redundant:
          'Alt text "{{alt}}" contains a redundant word — AT already announces this is an image. Remove "{{word}}" from the alt text. (WCAG 1.1.1)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'img') return
          const alt = h.getAttrStringValue(h.getAttr(node, 'alt'))
          if (!alt) return
          const match = alt.match(REDUNDANT_ALT_PATTERN)
          if (match)
            context.report({ node: h.getAttr(node, 'alt'), messageId: 'redundant', data: { alt, word: match[0] } })
        },
      }
    },
  }
}

// ─── no-access-key ────────────────────────────────────────────────────────────
// accessKey creates keyboard shortcuts that conflict with browser and AT shortcuts.
// No WCAG SC directly bans it but it causes 2.1.4 Character Key Shortcuts failures
// and is universally discouraged. Ref: WCAG 2.1.4; WebAIM

export function makeNoAccessKey(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow accessKey attribute' },
      messages: {
        accessKey:
          'accessKey creates keyboard shortcuts that conflict with browser and AT shortcuts, breaking keyboard navigation for many users. Remove it. (WCAG 2.1.4)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const attr = h.getAttr(node, 'accessKey') ?? h.getAttr(node, 'accesskey')
          if (attr) context.report({ node: attr, messageId: 'accessKey' })
        },
      }
    },
  }
}

// ─── no-noninteractive-to-interactive-role ────────────────────────────────────
// Adding interactive roles to non-interactive elements (li, div, span, p, etc.)
// without the required keyboard handlers is a WCAG 4.1.2 failure.
// Ref: WCAG 4.1.2; ARIA 1.2

const NON_INTERACTIVE_ELEMENTS = new Set([
  'li', 'ul', 'ol', 'dl', 'dt', 'dd', 'table', 'tr', 'td', 'th',
  'thead', 'tbody', 'tfoot', 'caption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'article', 'aside', 'footer', 'header', 'main', 'nav', 'section',
  'blockquote', 'figure', 'figcaption', 'address', 'p', 'pre',
])

export function makeNoNoninteractiveToInteractiveRole(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow interactive roles on non-interactive elements without keyboard handlers' },
      messages: {
        missingHandlers:
          '<{{el}} role="{{role}}"> makes a non-interactive element interactive but has no keyboard handler. Add onKeyDown/onKeyPress or use a native interactive element instead. (WCAG 4.1.2 / 2.1.1)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          if (!el || !NON_INTERACTIVE_ELEMENTS.has(el)) return
          const role = h.getRoleValue(node)
          if (!role || !INTERACTIVE_ROLES.has(role)) return
          const hasKeyHandler =
            h.hasAttr(node, 'onKeyDown') || h.hasAttr(node, 'onKeyPress') ||
            h.hasAttr(node, 'onKeyUp') || h.hasAttr(node, 'tabIndex') ||
            h.hasAttr(node, 'tabindex') || h.hasAttr(node, '@keydown') ||
            h.hasAttr(node, '(keydown)') || h.hasAttr(node, '@keyup') ||
            h.hasAttr(node, '(keyup)')
          if (!hasKeyHandler)
            context.report({ node: h.getAttr(node, 'role'), messageId: 'missingHandlers', data: { el, role } })
        },
      }
    },
  }
}

// ─── no-noninteractive-tabindex ───────────────────────────────────────────────
// tabIndex on non-interactive elements without a role puts them in the tab order
// but AT users have no semantic context for what they are. WCAG 4.1.2.
// Ref: WCAG 4.1.2; Roselli: Stop Giving Control Hints to Non-Interactive Elements

export function makeNoNoninteractiveTabindex(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow tabIndex >= 0 on non-interactive elements without a role' },
      messages: {
        noninteractiveTabindex:
          'tabIndex on <{{el}}> puts it in the tab order but it has no interactive role — keyboard users reach it but AT cannot identify what it is. Add a role or use a native interactive element. (WCAG 4.1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          if (!el || !NON_INTERACTIVE_ELEMENTS.has(el)) return
          if (h.getRoleValue(node)) return
          const attr = h.getAttr(node, 'tabIndex') ?? h.getAttr(node, 'tabindex')
          if (!attr) return
          const val = h.getAttrStringValue(attr)
          if (val === null) return
          const num = Number(val)
          if (!isNaN(num) && num >= 0)
            context.report({ node: attr, messageId: 'noninteractiveTabindex', data: { el } })
        },
      }
    },
  }
}

// ─── prefer-semantic-element ──────────────────────────────────────────────────
// When a native HTML element exists for a role, prefer it over role=.
// Native elements have built-in keyboard handling and better AT support.
// Ref: WCAG 4.1.2; ARIA in HTML spec "first rule of ARIA"

const ROLE_TO_ELEMENT = {
  button:      'button',
  link:        'a',
  heading:     'h1–h6',
  checkbox:    'input[type=checkbox]',
  radio:       'input[type=radio]',
  textbox:     'input or textarea',
  searchbox:   'input[type=search]',
  spinbutton:  'input[type=number]',
  slider:      'input[type=range]',
  img:         'img',
  list:        'ul or ol',
  listitem:    'li',
  table:       'table',
  row:         'tr',
  cell:        'td',
  columnheader:'th',
  rowheader:   'th',
  form:        'form',
  navigation:  'nav',
  main:        'main',
  banner:      'header',
  contentinfo: 'footer',
  complementary: 'aside',
  region:      'section',
  article:     'article',
  separator:   'hr',
}

export function makePreferSemanticElement(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Prefer native HTML elements over ARIA role equivalents' },
      messages: {
        preferNative:
          'Use <{{element}}> instead of role="{{role}}" — native elements have built-in keyboard handling and better AT support. (ARIA first rule / WCAG 4.1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const el = h.getElementName(node)
          const role = h.getRoleValue(node)
          if (!role) return
          const native = ROLE_TO_ELEMENT[role]
          if (!native) return
          // Don't flag if they're already using a semantic element with a redundant role
          if (el && el === role) return
          context.report({ node: h.getAttr(node, 'role'), messageId: 'preferNative', data: { role, element: native } })
        },
      }
    },
  }
}

// ─── no-role-supports-aria-props ─────────────────────────────────────────────
// ARIA attributes must be valid for the element's role. Using unsupported
// properties on a role is ignored or misread by AT. WCAG 4.1.2.
// Only catches the most common mismatches statically.
// Ref: ARIA 1.2 §6.6; ARIA in HTML

const ROLE_FORBIDDEN_PROPS = {
  // presentation/none — no aria props valid (element is hidden from AT tree)
  presentation: new Set(['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden']),
  none:         new Set(['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden']),
  // separator (non-focusable) — value props don't apply
  separator:    new Set(['aria-checked', 'aria-selected', 'aria-expanded']),
}

export function makeNoRoleSupportsAriaProps(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow ARIA attributes that are not supported by the element\'s role' },
      messages: {
        unsupported:
          '"{{attr}}" is not supported on role="{{role}}" and will be ignored or misread by AT. Remove it or change the role. (ARIA 1.2 / WCAG 4.1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const role = h.getRoleValue(node)
          if (!role) return
          const forbidden = ROLE_FORBIDDEN_PROPS[role]
          if (!forbidden) return
          for (const prop of forbidden) {
            const attr = h.getAttr(node, prop)
            if (attr)
              context.report({ node: attr, messageId: 'unsupported', data: { attr: prop, role } })
          }
        },
      }
    },
  }
}

// ─── no-scope-on-td ───────────────────────────────────────────────────────────
// scope attribute is only valid on <th>, not <td>. Using it on <td> is invalid
// HTML and ignored by browsers. WCAG 1.3.1 Info and Relationships.
// Ref: WCAG 1.3.1; HTML spec

export function makeNoScopeOnTd(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow scope attribute on <td> — only valid on <th>' },
      messages: {
        invalidScope:
          'scope is only valid on <th>, not <td>. Using it on <td> is invalid HTML and is ignored by browsers and AT. (WCAG 1.3.1 / HTML spec)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'td') return
          const attr = h.getAttr(node, 'scope')
          if (attr) context.report({ node: attr, messageId: 'invalidScope' })
        },
      }
    },
  }
}

// ─── no-duplicate-id ──────────────────────────────────────────────────────────
// Duplicate IDs break aria-labelledby, aria-describedby, aria-controls,
// aria-owns, aria-activedescendant, and htmlFor — AT uses only the first match.
// WCAG 4.1.1 was removed in WCAG 2.2; failures now map to SC 1.3.1 / 4.1.2.
// We only flag duplicates that are actually referenced by an ARIA relation,
// to avoid noise from IDs used purely for styling or scripting.
// Ref: axe-core duplicate-id-aria (MPL-2.0, reimplemented); SC 1.3.1 / 4.1.2

const ARIA_ID_ATTRS = ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'aria-activedescendant']

export function makeNoDuplicateId(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow duplicate id values on elements referenced by ARIA attributes' },
      messages: {
        duplicate:
          'id="{{id}}" appears more than once. AT resolves aria-labelledby/describedby/controls/owns/activedescendant by first match — duplicate IDs silently break these associations. (SC 1.3.1 / 4.1.2)',
      },
      schema: [],
    },
    create(context) {
      const idNodes = new Map()   // id string → first node with that id
      const idDups  = new Map()   // id string → subsequent nodes (to report)
      const ariaRefs = new Set()  // all id values referenced by ARIA attrs or htmlFor

      return {
        [h.elementVisitor](node) {
          const id = h.getAttrStringValue(h.getAttr(node, 'id'))
          if (id) {
            if (!idNodes.has(id)) {
              idNodes.set(id, node)
            } else {
              if (!idDups.has(id)) idDups.set(id, [])
              idDups.get(id).push(node)
            }
          }

          for (const attr of ARIA_ID_ATTRS) {
            const val = h.getAttrStringValue(h.getAttr(node, attr))
            if (val) val.trim().split(/\s+/).forEach(ref => ariaRefs.add(ref))
          }
          // htmlFor (JSX) and for (Vue/Angular)
          const forVal = h.getAttrStringValue(h.getAttr(node, 'htmlFor') ?? h.getAttr(node, 'for'))
          if (forVal) ariaRefs.add(forVal.trim())
        },

        'Program:exit'() {
          for (const [id, nodes] of idDups) {
            if (!ariaRefs.has(id)) continue
            for (const node of nodes) {
              context.report({
                node: h.getAttr(node, 'id'),
                messageId: 'duplicate',
                data: { id },
              })
            }
          }
        },
      }
    },
  }
}

// ─── no-button-type-missing ───────────────────────────────────────────────────
// <button> without an explicit type attribute defaults to type="submit" when
// inside a <form>, causing accidental form submission. This is an HTML spec
// issue (not a WCAG SC), but it is the root cause of unexpected navigation and
// double-submit bugs. We only flag when the button is inside a <form> ancestor
// (where getAncestors is available — JSX and Vue). Angular silently passes
// because getParent returns null and ancestor walking is unavailable there.
// Ref: HTML Living Standard §4.10.18.5; H32 Technique

export function makeNoButtonTypeMissing(h) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Require explicit type attribute on <button> elements inside forms' },
      messages: {
        missingType:
          '<button> without an explicit type defaults to type="submit" inside a <form>, which can cause accidental form submission. Add type="button", type="submit", or type="reset". (HTML spec §4.10.18.5)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'button') return
          if (h.hasAttr(node, 'type')) return

          // Only flag when inside a <form> — outside a form, the default is harmless.
          // Angular's getAncestors yields nothing (parent is null), so the loop
          // completes without finding 'form' and we silently skip — correct behaviour.
          let insideForm = false
          for (const ancestor of h.getAncestors(node)) {
            if (h.getElementName(ancestor) === 'form') { insideForm = true; break }
          }
          if (!insideForm) return

          context.report({ node, messageId: 'missingType' })
        },
      }
    },
  }
}

// ─── no-summary-without-details ───────────────────────────────────────────────
// <summary> must be the first child of <details>. Orphaned <summary> elements
// are still exposed as interactive by Firefox and Safari even though they are
// not keyboard-operable — a SC 2.1.1 and 4.1.2 failure.
// Angular skips silently because getParent returns null there.
// Ref: HTML Living Standard §4.11.1; O'Hara scottohara.me/blog/2022/09/12/details-summary.html

export function makeNoSummaryWithoutDetails(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require <summary> to be a child of <details>' },
      messages: {
        orphaned:
          '<summary> outside <details> is invalid HTML. Firefox and Safari still expose it as an interactive element, but it is not keyboard-operable — a phantom control. Wrap it in <details> or remove it. (SC 2.1.1 / 4.1.2 / HTML spec)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'summary') return
          const parent = h.getParent(node)
          // Angular returns null — cannot check parent, skip silently.
          if (parent === null) return
          if (h.getElementName(parent) !== 'details')
            context.report({ node, messageId: 'orphaned' })
        },
      }
    },
  }
}

// ─── no-aria-required-on-non-form ────────────────────────────────────────────
// aria-required is only meaningful on 8 ARIA roles per the ARIA 1.2 spec:
// checkbox, combobox, gridcell, listbox, radiogroup, spinbutton, textbox, tree.
// On any other element or role AT ignores it — dead code that misleads authors.
// Ref: ARIA 1.2 §6.6.9 aria-required; SC 4.1.2

const ARIA_REQUIRED_VALID_ROLES = new Set([
  'checkbox', 'combobox', 'gridcell', 'listbox', 'radiogroup', 'spinbutton', 'textbox', 'tree',
])

// Input types whose implicit ARIA role supports aria-required
const ARIA_REQUIRED_VALID_INPUT_TYPES = new Set([
  'text', 'email', 'password', 'search', 'tel', 'url', 'number', 'checkbox',
])

export function makeNoAriaRequiredOnNonForm(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow aria-required on elements whose role does not support it' },
      messages: {
        invalid:
          'aria-required is only valid on roles: checkbox, combobox, gridcell, listbox, radiogroup, spinbutton, textbox, tree. On <{{el}}> with no matching role, AT ignores it. Use a native required attribute or apply aria-required to a control with a valid role. (ARIA 1.2 §6.6.9 / SC 4.1.2)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          const attr = h.getAttr(node, 'aria-required')
          if (!attr) return

          const role = h.getRoleValue(node)
          if (role && ARIA_REQUIRED_VALID_ROLES.has(role)) return

          const el = h.getElementName(node)

          // select and textarea have implicit listbox/textbox roles — valid
          if (el === 'select' || el === 'textarea') return

          if (el === 'input') {
            const type = (h.getAttrStringValue(h.getAttr(node, 'type')) ?? 'text').toLowerCase()
            if (ARIA_REQUIRED_VALID_INPUT_TYPES.has(type)) return
          }

          context.report({ node: attr, messageId: 'invalid', data: { el: el ?? 'unknown' } })
        },
      }
    },
  }
}

// ─── no-input-type-invalid ────────────────────────────────────────────────────
// <input type="X"> with an invalid type silently falls back to type="text",
// losing mobile keyboard hints, native pickers, format validation, and browser
// autofill matching. WCAG 1.3.5 Identify Input Purpose.
// Dynamic type values (JSX expression, v-bind, Angular binding) are skipped —
// getAttrStringValue returns null for those and we cannot validate at lint time.
// Ref: HTML Living Standard §4.10.18.5; SC 1.3.5

const VALID_INPUT_TYPES = new Set([
  'button', 'checkbox', 'color', 'date', 'datetime-local', 'email', 'file',
  'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'reset',
  'search', 'submit', 'tel', 'text', 'time', 'url', 'week',
])

export function makeNoInputTypeInvalid(h) {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Require valid HTML type attribute values on <input> elements' },
      messages: {
        invalid:
          'type="{{type}}" is not a valid HTML input type and silently falls back to type="text", losing mobile keyboard hints, native pickers, and autofill matching. Use a valid type value. (HTML spec / SC 1.3.5)',
      },
      schema: [],
    },
    create(context) {
      return {
        [h.elementVisitor](node) {
          if (h.getElementName(node) !== 'input') return
          const typeAttr = h.getAttr(node, 'type')
          if (!typeAttr) return  // missing type — defaults to text, valid
          const val = h.getAttrStringValue(typeAttr)
          if (val === null) return  // dynamic expression — cannot validate
          if (!VALID_INPUT_TYPES.has(val.toLowerCase()))
            context.report({ node: typeAttr, messageId: 'invalid', data: { type: val } })
        },
      }
    },
  }
}

// ─── All rules map ────────────────────────────────────────────────────────────

export const RULE_FACTORIES = {
  'no-aria-label-on-generic':                   makeNoAriaLabelOnGeneric,
  'no-assertive-live-overuse':                  makeNoAssertiveLiveOveruse,
  'warn-role-alert':                            makeWarnRoleAlert,
  'no-unblocked-aria-disabled':                 makeNoUnblockedAriaDisabled,
  'prefer-aria-disabled':                       makePreferAriaDisabled,
  'no-tooltip-role-misuse':                     makeNoTooltipRoleMisuse,
  'no-roles-without-name':                      makeNoRolesWithoutName,
  'no-group-without-name':                      makeNoGroupWithoutName,
  'no-tabs-without-structure':                  makeNoTabsWithoutStructure,
  'no-tab-without-controls':                    makeNoTabWithoutControls,
  'no-application-role':                        makeNoApplicationRole,
  'no-grid-role':                               makeNoGridRole,
  'no-menu-role-on-nav':                        makeNoMenuRoleOnNav,
  'no-presentation-on-focusable':               makeNoPresentationOnFocusable,
  'no-log-with-interactive-children':           makeNoLogWithInteractiveChildren,
  'no-redundant-aria-hidden-with-presentation': makeNoRedundantAriaHiddenWithPresentation,
  'no-aria-roledescription':                    makeNoAriaRoledescription,
  'no-aria-readonly':                           makeNoAriaReadonly,
  'no-aria-hidden-in-link':                     makeNoAriaHiddenInLink,
  'no-title-as-label':                          makeNoTitleAsLabel,
  'no-href-hash':                               makeNoHrefHash,
  'no-target-blank-without-label':              makeNoTargetBlankWithoutLabel,
  'no-autoplay-without-controls':               makeNoAutoplayWithoutControls,
  'no-heading-inside-interactive':              makeNoHeadingInsideInteractive,
  'no-placeholder-only':                        makeNoPlaceholderOnly,
  'no-positive-tabindex':                       makeNoPositiveTabindex,
  'no-aria-owns-on-void':                       makeNoAriaOwnsOnVoid,
  'no-empty-button':                            makeNoEmptyButton,
  'no-image-role-without-name':                 makeNoImageRoleWithoutName,
  'no-spinbutton-without-range':                makeNoSpinbuttonWithoutRange,
  'no-slider-without-range':                    makeNoSliderWithoutRange,
  'no-combobox-without-expanded':               makeNoComboboxWithoutExpanded,
  'no-mouse-only-events':                       makeNoMouseOnlyEvents,
  'no-listbox-without-option':                  makeNoListboxWithoutOption,
  'no-tree-without-treeitem':                   makeNoTreeWithoutTreeitem,
  'no-feed-without-article':                    makeNoFeedWithoutArticle,
  'no-aria-activedescendant-without-id':        makeNoAriaActivedescendantWithoutId,
  'no-dialog-without-close':                    makeNoDialogWithoutClose,
  // jsx-a11y portability rules — included in Vue/Angular configs only
  'no-anchor-ambiguous-text':                   makeNoAnchorAmbiguousText,
  'no-anchor-no-content':                       makeNoAnchorNoContent,
  'no-aria-activedescendant-no-tabindex':       makeNoAriaActivedescendantNoTabindex,
  'no-invalid-aria-prop-value':                 makeNoInvalidAriaPropValue,
  'no-autocomplete-invalid':                    makeNoAutocompleteInvalid,
  'no-heading-no-content':                      makeNoHeadingNoContent,
  'no-iframe-no-title':                         makeNoIframeNoTitle,
  'no-img-redundant-alt':                       makeNoImgRedundantAlt,
  'no-access-key':                              makeNoAccessKey,
  'no-noninteractive-to-interactive-role':      makeNoNoninteractiveToInteractiveRole,
  'no-noninteractive-tabindex':                 makeNoNoninteractiveTabindex,
  'prefer-semantic-element':                    makePreferSemanticElement,
  'no-role-supports-aria-props':                makeNoRoleSupportsAriaProps,
  'no-scope-on-td':                             makeNoScopeOnTd,
  'no-duplicate-id':                            makeNoDuplicateId,
  'no-button-type-missing':                     makeNoButtonTypeMissing,
  'no-summary-without-details':                 makeNoSummaryWithoutDetails,
  'no-aria-required-on-non-form':               makeNoAriaRequiredOnNonForm,
  'no-input-type-invalid':                      makeNoInputTypeInvalid,
}

/** Build the rules map for a plugin by applying helpers to all factories. */
export function buildRules(h) {
  const rules = {}
  for (const [name, factory] of Object.entries(RULE_FACTORIES)) {
    rules[name] = factory(h)
  }
  return rules
}

/** Build the recommended config rules object for a given plugin namespace. */
export function buildRecommendedRules(ns) {
  return {
    // errors — definite breakage or phantom controls
    [`${ns}/no-aria-label-on-generic`]:                   'error',
    [`${ns}/no-assertive-live-overuse`]:                  'error',
    [`${ns}/no-unblocked-aria-disabled`]:                 'error',
    [`${ns}/no-roles-without-name`]:                      'error',
    [`${ns}/no-group-without-name`]:                      'error',
    [`${ns}/no-presentation-on-focusable`]:               'error',
    [`${ns}/no-log-with-interactive-children`]:           'error',
    [`${ns}/no-aria-hidden-in-link`]:                     'error',
    [`${ns}/no-redundant-aria-hidden-with-presentation`]: 'error',
    [`${ns}/no-aria-owns-on-void`]:                       'error',
    [`${ns}/no-title-as-label`]:                          'error',
    [`${ns}/no-tabs-without-structure`]:                  'error',
    [`${ns}/no-positive-tabindex`]:                       'error',
    [`${ns}/no-autoplay-without-controls`]:               'error',
    [`${ns}/no-heading-inside-interactive`]:              'error',
    [`${ns}/no-placeholder-only`]:                        'error',
    [`${ns}/no-empty-button`]:                            'error',
    [`${ns}/no-image-role-without-name`]:                 'error',
    [`${ns}/no-spinbutton-without-range`]:                'error',
    [`${ns}/no-slider-without-range`]:                    'error',
    [`${ns}/no-combobox-without-expanded`]:               'error',
    [`${ns}/no-mouse-only-events`]:                       'error',
    [`${ns}/no-listbox-without-option`]:                  'error',
    [`${ns}/no-tree-without-treeitem`]:                   'error',
    [`${ns}/no-feed-without-article`]:                    'error',
    [`${ns}/no-aria-activedescendant-without-id`]:        'error',
    [`${ns}/no-duplicate-id`]:                             'error',
    [`${ns}/no-summary-without-details`]:                 'error',
    [`${ns}/no-aria-required-on-non-form`]:               'error',
    [`${ns}/no-input-type-invalid`]:                      'error',
    [`${ns}/no-button-type-missing`]:                     'warn',
    // warnings — strong guidance, occasional legitimate overrides
    [`${ns}/no-tooltip-role-misuse`]:                     'warn',
    [`${ns}/no-application-role`]:                        'warn',
    [`${ns}/no-grid-role`]:                               'warn',
    [`${ns}/no-menu-role-on-nav`]:                        'warn',
    [`${ns}/no-aria-roledescription`]:                    'warn',
    [`${ns}/no-aria-readonly`]:                           'warn',
    [`${ns}/no-tab-without-controls`]:                    'warn',
    [`${ns}/no-href-hash`]:                               'warn',
    [`${ns}/warn-role-alert`]:                            'warn',
    [`${ns}/prefer-aria-disabled`]:                       'warn',
    [`${ns}/no-target-blank-without-label`]:              'warn',
    [`${ns}/no-dialog-without-close`]:                    'warn',
  }
}

/** Build portability rules for Vue/Angular configs (jsx-a11y gap rules). */
export function buildPortabilityRules(ns) {
  return {
    [`${ns}/no-anchor-ambiguous-text`]:               'error',
    [`${ns}/no-anchor-no-content`]:                   'error',
    [`${ns}/no-aria-activedescendant-no-tabindex`]:   'error',
    [`${ns}/no-invalid-aria-prop-value`]:             'error',
    [`${ns}/no-autocomplete-invalid`]:                'error',
    [`${ns}/no-heading-no-content`]:                  'error',
    [`${ns}/no-iframe-no-title`]:                     'error',
    [`${ns}/no-img-redundant-alt`]:                   'warn',
    [`${ns}/no-access-key`]:                          'warn',
    [`${ns}/no-noninteractive-to-interactive-role`]:  'error',
    [`${ns}/no-noninteractive-tabindex`]:             'error',
    [`${ns}/prefer-semantic-element`]:                'warn',
    [`${ns}/no-role-supports-aria-props`]:            'error',
    [`${ns}/no-scope-on-td`]:                         'error',
  }
}
