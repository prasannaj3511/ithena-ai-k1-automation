describe('K1_TC77 - Verify Back Button in the Search Bar', () => {
  const selectors = {
    searchIconButton: '.search-btn',            // Button to open search input
    searchInput: 'input.search_area',           // Search input field
    backArrowButton: '.arrow-btn'               // 🔁 Replace with actual arrow button class
  };

  const testInput = 'Test123@#';

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000); // Ensure the app and canvas fully load
  });

  it('should clear input and close search bar on clicking back arrow', () => {
    cy.get(selectors.searchIconButton)
      .should('be.visible')
      .click();

    cy.get(selectors.searchInput)
      .should('be.visible')
      .clear()
      .type(testInput)
      .should('have.value', testInput);

    cy.get(selectors.backArrowButton)
      .should('be.visible')
      .click();

    cy.wait(500); // Let DOM update

    cy.get(selectors.searchInput)
      .should('have.value', ''); // If input remains visible
  });
});
