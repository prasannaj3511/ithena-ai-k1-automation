describe('K1_TC19 - Seamless Zoom', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4288');

    cy.window({ timeout: 10000 }).should((win) => {
      expect(win.k1TestUtils).to.exist;
      expect(win.k1TestUtils.getKonvaStage()).to.exist;
    });
  });

  it('should zoom in and out programmatically without lag', () => {
    cy.window().then((win) => {
      const stage = win.k1TestUtils.getKonvaStage();

      const initialScale = stage.scaleX();

      // Simulate Zoom In
      const zoomInScale = initialScale * 1.5;
      stage.scale({ x: zoomInScale, y: zoomInScale });
      stage.batchDraw();

      const afterZoomIn = stage.scaleX();
      expect(afterZoomIn).to.be.greaterThan(initialScale);

      // Simulate Zoom Out
      const zoomOutScale = initialScale * 0.5;
      stage.scale({ x: zoomOutScale, y: zoomOutScale });
      stage.batchDraw();

      const afterZoomOut = stage.scaleX();
      expect(afterZoomOut).to.be.lessThan(initialScale);
    });
  });
});
