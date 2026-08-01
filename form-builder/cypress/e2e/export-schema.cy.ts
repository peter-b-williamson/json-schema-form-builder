describe('Exporting the schema', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('opens the export dialog from the fab and closes it on cancel', () => {
    cy.get('[data-cy=export-schema-dialog]').should('not.exist');

    // Reference actual button inside v-fab wrapping element
    cy.get('[data-cy=export-schema-button] button').click();

    cy.get('[data-cy=export-schema-dialog]').should('be.visible');
    cy.get('[data-cy=export-dialog-heading]').should('contain.text', 'Export Schema');
    cy.get('[data-cy=export-filename-input] input').should('have.value', 'schema');

    cy.get('[data-cy=export-cancel-button]').click();

    cy.get('[data-cy=export-schema-dialog]').should('not.exist');
  });

  it('downloads a draft 2020-12 schema reflecting the current fields, appending the suffix', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=field-required-checkbox] input').check({ force: true });
    cy.get('[data-cy=add-field-number]').click();

    const filename = `export-${Date.now()}`;

    // Reference actual button inside v-fab wrapping element
    cy.get('[data-cy=export-schema-button] button').click();
    cy.get('[data-cy=export-filename-input] input').clear();
    cy.get('[data-cy=export-filename-input] input').type(filename);
    cy.get('[data-cy=export-download-button]').click();

    cy.get('[data-cy=export-schema-dialog]').should('not.exist');

    cy.readFile(`cypress/downloads/${filename}.schema.json`).then((schema) => {
      expect(schema.$schema).to.eq('https://json-schema.org/draft/2020-12/schema');
      expect(schema.type).to.eq('object');
      expect(schema.properties.textField).to.include({ title: 'Text field', type: 'string' });
      expect(schema.properties.numberField).to.include({ title: 'Number field', type: 'integer' });
      expect(schema.required).to.deep.equal(['textField']);
    });
  });

  it('does not double up the suffix when the user already typed it', () => {
    const filename = `already-suffixed-${Date.now()}.schema.json`;

    // Reference actual button inside v-fab wrapping element
    cy.get('[data-cy=export-schema-button] button').click();
    cy.get('[data-cy=export-filename-input] input').clear();
    cy.get('[data-cy=export-filename-input] input').type(filename);
    cy.get('[data-cy=export-download-button]').click();

    cy.readFile(`cypress/downloads/${filename}`).should('exist');
  });
});
