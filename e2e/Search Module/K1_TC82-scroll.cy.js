describe('K1_TC82 - Verify user can search and select Systems/Sub-systems', () => {
  const searchKeyword = 'p';
  const expectedSelection = 'perception-4';

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  it(`should search "${searchKeyword}", select "${expectedSelection}", and highlight on canvas`, () => {
    cy.get('input[placeholder*="Search"]', { timeout: 8000 }).clear().type(searchKeyword);
    
    cy.get('.search-card-data', { timeout: 8000 })
      .contains(new RegExp(expectedSelection, 'i'))
      .click({ force: true });

    cy.wait(1000);

    cy.window().then((win) => {
      const stage = win.k1Stage;
      expect(stage).to.exist;

      const match = stage.find(node => {
        const name = typeof node.name === 'function' ? node.name() : node.name;
        return name?.toLowerCase() === expectedSelection.toLowerCase();
      })[0];

      expect(match).to.exist;
      expect(match.attrs.fill).to.exist;
    });
  });
});
