// @ulam/sawsawan — integration bridge between ube, calamansi, and rogers
//
// Wires cross-package concerns that none of the three packages can own alone:
//   - locale change → announce() the switch
//   - locale change → set html[lang]
//   - locale → dir attribute (RTL detection)
//   - rogers debug notifications → ube announce channel
//
// Dependency direction: sawsawan imports from ube/calamansi/rogers.
// None of those three import from sawsawan or from each other.

export { initSawsawan } from './initSawsawan.js'
export { setPlatformAdapter, getAdapter, makeElectronAdapter } from './platformAdapter.js'
export { makeIdGenerator } from './makeIdGenerator.js'
