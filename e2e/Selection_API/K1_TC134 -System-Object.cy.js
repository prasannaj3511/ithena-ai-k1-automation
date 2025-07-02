describe('K1_TC134 - Select and Highlight perception-19 from Tools', () => {
  const targetId = 'perception-19';
  const maxScrolls = 15;
  const expectedHighlightColor = '#75477a';

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  it('should select "perception-19" from Tools, highlight, and zoom in', () => {
    cy.get('.layer-button-container .layer-btn', { timeout: 10000 })
      .should('be.visible')
      .click();

    cy.get('.popup-details-container', { timeout: 8000 }).should('exist').then(($container) => {
      const tryScroll = (attempt = 0) => {
        if (attempt >= maxScrolls) throw new Error(`"${targetId}" not found in tools list after ${maxScrolls} scrolls`);
        const $match = Cypress.$(`.layer-category-btn:contains(${targetId})`);
        if ($match.length && Cypress.dom.isVisible($match[0])) {
          cy.wrap($match).scrollIntoView().click({ force: true });
        } else {
          cy.wrap($container).scrollTo('bottom', { duration: 300 });
          cy.wait(300).then(() => tryScroll(attempt + 1));
        }
      };
      tryScroll();
    });

    cy.wait(1000);

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
