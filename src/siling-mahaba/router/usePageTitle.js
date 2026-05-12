// TODO: replace with Remix's built-in meta export pattern
// In Remix, page titles are set via the `meta` export on each route module:
//
//   export const meta = () => [{ title: 'A11yHelper | Settings' }]
//
// usePageTitle is React-state-based and unnecessary in Remix — delete this
// file and use the meta export instead when migration is complete.

// Temporary: delegate to siling-labuyo until Remix migration
export { usePageTitle } from '../../siling-labuyo/hooks/usePageTitle.js'
