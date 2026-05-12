/**
 * No-op shim for the Remix migration period.
 *
 * In Remix, page titles are set via the `meta` export on each route module —
 * not imperatively via a hook. This shim lets existing usePageTitle() call
 * sites compile without errors during the migration so they can be removed
 * one route at a time.
 *
 * Migration path for each call site:
 *   1. Add a `meta` export to the route module:
 *        export const meta = () => [{ title: 'MyApp | Settings' }]
 *   2. Remove the usePageTitle() call.
 *   3. Delete the import.
 *
 * Once all call sites are migrated, delete this file.
 */
export function usePageTitle(_pageTitle) {
  // intentional no-op
}
