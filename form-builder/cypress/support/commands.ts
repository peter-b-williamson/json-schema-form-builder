/// <reference types="cypress" />

const getCenter = ($el: JQuery<HTMLElement>) => {
  const rect = $el[0].getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

// Drags the element matched by `source` onto the element matched by `target`.
//
// The app's sortable lists run vue-draggable-plus with forceFallback + supportPointer
// disabled, so SortableJS drives the drag with plain mouse events instead of native
// HTML5 drag-and-drop or Pointer Events. Cypress's default `.trigger()` dispatches
// synthetic events from JavaScript (`event.isTrusted` is false), which isn't enough to
// reliably drive SortableJS's drag detection. This uses cypress-real-events instead,
// which fires actual OS-level events via the Chrome DevTools Protocol, indistinguishable
// from real user input.
//
// realMouseMove(x, y) resolves x/y relative to the chained subject's own top-left
// corner, not as absolute page coordinates - every move here is chained off `body`
// (whose top-left is page origin) rather than off `source`/`target`, so the same
// getCenter() coordinates can be used as if they were absolute. Chaining a move off
// an arbitrary element instead adds that element's own offset on top, silently sending
// the pointer somewhere else entirely.
Cypress.Commands.add('dragAndDrop', (source: string, target: string) => {
  cy.get(source).then(($source) => {
    const from = getCenter($source);

    cy.get(target).then(($target) => {
      const to = getCenter($target);
      const steps = 5;

      cy.get(source).realMouseDown({ position: 'center' });

      for (let step = 1; step <= steps; step += 1) {
        const x = from.x + ((to.x - from.x) * step) / steps;
        const y = from.y + ((to.y - from.y) * step) / steps;
        cy.get('body').realMouseMove(x, y);
      }

      // Wait for the reposition animation to finish before releasing.
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(200);
      cy.get('body').realMouseUp({ x: to.x, y: to.y });
    });
  });
});

declare global {
  // Augmenting Cypress's own global Chainable interface requires a namespace -
  // there's no ES module equivalent for this kind of ambient declaration merging.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      dragAndDrop(source: string, target: string): Chainable<void>;
    }
  }
}

export {};
