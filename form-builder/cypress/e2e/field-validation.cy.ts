describe('Field property validation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('flags a number field whose max is less than its min, in the list and inline, and clears once fixed', () => {
    cy.get('[data-cy=add-field-number]').click();
    cy.get('[data-cy=field-min-input] input').type('10');
    cy.get('[data-cy=field-max-input] input').type('5');

    cy.get('[data-cy^=field-error-icon-]').should('be.visible');
    cy.get('[data-cy=field-min-input]').should(
      'contain.text',
      'Minimum must be less than or equal to maximum',
    );
    cy.get('[data-cy=field-max-input]').should(
      'contain.text',
      'Maximum must be greater than or equal to minimum',
    );

    cy.get('[data-cy=field-max-input] input').clear();
    cy.get('[data-cy=field-max-input] input').type('20');

    cy.get('[data-cy^=field-error-icon-]').should('not.exist');
    cy.get('[data-cy=field-min-input]').should(
      'not.contain.text',
      'Minimum must be less than or equal to maximum',
    );
  });

  it('flags a text field whose minLength is 0 and whose maxLength is below its minLength', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=field-min-length-input] input').type('0');

    cy.get('[data-cy=field-min-length-input]').should(
      'contain.text',
      'Minimum length must be greater than 0',
    );

    cy.get('[data-cy=field-min-length-input] input').clear();
    cy.get('[data-cy=field-min-length-input] input').type('5');
    cy.get('[data-cy=field-max-length-input] input').type('2');

    cy.get('[data-cy=field-max-length-input]').should(
      'contain.text',
      'Maximum length must be greater than or equal to minimum length',
    );
  });

  describe('conditions', () => {
    it('defers an unset field reference until the field is navigated away from, then shows it', () => {
      cy.get('[data-cy=add-field-text]').click();
      cy.get('[data-cy=add-field-text]').click();

      cy.get('[data-cy=add-condition-button]').click();

      // Not yet configured - the field list already flags it, but the inline message stays quiet.
      cy.get('[data-cy^=field-error-icon-]').should('be.visible');
      cy.get('[data-cy^=condition-field-select-]').should('not.contain.text', 'Select a field');

      // Navigate to the other field and back.
      cy.get('[data-cy^=field-list-item-]').first().click();
      cy.get('[data-cy^=field-list-item-]').eq(1).click();

      cy.get('[data-cy^=condition-field-select-]').should(
        'contain.text',
        'Select a field this condition depends on',
      );
    });

    it('defers an empty values list once the field reference resolves, then shows it', () => {
      cy.get('[data-cy=add-field-text]').click();
      cy.get('[data-cy=add-field-text]').click();
      cy.get('[data-cy=add-condition-button]').click();

      cy.get('[data-cy^=condition-field-select-]').click();
      cy.get('.v-overlay__content .v-list-item').contains('Text field').click();
      cy.get('body').type('{esc}');

      cy.get('[data-cy^=field-error-icon-]').should('be.visible');
      cy.get('[data-cy^=condition-values-combobox-]').should(
        'not.contain.text',
        'Select at least one value',
      );

      cy.get('[data-cy^=field-list-item-]').first().click();
      cy.get('[data-cy^=field-list-item-]').eq(1).click();

      cy.get('[data-cy^=condition-values-combobox-]').should(
        'contain.text',
        'Select at least one value',
      );
    });
  });

  describe('selection fields', () => {
    it.only('drops an option left with no label or value once the field is left', () => {
      cy.get('[data-cy=add-field-selection]').click();
      cy.get('[data-cy=add-option-button]').click();
      cy.get('[data-cy^=option-row-]').should('have.length', 2);

      cy.get('[data-cy^=option-value-input-]').last().clear();
      cy.get('[data-cy^=option-label-input-]').last().clear();

      // Adding another field selects it, leaving (and pruning) the selection field.
      cy.get('[data-cy=add-field-text]').click();
      cy.get('[data-cy^=field-list-item-]').first().click();

      cy.get('[data-cy^=option-row-]').should('have.length', 1);
    });

    it('flags a selection field with no options and blocks export', () => {
      cy.get('[data-cy=add-field-selection]').click();
      cy.get('[data-cy^=remove-option-button-]').click();

      cy.get('[data-cy^=field-error-icon-]').should('be.visible');
      cy.get('[data-cy=options-error]').should('contain.text', 'Must have at least one option');

      cy.get('[data-cy=export-schema-button]').click();
      cy.get('[data-cy=export-download-button]').should('be.disabled');
    });
  });

  it('disables the download button while invalid, reveals deferred errors on open, and re-enables once fixed', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=add-condition-button]').click();

    // Reference field is still unset and unvisited - deferred inline until export is attempted.
    cy.get('[data-cy=export-schema-button]').click();
    cy.get('[data-cy=export-validation-error]').should('be.visible');
    cy.get('[data-cy=export-download-button]').should('be.disabled');

    cy.get('[data-cy=export-cancel-button]').click();

    // Opening the dialog should have revealed the deferred error even though this field
    // was never navigated away from.
    cy.get('[data-cy^=condition-field-select-]').should(
      'contain.text',
      'Select a field this condition depends on',
    );

    // Fix it: point the condition at the other field and give it a value.
    cy.get('[data-cy^=condition-field-select-]').click();
    cy.get('.v-overlay__content .v-list-item').contains('Text field').click();
    cy.get('body').type('{esc}');
    cy.get('[data-cy^=condition-values-combobox-] input').type('some-value{enter}');
    cy.get('[data-cy=field-title-input] input').click();

    cy.get('[data-cy^=field-error-icon-]').should('not.exist');

    const filename = `field-validation-${Date.now()}`;
    cy.get('[data-cy=export-schema-button]').click();
    cy.get('[data-cy=export-download-button]').should('not.be.disabled');
    cy.get('[data-cy=export-filename-input] input').clear();
    cy.get('[data-cy=export-filename-input] input').type(filename);
    cy.get('[data-cy=export-download-button]').click();

    cy.get('[data-cy=export-schema-dialog]').should('not.exist');
    cy.readFile(`cypress/downloads/${filename}.schema.json`).should('exist');
  });
});
