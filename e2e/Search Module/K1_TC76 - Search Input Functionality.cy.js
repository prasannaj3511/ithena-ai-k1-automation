describe('K1_TC76 - Search Bar Input Functionality', () => {
  const searchSelector = 'input.search_area, input[placeholder="Search"], input[type="text"]';

  const testInputs = {
    lowercase: 'map designer',
    uppercase: 'MAP DESIGNER',
    numbers: '1234567890',
    specialChars: '!@#$%^&*()_+-=/'
  };

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  it('should allow typing lowercase, uppercase, numbers, and special characters into the search bar', () => {
    cy.get(searchSelector, { timeout: 8000 }).should('be.visible').as('searchInput');

    Object.entries(testInputs).forEach(([label, input]) => {
      cy.log(`🔍 Typing ${label}`);
      cy.get('@searchInput').clear().type(input).should('have.value', input);
      cy.wait(400);
    });
  });
});
