describe('K1_TC-1 - Verify styling for ecu52-to-connector92 via Styling API', () => {
  const selectedColor = '#b0ff44'; // Lime green when selected
  const deselectedStyle = {
    fill: '#ff0000', // Red after deselection
    titleColor: '#acd7e1',
    strokeWidth: 1,
    lineType: 'solid'
  };

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  it('should show lime green when selected and red after deselection for ecu52-to-connector92', () => {
    // ✅ Enable Styling API
    cy.get('.layer-button-container .layer-btn').click();
    cy.get('.popup-details-container').should('be.visible');
    cy.contains('.layer-category-btn', 'Enable styling api').click({ force: true });
    cy.wait(500);

    // ✅ Reopen Tools and select the connection
    cy.get('.layer-button-container .layer-btn').click();
    cy.get('.popup-details-container').should('be.visible');
    cy.contains('.layer-category-btn', 'ecu52-to-connector92').click({ force: true });
    cy.wait(500);

    // ✅ Confirm lime green when selected
    cy.window().then((win) => {
      const stage = win.k1Stage;
      const node = stage.findOne(n => n.name?.().toLowerCase() === 'ecu52-to-connector92');
      const line = node.getClassName?.() === 'Line' ? node : node.findOne(n => n.getClassName?.() === 'Line');
      expect(line.stroke()?.toLowerCase()).to.eq(selectedColor.toLowerCase());
    });

    // ✅ Click on blank stage to deselect
    cy.get('canvas').first().click('topLeft');
    cy.wait(500);

    // ✅ Validate red stroke (from style.json) after deselection
    cy.window().then((win) => {
      const stage = win.k1Stage;
      const node = stage.findOne(n => n.name?.().toLowerCase() === 'ecu52-to-connector92');
      const line = node.getClassName?.() === 'Line' ? node : node.findOne(n => n.getClassName?.() === 'Line');

      const stroke = line.stroke?.() || line.attrs.stroke || '';
      expect(stroke.toLowerCase()).to.eq(deselectedStyle.fill.toLowerCase());

      const rawStrokeWidth = line.strokeWidth?.() || line.attrs.strokeWidth || 0;
      const scaleX = line.getAbsoluteScale().x || 1;
      const adjusted = rawStrokeWidth / scaleX;
      cy.log(`Raw: ${rawStrokeWidth}, scaleX: ${scaleX}, adjusted: ${adjusted}`);
      expect(adjusted).to.be.closeTo(deselectedStyle.strokeWidth, 0.05);

      const dash = line.dash?.() || line.attrs.dash || [];
      const isSolid = !dash || dash.length === 0 || dash.every(d => d === 0);
      expect(isSolid).to.be.true;

      const title = stage.findOne(n =>
        n.getClassName?.() === 'Text' &&
        n.getText?.()?.toLowerCase().includes('ecu52-to-connector92')
      );
      expect(title.fill?.().toLowerCase()).to.eq(deselectedStyle.titleColor.toLowerCase());
    });
  });
});
