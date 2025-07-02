describe('K1_TC24 - Zoom and Select an ECU to Fill', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4288');
  });

  it('should zoom in only until ECU is visible and then fill selected ECU', () => {
    cy.window()
      .its('k1Stage', { timeout: 10000 })
      .should('exist')
      .then((stage) => {
        const maxZooms = 10;
        const isEcuVisibleInViewport = (textNode) => {
          const pos = textNode.getAbsolutePosition();
          const scale = stage.scaleX();
          const canvasWidth = stage.width();
          const canvasHeight = stage.height();

          const inView =
            pos.x > 0 &&
            pos.y > 0 &&
            pos.x < canvasWidth &&
            pos.y < canvasHeight;

          const readable = scale > 0.3; // Customize threshold

          return inView && readable;
        };

        const zoomUntilFirstVisibleEcu = (attempt = 0) => {
          const textNodes = stage.find('Text');
          const ecuTextNodes = textNodes.filter((node) =>
            node.text().startsWith('ECU')
          );

          const visibleEcus = ecuTextNodes.filter(isEcuVisibleInViewport);

          if (visibleEcus.length > 0 || attempt >= maxZooms) {
            expect(visibleEcus.length).to.be.greaterThan(0);

            const firstVisibleEcu = visibleEcus[0];
            const group = firstVisibleEcu.getParent();
            const rect = group.findOne('Rect');
            if (rect) {
              rect.fill('lightblue'); // highlight selected ECU
              group.draw();
            }
          } else {
            cy.get('#zoomInButton').click().wait(300).then(() => {
              zoomUntilFirstVisibleEcu(attempt + 1);
            });
          }
        };

        zoomUntilFirstVisibleEcu();
      });
  });
});
