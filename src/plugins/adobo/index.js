// @ulam/adobo — portable a11y debug tools

// React wrappers (thin shells around overlay/)
export { FocusDebugger }      from './react/FocusDebugger.jsx'
export { NamesDebugger }      from './react/NamesDebugger.jsx'
export { TabStopsDebugger }   from './react/TabStopsDebugger.jsx'
export { HeadingMapDebugger } from './react/HeadingMapDebugger.jsx'
export { DebugLauncher }      from './react/DebugLauncher.jsx'
export { DebugHelp }          from './react/DebugHelp.jsx'
export { DeployBanner }       from './react/DeployBanner.jsx'

// Vanilla overlay (no framework dependency)
export { mountFocusDebugger }      from './overlay/focus.js'
export { mountNamesDebugger }      from './overlay/names.js'
export { mountHeadingMapDebugger } from './overlay/headings.js'
export { mountTabStopsDebugger }   from './overlay/tabstops.js'
export { mountDebugLauncher }      from './overlay/launcher.js'
export { mountDebugHelp }          from './overlay/help.js'
export { mountDeployBanner }       from './overlay/banner.js'

// Vanilla core (no framework dependency)
export { createFocusWatcher, formatTarget, getOutlineInfo, flashElement } from './core/focus.js'
export { createNamesWatcher, isControl, getAccessibleName }               from './core/names.js'
export { createHeadingWatcher, collectHeadings }                          from './core/headings.js'
export { createTabStopWatcher, isTabbable, getTabOrder }                  from './core/tabstops.js'

