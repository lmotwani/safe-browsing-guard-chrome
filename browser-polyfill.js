/**
 * Cross-browser compatibility polyfill
 * Ensures 'browser' namespace is available in both Chrome and Firefox
 *
 * Modern Chrome (109+) supports 'browser' namespace natively
 * Firefox has always used 'browser' namespace
 * This polyfill ensures compatibility with older Chrome versions
 */

// If browser namespace doesn't exist but chrome does, create alias
if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
    // For older Chrome versions, alias chrome to browser
    globalThis.browser = chrome;
}

// Export for use in modules
export const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
