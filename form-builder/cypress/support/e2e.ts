// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import 'cypress-real-events';

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// The browser fires this when it drops a ResizeObserver notification because the
// callback didn't finish before the next frame - harmless, but Cypress otherwise
// treats it as an uncaught exception and fails the test, which flakes specs that
// happen to resize panels (e.g. Splitpanes) around the same tick.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications.')) {
    return false;
  }
});
