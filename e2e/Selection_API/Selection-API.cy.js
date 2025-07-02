describe('K1 System Object Highlight Tests', () => {
  const testCases = [
    {
      id: 'perception-19',
      expectedHighlightColor: '#75477a',
      title: 'K1_TC134 - Select and Highlight perception-19 from Tools',
    },
    {
      id: 'port-169',
      expectedHighlightColor: '#b3d857',
      title: 'K1_TC135 - Verify selection functionality for port-169',
    },
    {
      id: 'ecu52-to-connector92',
      expectedHighlightColor: '#93d4f0',
      title: 'K1_TC136 - Verify selection functionality for connection object',
    },
    {
      id: 'ecu48',
      expectedHighlightColor: '#75477a',
      title: 'K1_TC137 - Verify selection functionality for ECU object',
    },
  ];

  const selectItemFromTools = (id) => {
    cy.get('.layer-button-container .layer-btn', { timeout: 10000 }).click();
    cy.get('.popup-details-container', { timeout: 8000 }).should('exist').then(($container) => {
      const maxScrolls = 15;
      const scrollAndFind = (attempt = 0) => {
        const $match = Cypress.$(`.layer-category-btn:contains(${id})`);
        if ($match.length && Cypress.dom.isVisible($match[0])) {
          cy.wrap($match).scrollIntoView().click({ force: true });
        } else if (attempt < maxScrolls) {
          cy.wrap($container).scrollTo('bottom', { duration: 300 });
          cy.wait(300).then(() => scrollAndFind(attempt + 1));
        } else {
          throw new Error(`"${id}" not found in Tools after ${maxScrolls} scrolls`);
        }
      };
      scrollAndFind();
    });
  };

  const verifyHighlight = (id, expectedColor) => {
    cy.window().then((win) => {
      const stage = win.k1Stage;
      expect(stage, 'Konva stage must be available').to.exist;

      const nodes = stage.find((n) => {
        try {
          const name = typeof n.name === 'function' ? n.name() : n.name;
          return name?.toLowerCase() === id.toLowerCase();
        } catch {
          return false;
        }
      });

      const match = nodes[0];
      expect(match, `"${id}" node must exist on canvas`).to.exist;

      const fill = match?.attrs?.fill;
      expect(fill, `"${id}" should be highlighted`).to.exist;
      expect(fill.toLowerCase()).to.equal(expectedColor);
    });
  };

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  testCases.forEach(({ id, expectedHighlightColor, title }) => {
    it(title, () => {
      selectItemFromTools(id);
      cy.wait(1000);
      verifyHighlight(id, expectedHighlightColor);
    });
  });
});
