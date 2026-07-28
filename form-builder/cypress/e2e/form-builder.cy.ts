describe('Form builder page', () => {
  it('renders the app bar and the three placeholder panels', () => {
    cy.visit('/');

    cy.get('[data-cy=app-title]').should('contain.text', 'JSON Schema Form Builder');
    cy.get('[data-cy=panel-heading-palette]').should('contain.text', 'Component Palette');
    cy.get('[data-cy=panel-heading-form]').should('contain.text', 'Form');
    cy.get('[data-cy=panel-heading-properties]').should('contain.text', 'Properties');
  });

  it('redirects unknown routes to the form builder page', () => {
    cy.visit('/some/unknown/route');

    cy.location('pathname').should('eq', '/');
    cy.get('[data-cy=panel-heading-palette]').should('be.visible');
  });
});
