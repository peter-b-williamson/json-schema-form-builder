import ResizeObserverPolyfill from 'resize-observer-polyfill';

// jsdom doesn't implement ResizeObserver, which Vuetify's layout system
// (VApp/VAppBar/VMain) relies on to track viewport size.
globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverPolyfill;
