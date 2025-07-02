describe('K1_TC3 - Automatically zoom in until ECU titles are visible on screen', () => {
  it('should zoom in and pan until at least one visible ECU title is shown on screen', () => {
    cy.visit('http://localhost:4288');

    cy.window().should('have.property', 'k1Stage').then((stage) => {
      expect(stage).to.exist;

      const maxZoom = 3;
      const zoomStep = 0.2;
      let currentZoom = 1;

      const stageWidth = stage.width();
      const stageHeight = stage.height();

      const isEcuTitleVisible = () => {
        const texts = stage.find('Text');
        return texts.filter(t => {
          const title = t.text().toLowerCase();
          const pos = t.getAbsolutePosition();

          return title.startsWith('ecu') &&
            pos.x >= 0 && pos.x <= stageWidth &&
            pos.y >= 0 && pos.y <= stageHeight;
        });
      };

      const autoZoomUntilVisible = () => {
        return new Cypress.Promise((resolve, reject) => {
          const zoomLoop = () => {
            const visible = isEcuTitleVisible();
            if (visible.length > 0) {
              return resolve(visible.map(t => t.text()));
            }

            if (currentZoom >= maxZoom) {
              return reject('Zoom limit reached but no ECU title visible');
            }

            currentZoom += zoomStep;
            stage.scale({ x: currentZoom, y: currentZoom });

            // ⚠️ Shift slightly to center
            const pos = stage.position();
            stage.position({
              x: pos.x - 50,
              y: pos.y - 50,
            });

            stage.batchDraw(); // Force render update

            setTimeout(zoomLoop, 400); // Wait before next zoom
          };

          zoomLoop();
        });
      };

      return autoZoomUntilVisible().then((titles) => {
        expect(titles.length).to.be.greaterThan(0, 'At least one ECU title should be visible on screen');
        // You may log if needed: console.log('Found:', titles);
      });
    });
  });
});
