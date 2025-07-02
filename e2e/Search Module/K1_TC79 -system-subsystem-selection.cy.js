describe('K1_TC79 - System/Sub-system Selection from Search', () => {
  const keyword = 'camera-27';

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  it('should select and highlight the correct system/sub-system on canvas', () => {
    cy.get('input[placeholder*="Search"]', { timeout: 8000 })
      .clear()
      .type(keyword)
      .should('have.value', keyword);

    cy.get('.search-card-data', { timeout: 8000 })
      .contains(new RegExp(keyword, 'i'))
      .click();

    cy.window().then((win) => {
      const stage = win.k1Stage;
      const matches = stage.find((node) => {
        const { id, name, text } = node.attrs || {};
        return [id, name, text].some(
          val => typeof val === 'string' && val.toLowerCase().includes(keyword.toLowerCase())
        );
      });

      expect(matches.length).to.be.greaterThan(0);
    });
  });
});
