describe('Style Verification - port-169', () => {
  const portId = 'port-169';
  const fillColor = 'orange';
  const titleColor = 'green';

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  it(`should verify fill and titleColor of ${portId}`, () => {
    // Step 1: Enable styling API
    cy.contains('Tools').click();
    cy.contains('Enable styling api', { matchCase: false }).click();

    // Step 2: Reopen Tools and select port-169
    cy.contains('Tools').click();
    cy.get('.popup-details-container')
      .find('.popup-details-button-container')
      .contains(portId, { matchCase: false })
      .scrollIntoView()
      .click();

    // Step 3: Verify shape fill and title color
    cy.window().then((win) => {
      const stage = win.k1TestUtils?.getKonvaStage?.();
      if (!stage) throw new Error('❌ Stage not found');

      const portShape = stage.findOne((n) => n.name() === portId);
      const titleText = stage.findOne((n) => n.name() === `${portId}-title`);

      expect(portShape?.fill()).to.equal(fillColor);
      expect(titleText?.fill()).to.equal(titleColor);
    });
  });
});
