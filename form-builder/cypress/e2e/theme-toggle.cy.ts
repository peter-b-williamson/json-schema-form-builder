describe('Dark mode toggle', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('toggles the theme and persists the choice across reloads', () => {
    cy.visit('/');

    cy.get('[data-cy=theme-toggle] input').then(($input) => {
      const wasDark = $input.is(':checked');
      const expectedMode = wasDark ? 'light' : 'dark';
      const expectedChecked = wasDark ? 'not.be.checked' : 'be.checked';

      cy.wrap($input).click({ force: true });

      cy.get('[data-cy=theme-toggle] input').should(expectedChecked);
      cy.window().its('localStorage').invoke('getItem', 'theme').should('eq', expectedMode);

      cy.reload();

      cy.get('[data-cy=theme-toggle] input').should(expectedChecked);
    });
  });
});
