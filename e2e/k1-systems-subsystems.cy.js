describe('K1_TC12 - Validate Systems and Subsystems', () => {
  it('should reveal subsystems when zooming in using zoom button', () => {
    cy.visit('/');
    cy.title().should('include', 'K1WebApp');

    // Target zoom control container (bottom-right corner, 3 stacked buttons)
    // Click the top button (Zoom In) 3 times
    cy.get('body')
      .find('div')
      .filter(':visible')
      .then(($divs) => {
        // Find the zoom control area by filtering for known height/position
        const zoomControls = $divs.filter((i, el) => {
          return (
            el.innerText.trim() === '+' &&
            el.clientHeight < 60 &&
            window.getComputedStyle(el).position === 'absolute'
          );
        });

        // Click Zoom In 3 times
        cy.wrap(zoomControls.first()).click().click().click();
      });

    cy.wait(1000); // wait for subsystems to render

    // Check if subsystems are visible
    cy.contains('Camera-6').should('exist');
    cy.contains('Parking Sensors-8').should('exist');
    cy.contains('Driving Computer-11').should('exist');
  });
});
