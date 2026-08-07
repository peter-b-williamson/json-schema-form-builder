describe('Importing a schema', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('imports into an empty form without a confirmation prompt, and reports the result', () => {
    cy.get('[data-cy=import-schema-button]').click();
    cy.get('[data-cy=import-confirm-dialog]').should('not.exist');

    cy.get('[data-cy=import-file-input]').selectFile('cypress/fixtures/import-valid-schema.json', {
      force: true,
    });

    cy.get('[data-cy=import-report-dialog]').should('be.visible');
    cy.get('[data-cy=import-report-heading]').should('contain.text', 'Import complete');
    cy.get('[data-cy=import-report-summary]').should('contain.text', 'Imported 3 fields');
    cy.get('[data-cy=import-report-ignored-item]').should('not.exist');

    cy.get('[data-cy=import-report-close-button]').click();
    cy.get('[data-cy=import-report-dialog]').should('not.exist');

    cy.get('[data-cy^="field-list-item-"]').should('have.length', 3);
  });

  it('warns about data loss before importing over an existing form, and cancel keeps the form', () => {
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy=import-schema-button]').click();
    cy.get('[data-cy=import-confirm-dialog]').should('be.visible');
    cy.get('[data-cy=import-confirm-cancel-button]').click();
    cy.get('[data-cy=import-confirm-dialog]').should('not.exist');

    cy.get('[data-cy^="field-list-item-"]').should('have.length', 1);
  });

  it('replaces the form and clears undo history once the import is confirmed', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=undo-button]').should('not.be.disabled');

    cy.get('[data-cy=import-schema-button]').click();
    cy.get('[data-cy=import-confirm-dialog]').should('be.visible');
    cy.get('[data-cy=import-confirm-proceed-button]').click();

    cy.get('[data-cy=import-file-input]').selectFile('cypress/fixtures/import-valid-schema.json', {
      force: true,
    });

    cy.get('[data-cy=import-report-dialog]').should('be.visible');
    cy.get('[data-cy=import-report-close-button]').click();

    cy.get('[data-cy^="field-list-item-"]').should('have.length', 3);
    cy.get('[data-cy=undo-button]').should('be.disabled');
    cy.get('[data-cy=redo-button]').should('be.disabled');
  });

  it('reports fields and keywords it cannot model, but still imports the rest', () => {
    cy.get('[data-cy=import-schema-button]').click();

    cy.get('[data-cy=import-file-input]').selectFile(
      'cypress/fixtures/import-unsupported-schema.json',
      { force: true },
    );

    cy.get('[data-cy=import-report-summary]').should('contain.text', 'Imported 2 fields');
    cy.get('[data-cy=import-report-ignored-item]').should('have.length', 2);
    cy.get('[data-cy=import-report-ignored-item]').eq(0).should('contain.text', 'isActive');
    cy.get('[data-cy=import-report-ignored-item]').eq(1).should('contain.text', 'format');
  });

  it('shows an error and leaves the current form untouched for a file that is not valid JSON', () => {
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy=import-schema-button]').click();
    cy.get('[data-cy=import-confirm-proceed-button]').click();

    cy.get('[data-cy=import-file-input]').selectFile('cypress/fixtures/import-invalid.txt', {
      force: true,
    });

    cy.get('[data-cy=import-report-heading]').should('contain.text', 'Import failed');
    cy.get('[data-cy=import-report-error]').should('contain.text', 'not valid JSON');

    cy.get('[data-cy=import-report-close-button]').click();
    cy.get('[data-cy^="field-list-item-"]').should('have.length', 1);
  });

  it('shows an error for valid JSON that is not an object schema', () => {
    cy.get('[data-cy=import-schema-button]').click();

    cy.get('[data-cy=import-file-input]').selectFile('cypress/fixtures/import-not-a-schema.json', {
      force: true,
    });

    cy.get('[data-cy=import-report-heading]').should('contain.text', 'Import failed');
    cy.get('[data-cy=import-report-error]').should('be.visible');
  });
});
