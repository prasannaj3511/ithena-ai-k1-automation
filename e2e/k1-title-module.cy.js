describe('K1_TC179 - Bus Anchor Visibility on Selection', () => {
  before(() => {
    cy.visit('/');
    cy.title().should('include', 'K1WebApp');
  });

  it('should show anchors only on selected bus in Map Designer mode', () => {
    // Enable Map Designer Mode
    cy.get('[data-testid="designer-mode-toggle"]').click({ force: true });

    // Select the bus (e.g., bus_001)
    cy.get('[data-testid="bus_001"]').click();

    // Check if anchors are visible on both ends
    cy.get('[data-testid="bus_001-start-anchor"]').should('be.visible');
    cy.get('[data-testid="bus_001-end-anchor"]').should('be.visible');

    // Verify anchor appearance (type, size, color)
    cy.get('[data-testid="bus_001-start-anchor"]')
      .should('have.attr', 'data-shape', 'diamond')
      .and('have.css', 'fill', 'rgb(0, 0, 255)') // blue

    // Ensure no other buses have visible anchors
    cy.get('[data-testid^="bus_"]').each(($bus) => {
      const id = $bus.attr('data-testid');
      if (id !== 'bus_001') {
        cy.get(`[data-testid="${id}-start-anchor"]`).should('not.exist');
        cy.get(`[data-testid="${id}-end-anchor"]`).should('not.exist');
      }
    });
  });
});
