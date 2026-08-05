describe('Form renderer preview', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows an empty state when no fields have been added', () => {
    cy.get('[data-cy=center-tab-preview]').click();

    cy.get('[data-cy=form-renderer-empty]').should('be.visible');
    cy.get('[data-cy=form-renderer-form]').should('not.exist');
  });

  it('renders added fields in order, numbered from 1, using their titles as labels', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=add-field-number]').click();

    cy.get('[data-cy=center-tab-preview]').click();

    cy.get('[data-cy^=preview-index-]').eq(0).should('contain.text', '1');
    cy.get('[data-cy^=preview-index-]').eq(1).should('contain.text', '2');
    cy.get('[data-cy^=preview-field-]').eq(0).should('contain.text', 'Text field');
    cy.get('[data-cy^=preview-field-]').eq(1).should('contain.text', 'Number field');
  });

  it('updates the preview immediately when a field is added while it is open', () => {
    cy.get('[data-cy=center-tab-preview]').click();
    cy.get('[data-cy^=preview-field-]').should('have.length', 0);

    cy.get('[data-cy=center-tab-fields]').click();
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy=center-tab-preview]').click();
    cy.get('[data-cy^=preview-field-]').should('have.length', 1);
  });

  it('updates the preview label immediately when a field title is edited', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=field-title-input] input').clear();
    cy.get('[data-cy=field-title-input] input').type('Full name');

    cy.get('[data-cy=center-tab-preview]').click();

    cy.get('[data-cy^=preview-field-]').should('contain.text', 'Full name');
  });

  it('flags a required text field left empty', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=field-required-checkbox] input').check({ force: true });

    cy.get('[data-cy=center-tab-preview]').click();
    cy.get('[data-cy^=preview-field-] input').click();
    cy.get('[data-cy^=preview-field-] input').blur();

    cy.get('[data-cy^=preview-field-]').should('contain.text', 'is required');
  });

  it("enforces a text field's minLength and maxLength", () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=field-min-length-input] input').type('5');
    cy.get('[data-cy=field-max-length-input] input').type('8');

    cy.get('[data-cy=center-tab-preview]').click();
    cy.get('[data-cy^=preview-field-] input').type('ab');
    cy.get('[data-cy^=preview-field-] input').blur();

    cy.get('[data-cy^=preview-field-]').should('contain.text', 'at least 5 characters');

    cy.get('[data-cy^=preview-field-] input').clear();
    cy.get('[data-cy^=preview-field-] input').type('abcdefghi');
    cy.get('[data-cy^=preview-field-] input').blur();

    cy.get('[data-cy^=preview-field-]').should('contain.text', 'at most 8 characters');
  });

  it("enforces a number field's min/max bounds", () => {
    cy.get('[data-cy=add-field-number]').click();
    cy.get('[data-cy=field-min-input] input').type('10');
    cy.get('[data-cy=field-max-input] input').type('20');

    cy.get('[data-cy=center-tab-preview]').click();

    cy.get('[data-cy^=preview-field-] input').type('5');
    cy.get('[data-cy^=preview-field-] input').blur();
    cy.get('[data-cy^=preview-field-] input').should('have.value', 10);

    cy.get('[data-cy^=preview-field-] input').clear();
    cy.get('[data-cy^=preview-field-] input').type('25');
    cy.get('[data-cy^=preview-field-] input').blur();
    cy.get('[data-cy^=preview-field-] input').should('have.value', 20);
  });

  it('renders a selection field as a dropdown of its configured options', () => {
    cy.get('[data-cy=add-field-selection]').click();

    cy.get('[data-cy=center-tab-preview]').click();
    cy.get('[data-cy^=preview-field-]').click();
    cy.get('.v-list-item').contains('Option 1').click();

    cy.get('[data-cy^=preview-field-]').should('contain.text', 'Option 1');
  });

  it('resets entered values back to empty when the reset button is clicked', () => {
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy=center-tab-preview]').click();
    cy.get('[data-cy^=preview-field-] input').type('Some value');
    cy.get('[data-cy^=preview-field-] input').should('have.value', 'Some value');

    cy.get('[data-cy=form-renderer-reset-button]').click();

    cy.get('[data-cy^=preview-field-] input').should('have.value', '');
  });

  it('selects a field in the properties panel when its preview input is focused', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=add-field-number]').click();

    cy.get('[data-cy=center-tab-preview]').click();
    cy.get('[data-cy^=preview-field-] input').first().focus();

    cy.get('[data-cy=field-title-input] input').should('have.value', 'Text field');
  });

  describe('conditional fields', () => {
    beforeEach(() => {
      cy.get('[data-cy=add-field-selection]').click();
      cy.get('[data-cy=add-option-button]').click();
      cy.get('[data-cy=add-field-text]').click();

      cy.get('[data-cy=add-condition-button]').click();
      cy.get('[data-cy^=condition-field-select-]').click();
      cy.get('.v-overlay__content .v-list-item').contains('Selection field').click();
      cy.get('[data-cy^=condition-values-select-]').click();
      cy.get('.v-overlay__content .v-list-item').contains('Option 1').click();
      cy.get('body').type('{esc}');
    });

    it('hides a field until the field it depends on matches, and hides it again once it stops matching', () => {
      cy.get('[data-cy=center-tab-preview]').click();
      cy.get('[data-cy^=preview-field-]').should('have.length', 1);

      cy.get('[data-cy^=preview-field-]').click();
      cy.get('.v-list-item').contains('Option 1').click();
      cy.get('[data-cy^=preview-field-]').should('have.length', 2);

      cy.get('[data-cy^=preview-field-]').eq(0).click();
      cy.get('.v-list-item').contains('Option 2').click();
      cy.get('[data-cy^=preview-field-]').should('have.length', 1);
    });

    it('shows the field again once its only condition is removed', () => {
      cy.get('[data-cy=center-tab-preview]').click();
      cy.get('[data-cy^=preview-field-]').should('have.length', 1);

      cy.get('[data-cy=center-tab-fields]').click();
      cy.get('[data-cy^=remove-condition-button-]').click();

      cy.get('[data-cy=center-tab-preview]').click();
      cy.get('[data-cy^=preview-field-]').should('have.length', 2);
    });
  });
});
