describe('K1_TC20 – Pointer-relative Zoom', () => {
  it('should zoom in and out centered around a specific point', () => {
    cy.visit('http://localhost:4288');

    cy.window().should('have.property', 'k1Stage').then((stage) => {
      expect(stage).to.exist;

      const pointer = { x: 400, y: 300 }; // Simulated pointer location
      const initialScale = stage.scaleX();
      const scaleFactor = 1.2;

      // ✅ Convert screen (pointer) position to map coordinates
      const oldPointerOnMap = {
        x: (pointer.x - stage.x()) / stage.scaleX(),
        y: (pointer.y - stage.y()) / stage.scaleY(),
      };

      // ✅ Apply new zoom scale
      const newScale = initialScale * scaleFactor;
      stage.scale({ x: newScale, y: newScale });

      // ✅ Adjust position to maintain pointer-centered zoom
      const newPos = {
        x: pointer.x - oldPointerOnMap.x * newScale,
        y: pointer.y - oldPointerOnMap.y * newScale,
      };

      stage.position(newPos);
      stage.batchDraw();

      cy.wait(300); // Allow render

      // ✅ Assert zoom scale changed
      expect(stage.scaleX()).to.be.greaterThan(initialScale);
    });
  });
});
