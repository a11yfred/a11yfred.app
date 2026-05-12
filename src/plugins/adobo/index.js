// @ulam/adobo — portable a11y debug tools

// React wrappers (thin shells around core/)
export { FocusDebugger }      from './react/FocusDebugger.jsx'
export { NamesDebugger }      from './react/NamesDebugger.jsx'
export { TabStopsDebugger }   from './react/TabStopsDebugger.jsx'
export { HeadingMapDebugger } from './react/HeadingMapDebugger.jsx'

// Vanilla core (no framework dependency)
export { createFocusWatcher, formatTarget, getOutlineInfo, flashElement } from './core/focus.js'
export { createNamesWatcher, isControl, getAccessibleName }               from './core/names.js'
export { createHeadingWatcher, collectHeadings }                          from './core/headings.js'
export { createTabStopWatcher, isTabbable, getTabOrder }                  from './core/tabstops.js'

// Pure-render React (no DOM watcher)
export { DeployBanner }  from './DeployBanner.jsx'
export { DebugHelp }     from './DebugHelp.jsx'
export { DebugLauncher } from './DebugLauncher.jsx'

