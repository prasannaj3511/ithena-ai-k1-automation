describe('K1 Map Project Screenshot', () => {
  it('should open the localhost project and take a screenshot', () => {
    cy.visit('http://localhost:4288/'); // or your actual localhost port
    cy.wait(2000); // wait for the page to fully load
    cy.screenshot('k1-map-homepage'); // screenshot name (saved in screenshots folder)
  });
});
