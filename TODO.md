# A11yFred Known Issues and Future Work

## Current Status

### Completed Recently

- ✅ Modal → Dialog migration
- ✅ DataError/NoResults → Screen consolidation
- ✅ ManagerModalsSheets → A11yOverlayManager refactor
- ✅ Focus management improvements (WCAG 2.4.3)
- ✅ Page title management for overlays
- ✅ Automatic focus restoration across overlay transitions

## Near Term (Next Sprint)

### Features to Add

- [ ] Settings for search debounce/live search toggle
- [ ] Keyboard shortcut help dialog (? or Ctrl+/)
- [ ] More granular result filtering options
- [ ] Search history
- [ ] Bookmarks/favorites system
- [ ] Export/import settings

### Improvements to Make

- [ ] Performance optimization for large result sets (100K+ entries)
- [ ] Responsive design improvements for tablets
- [ ] Dark mode theming (already available from @ulam/ube)
- [ ] i18n expansion (more languages via @ulam/calamansi)

### Bug Fixes Needed

- [ ] Verify all overlay transitions maintain focus correctly in screen readers
- [ ] Check Sheet collapse behavior on mobile (animation timing)
- [ ] Review keyboard trap implementation in all overlays
- [ ] Verify Escape key handling doesn't conflict with custom shortcuts

## Testing Gaps

### Unit Tests

- [ ] A11yOverlayManager focus management
- [ ] A11yListResults filtering logic
- [ ] A11yInputSearchHero debouncing
- [ ] Focus restoration across different overlay types

### Integration Tests

- [ ] Complete user flow: search → select → details → close
- [ ] Overlay transitions: dialog → sheet → drawer → close
- [ ] Keyboard-only navigation of entire app
- [ ] Screen reader navigation of all major sections

### Accessibility Tests

- [ ] axe-core automated checks
- [ ] Keyboard navigation (no mouse)
- [ ] VoiceOver (macOS)
- [ ] NVDA (Windows)
- [ ] High contrast mode
- [ ] Reduced motion mode

## Metrics to Track

- [ ] Lighthouse accessibility score (target: 95+)
- [ ] Keyboard-only usability time (benchmark)
- [ ] Screen reader navigation time (benchmark)
- [ ] Load time of large result sets
- [ ] Mobile performance metrics

## Documentation Needs

- [ ] Architecture overview (how components fit together)
- [ ] Focus flow diagram (where focus moves through app)
- [ ] Keyboard shortcuts documentation
- [ ] Contributing guide for a11yfred
- [ ] Development setup instructions

## Dependency Management

### Current Versions

- React 18.x
- @ulam/sili 0.3.0
- @ulam/ube 0.3.0
- @ulam/calamansi (latest)
- @ulam/taho (latest)

### Monitoring

- [ ] Monitor @ulam packages for updates
- [ ] Review breaking changes before upgrading
- [ ] Update CHANGELOG when upgrading dependencies

## Performance Optimization Opportunities

- [ ] Lazy load detail panels (load on demand, not on render)
- [ ] Virtual scrolling for large result lists
- [ ] Debounce search input more aggressively
- [ ] Memoize expensive computations (sorting, filtering)
- [ ] Optimize CSS (remove unused classes, consolidate media queries)

## Accessibility Wins

### Completed

- ✅ Focus management for all overlays
- ✅ Keyboard navigation throughout app
- ✅ ARIA labels and live regions
- ✅ Screen reader support
- ✅ Reduced motion support
- ✅ High contrast support

### Remaining

- [ ] Verify all interactive elements are keyboard accessible
- [ ] Add skip links (skip to main content)
- [ ] Add breadcrumb navigation
- [ ] Improve color contrast ratios (audit with axe-core)
- [ ] Test with actual disabled users (external validation)

## Bugs to Track

### None Currently Reported

Found a bug? 
1. Create a minimal reproduction
2. Document steps to reproduce
3. Note browser/OS/screen reader
4. File as GitHub issue with `bug:` prefix

## Future Features (Backlog)

### User Experience

- [ ] Collaborative search (share results with others)
- [ ] Result annotations/notes
- [ ] Custom result sorting
- [ ] Saved searches
- [ ] Search suggestions/autocomplete
- [ ] Related results recommendations

### Platform Integration

- [ ] Browser extensions (Chrome, Firefox, Safari)
- [ ] Slack integration
- [ ] Email integration
- [ ] API for external tools

### Accessibility Community

- [ ] Contribution guidelines for accessibility improvements
- [ ] Community translations
- [ ] Accessibility audit documentation
- [ ] Case studies of accessibility-first design

## Questions?

- **How do I...?** Check README.md
- **What just changed?** See UPDATES.md
- **Found a bug?** Open a GitHub issue
- **Want to improve accessibility?** See CONTRIBUTING.md

