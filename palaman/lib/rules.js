/**
 * palaman/lib/rules.js
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
          const labelVal = (h.getAttrStringValue(h.getAttr(node, 'aria-label')) ?? '').toLowerCase()
          if (/new.tab|new.window|opens in/i.test(labelVal)) return
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
  }
}
