describe('Mobile form builder', () => {
  beforeEach(() => {
    cy.viewport(390, 844);
    cy.visit('/');
  });

  it('shows the single-panel mobile layout instead of the three desktop panels', () => {
    cy.get('[data-cy=mobile-form-builder]').should('be.visible');
    cy.get('[data-cy=panel-heading-palette]').should('not.exist');
  });

  it('starts on the field list with no back button', () => {
    cy.get('[data-cy=mobile-page-title]').should('contain.text', 'Form');
    cy.get('[data-cy=mobile-back-button]').should('not.exist');
    cy.get('[data-cy=field-list-empty]').should('be.visible');
  });

  it('adds a field from the palette menu and jumps straight to its properties', () => {
    cy.get('[data-cy=mobile-add-field-button]').click();
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy=mobile-page-title]').should('contain.text', 'Text field');
    cy.get('[data-cy=mobile-back-button]').should('be.visible');
    cy.get('[data-cy=field-properties-editor]').should('be.visible');
  });

  it('returns to the field list and deselects when the back button is pressed', () => {
    cy.get('[data-cy=mobile-add-field-button]').click();
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy=mobile-back-button]').click();

    cy.get('[data-cy=mobile-page-title]').should('contain.text', 'Form');
    cy.get('[data-cy=mobile-back-button]').should('not.exist');
    cy.get('[data-cy^=field-list-item-]').should('have.length', 1);
  });

  it("opens an existing field's properties by tapping it in the list", () => {
    cy.get('[data-cy=mobile-add-field-button]').click();
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=mobile-back-button]').click();

    cy.get('[data-cy^=field-list-item-]').click();

    cy.get('[data-cy=mobile-page-title]').should('contain.text', 'Text field');
    cy.get('[data-cy=field-properties-editor]').should('be.visible');
  });
});
