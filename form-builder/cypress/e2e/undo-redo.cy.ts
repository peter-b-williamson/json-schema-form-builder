describe('Undo/redo', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('disables both buttons until there is something to undo or redo', () => {
    cy.get('[data-cy=undo-button]').should('be.disabled');
    cy.get('[data-cy=redo-button]').should('be.disabled');

    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy=undo-button]').should('not.be.disabled');
    cy.get('[data-cy=redo-button]').should('be.disabled');
  });

  it('undoes and redoes adding a field via the fab buttons', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 1);

    cy.get('[data-cy=undo-button]').click();
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 0);

    cy.get('[data-cy=redo-button]').click();
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 1);
  });

  it('undoes with ctrl+z and redoes with ctrl+y', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 1);

    cy.get('body').type('{ctrl}z');
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 0);

    cy.get('body').type('{ctrl}y');
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 1);
  });

  it('redoes with ctrl+shift+z', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('body').type('{ctrl}z');
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 0);

    cy.get('body').type('{ctrl}{shift}z');
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 1);
  });

  it('coalesces a burst of title edits into a single undo step', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=field-title-input] input').clear();
    cy.get('[data-cy=field-title-input] input').type('Full name');

    cy.get('[data-cy=undo-button]').click();

    cy.get('[data-cy=field-title-input] input').should('have.value', 'Text field');
  });

  it('clears the redo stack once a new action is taken', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=undo-button]').click();
    cy.get('[data-cy=redo-button]').should('not.be.disabled');

    cy.get('[data-cy=add-field-number]').click();

    cy.get('[data-cy=redo-button]').should('be.disabled');
  });
});
