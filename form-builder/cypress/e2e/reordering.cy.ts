describe('Reordering', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  const expectText = (selector: string, index: number, value: string) => {
    cy.get(selector)
      .eq(index)
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal(value);
      });
  };

  describe('field list', () => {
    it('reorders two fields by dragging the first onto the second', () => {
      cy.get('[data-cy=add-field-text]').click();
      cy.get('[data-cy=field-title-input] input').clear();
      cy.get('[data-cy=field-title-input] input').type('First field');

      cy.get('[data-cy=add-field-number]').click();
      cy.get('[data-cy=field-title-input] input').clear();
      cy.get('[data-cy=field-title-input] input').type('Second field');

      cy.get('[data-cy^="field-list-item-"]').eq(0).should('contain.text', 'First field');
      cy.get('[data-cy^="field-list-item-"]').eq(1).should('contain.text', 'Second field');

      cy.dragAndDrop('[data-cy^="field-list-item-"]:eq(0)', '[data-cy^="field-list-item-"]:eq(1)');

      cy.get('[data-cy^="field-list-item-"]').eq(0).should('contain.text', 'Second field');
      cy.get('[data-cy^="field-list-item-"]').eq(1).should('contain.text', 'First field');
    });

    it('updates the visible index marker on every row after reordering', () => {
      cy.get('[data-cy=add-field-text]').click();
      cy.get('[data-cy=add-field-number]').click();
      cy.get('[data-cy=add-field-selection]').click();

      cy.dragAndDrop('[data-cy^="field-list-item-"]:eq(2)', '[data-cy^="field-list-item-"]:eq(0)');

      expectText('[data-cy^="field-index-"]', 0, '1');
      expectText('[data-cy^="field-index-"]', 1, '2');
      expectText('[data-cy^="field-index-"]', 2, '3');
    });

    it('leaves the current selection untouched by a drag', () => {
      cy.get('[data-cy=add-field-text]').click();
      cy.get('[data-cy=add-field-number]').click();

      // Adding a field auto-selects it, so the number field is selected here.
      cy.get('[data-cy=field-title-input] input').should('have.value', 'Number field');

      cy.dragAndDrop('[data-cy^="field-list-item-"]:eq(0)', '[data-cy^="field-list-item-"]:eq(1)');

      cy.get('[data-cy=field-title-input] input').should('have.value', 'Number field');
    });
  });

  describe('select options', () => {
    it('reorders two options by dragging the first onto the second', () => {
      cy.get('[data-cy=add-field-selection]').click();
      cy.get('[data-cy=add-option-button]').click();

      cy.get('[data-cy^="option-row-"]').should('have.length', 2);
      cy.get('[data-cy^="option-label-input-"] input').eq(0).should('have.value', 'Option 1');
      cy.get('[data-cy^="option-label-input-"] input').eq(1).should('have.value', 'Option 2');

      cy.dragAndDrop('[data-cy^="option-drag-handle-"]:eq(0)', '[data-cy^="option-row-"]:eq(1)');

      cy.get('[data-cy^="option-label-input-"] input').eq(0).should('have.value', 'Option 2');
      cy.get('[data-cy^="option-label-input-"] input').eq(1).should('have.value', 'Option 1');
    });

    it('updates the visible index marker on every row after reordering', () => {
      cy.get('[data-cy=add-field-selection]').click();
      cy.get('[data-cy=add-option-button]').click();
      cy.get('[data-cy=add-option-button]').click();

      cy.dragAndDrop('[data-cy^="option-drag-handle-"]:eq(2)', '[data-cy^="option-row-"]:eq(0)');

      expectText('[data-cy^="option-index-"]', 0, '1');
      expectText('[data-cy^="option-index-"]', 1, '2');
      expectText('[data-cy^="option-index-"]', 2, '3');
    });
  });
});
