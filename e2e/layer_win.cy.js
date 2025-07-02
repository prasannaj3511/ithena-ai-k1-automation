describe('K1_TC103 - Open Layer (Tools) Window', () => {
  it('should click the Tools button and verify the layer window appears', () => {
    cy.visit('http://localhost:4288');

    // Click Tools button
    cy.get('button.layer-btn').should('be.visible').click();

    // Wait briefly for the popup to render
    cy.wait(1000);

    // ✅ Dump the DOM to console
    cy.get('body').then(($body) => {
      console.log('BODY HTML:', $body.html()); // <-- See in Cypress test runner console
    });
  });
});
