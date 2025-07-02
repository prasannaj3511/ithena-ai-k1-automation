describe('K1_TC80 - Search ECUs, Connectors, and Sensors highlights on canvas', () => {
  const keyword = 'connector34';

  beforeEach(() => {
    cy.visit('http://localhost:4288');
  });

  it('should highlight searched ECU/Connector/Sensor and its connections on the canvas', () => {
    cy.get('input[placeholder*="Search"]', { timeout: 8000 }).clear().type(keyword);
    cy.get('.search-card-data', { timeout: 8000 }).contains(new RegExp(keyword, 'i')).click();

    cy.window().then((win) => {
      const stage = win.k1Stage;
      const nodes = stage.find((node) => {
        const attrs = node.attrs || {};
        return Object.values(attrs).some((val) =>
          typeof val === 'string' && val.toLowerCase().includes(keyword)
        );
      });
      expect(nodes.length).to.be.greaterThan(0);
    });
  });
});
