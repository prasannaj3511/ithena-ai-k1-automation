describe('K1_TC136 - Verify selection functionality for ecu52-to-connector92', () => {
  const targetId = 'ecu52-to-connector92';
  const expectedHighlightColor = '#93d4f0';
  const maxScrolls = 15;

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  it(`should select and highlight "${targetId}"`, () => {
    cy.get('.layer-button-container .layer-btn', { timeout: 10000 })
      .should('be.visible')
      .click();

    cy.get('.popup-details-container', { timeout: 8000 }).should('exist').then(($container) => {
      const tryScroll = (attempt = 0) => {
        const $match = Cypress.$(`.layer-category-btn:contains(${targetId})`);
        if ($match.length && Cypress.dom.isVisible($match[0])) {
          cy.wrap($match).scrollIntoView().click({ force: true });
        } else if (attempt < maxScrolls) {
          cy.wrap($container).scrollTo('bottom', { duration: 300 });
          cy.wait(300).then(() => tryScroll(attempt + 1));
        } else {
          throw new Error(`"${targetId}" not found after ${maxScrolls} scrolls`);
        }
      };
      tryScroll();
    });

    cy.wait(800);

    cy.window().then((win) => {
      const stage = win.k1Stage;
      expect(stage).to.exist;

      const nodes = stage.find(n => {
        try {
          const name = typeof n.name === 'function' ? n.name() : n.name;
          return name?.toLowerCase() === targetId.toLowerCase();
        } catch {
          return false;
        }
      });

      const match = nodes[0];
      expect(match).to.exist;

      const fill = match.attrs.fill;
      expect(fill).to.exist;
      expect(fill.toLowerCase()).to.equal(expectedHighlightColor);
    });
  });
});
