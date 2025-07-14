describe('K1_TC - Verify styling for ecu52-to-connector-92 via Styling API', () => {
  const maxScrolls = 15;
  const targetLabel = 'ecu52-to-connector-92';
  const enableStylingText = 'Enable styling api';

  const expectedStyle = {
    fill: 'green',
    titleColor: '#acd7e1',
    strokeWidth: 2,
    lineType: 'solid'
  };

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  function selectFromTools(labelText) {
    cy.get('.layer-button-container .layer-btn').click();
    cy.get('.popup-details-container').should('exist').then(($container) => {
      const tryScroll = (attempt = 0) => {
        if (attempt >= maxScrolls) throw new Error(`❌ "${labelText}" not found in Tools`);
        const $match = Cypress.$(`.layer-category-btn:contains(${labelText})`);
        if ($match.length && Cypress.dom.isVisible($match[0])) {
          cy.wrap($match).scrollIntoView().click({ force: true });
        } else {
          cy.wrap($container).scrollTo('bottom', { duration: 300 });
          cy.wait(300).then(() => tryScroll(attempt + 1));
        }
      };
      tryScroll();
    });
    cy.wait(500);
  }

  it('should apply style from style.json to ecu52-to-connector-92', () => {
    selectFromTools('Styling api');
    selectFromTools(enableStylingText);
    selectFromTools(targetLabel);

    cy.window().then((win) => {
      const stage = win.k1Stage;
      if (!stage) throw new Error('❌ Stage not available');

      const shapeNode = stage.findOne(n =>
        n.name?.()?.toLowerCase() === targetLabel.toLowerCase()
      );
      if (!shapeNode) throw new Error(`❌ Shape ${targetLabel} not found`);

      const fill = shapeNode.fill?.() || shapeNode.attrs.fill;
      expect(fill).to.eq(expectedStyle.fill);

      const strokeWidth = shapeNode.strokeWidth?.() || shapeNode.attrs.strokeWidth;
      expect(strokeWidth).to.eq(expectedStyle.strokeWidth);

      const dash = shapeNode.dash?.() || shapeNode.attrs.dash || [];
      const isSolid = !dash || dash.length === 0;
      if (expectedStyle.lineType === 'solid') {
        expect(isSolid).to.be.true;
      }

      const textNode = stage.findOne(n =>
        n.getClassName?.() === 'Text' &&
        n.isVisible() &&
        n.getText?.()?.toLowerCase().includes(targetLabel.toLowerCase())
      );
      if (!textNode) throw new Error(`❌ Label for ${targetLabel} not found`);

      const labelColor = textNode.fill?.() || textNode.attrs.fill;
      expect(labelColor.toLowerCase()).to.eq(expectedStyle.titleColor.toLowerCase());
    });
  });
});
