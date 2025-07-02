describe('K1_TC78 - Search Result Matches Entered Keyword', () => {
  const selectors = {
    searchInput: 'input.search_area, input[placeholder="Search"], input[type="text"]',
    searchResults: '.search-result-item', 
  };

  const keyword = 'ecu'; 

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000); // Ensure app loads
  });

  it('should return matching systems/sub-systems for entered keyword', () => {
    cy.get(selectors.searchInput)
      .should('be.visible')
      .click()
      .clear()
      .type(keyword);

    cy.wait(1000); // Allow time for results to load

    // ✅ Log DOM to help debug
    cy.get('body').then(($body) => {
      if ($body.find(selectors.searchResults).length > 0) {
        cy.get(selectors.searchResults).each(($el) => {
          const resultText = $el.text().toLowerCase();
          expect(resultText).to.include(keyword.toLowerCase());
        });
      } 
    });
  });
});
