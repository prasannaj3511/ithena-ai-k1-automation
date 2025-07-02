describe('K1_TC24 - Zoom by Controls', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4288');
  });

  it('should visually zoom in and out using + and - buttons', () => {
    // Wait for k1Stage to be available and retry until it is
    cy.window()
      .its('k1Stage', { timeout: 10000 }) // Wait up to 10 seconds
      .should('exist')
      .then((stage) => {
        const initialScale = stage.scaleX();

        // Click Zoom In button multiple times
        cy.get('#zoomInButton').click().wait(300);
        cy.get('#zoomInButton').click().wait(300);
        cy.get('#zoomInButton').click().wait(300);

        cy.wait(500).then(() => {
          const afterZoomIn = stage.scaleX();
          expect(afterZoomIn).to.be.greaterThan(initialScale);

          // Click Zoom Out button multiple times
          cy.get('#zoomOutButton').click().wait(300);
          cy.get('#zoomOutButton').click().wait(300);
          cy.get('#zoomOutButton').click().wait(300);

          cy.wait(500).then(() => {
            const afterZoomOut = stage.scaleX();
            expect(afterZoomOut).to.be.lessThan(afterZoomIn);
          });
        });
      });
  });
});
