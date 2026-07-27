describe('Home page', () => {
  it('renders the app and increments the counter', () => {
    cy.visit('/');

    cy.contains('Vue 3 + Vuetify + Pinia');
    cy.contains('Count: 0');

    cy.contains('button', 'Increment').click();

    cy.contains('Count: 1');
  });
});
