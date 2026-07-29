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

describe('Managing fields', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows a placeholder in the properties panel when no field is selected', () => {
    cy.get('[data-cy=field-properties-empty]').should('be.visible');
  });

  it('adds a field from the palette, auto-selects it, and lists it in the form', () => {
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy^=field-list-item-]')
      .should('have.length', 1)
      .should('contain.text', 'Text field');
    cy.get('[data-cy=field-title-input] input').should('have.value', 'Text field');
  });

  it('edits a field title and sees it reflected in the field list', () => {
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy=field-title-input] input').clear();
    cy.get('[data-cy=field-title-input] input').type('Full name');

    cy.get('[data-cy^=field-list-item-]').should('contain.text', 'Full name');
  });

  it('edits type-specific properties on a number field', () => {
    cy.get('[data-cy=add-field-number]').click();

    cy.get('[data-cy=field-min-input] input').type('0');
    cy.get('[data-cy=field-max-input] input').type('100');
    cy.get('[data-cy=field-is-float-checkbox] input').check({ force: true });

    cy.get('[data-cy=field-min-input] input').should('have.value', '0');
    cy.get('[data-cy=field-max-input] input').should('have.value', '100');
    cy.get('[data-cy=field-is-float-checkbox] input').should('be.checked');
  });

  it('adds and removes options on a selection field', () => {
    cy.get('[data-cy=add-field-selection]').click();

    cy.get('[data-cy^=option-row-]').should('have.length', 1);

    cy.get('[data-cy=add-option-button]').click();
    cy.get('[data-cy^=option-row-]').should('have.length', 2);

    cy.get('[data-cy^=remove-option-button-]').first().click();
    cy.get('[data-cy^=option-row-]').should('have.length', 1);
  });

  it('switches the properties panel when a different field is selected', () => {
    cy.get('[data-cy=add-field-text]').click();
    cy.get('[data-cy=add-field-number]').click();

    cy.get('[data-cy=field-title-input] input').should('have.value', 'Number field');

    cy.get('[data-cy^=field-list-item-]').first().click();

    cy.get('[data-cy=field-title-input] input').should('have.value', 'Text field');
  });

  it('removes a field and clears the selection if it was selected', () => {
    cy.get('[data-cy=add-field-text]').click();

    cy.get('[data-cy^=remove-field-button-]').click();

    cy.get('[data-cy^=field-list-item-]').should('have.length', 0);
    cy.get('[data-cy=field-properties-empty]').should('be.visible');
  });
});
