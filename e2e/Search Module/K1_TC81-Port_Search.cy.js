describe('K1_TC81 - Search and highlight ports', () => {
  const keyword = 'port-604'; 

  it('should search a port and highlight it with its title on canvas', () => {
    cy.visit('http://localhost:4288');
    cy.get('input[placeholder*="Search"]', { timeout: 8000 }).clear().type(keyword);

    cy.get('.search-card-data', { timeout: 8000 })
      .contains(new RegExp(keyword, 'i'))
      .click();

    cy.window().then((win) => {
      const stage = win.k1Stage;
      const matches = stage.find((node) => {
        const attrs = node.attrs || {};
        return Object.values(attrs).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(keyword)
        );
      });

      expect(matches.length).to.be.greaterThan(0);
    });
  });
});
