describe('K1_TC1 - Landing Page Verification', () => {
  it('should load the K1 homepage when the user enters the URL', () => {
    cy.visit('/');
    cy.contains('K1').should('exist'); // Replace 'K1' with visible text from your homepage
  });
});
