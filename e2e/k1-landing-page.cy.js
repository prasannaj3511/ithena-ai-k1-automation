describe('K1_TC1 - Landing Page Verification', () => {
  it('should successfully load the K1 web app landing page', () => {
    // Visit the root of your running app
    cy.visit('/');

    // Assert the page title is correct (from your browser tab)
    cy.title().should('include', 'K1WebApp');

    // Assert the current URL is correct
    cy.url().should('include', 'localhost:4288');

    // Optional: check that the Search bar exists
    cy.get('input[placeholder="Search"]').should('exist');
  });
});
