describe('K1_TC28 - Automatic Panning Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(100); // Wait for canvas layers to stabilize
  });

  it('should pan the canvas automatically at default and zoomed-in levels', () => {
    cy.window({ timeout: 10000 }).then((win) => {
      // Wait for window.k1Stage
      return new Cypress.Promise((resolve) => {
        const waitForStage = () => {
          if (win.k1Stage) resolve(win.k1Stage);
          else setTimeout(waitForStage, 200);
        };
        waitForStage();
      });
    }).then((stage) => {
      const getStagePos = () => ({ ...stage.position() });

      const simulateAutoPan = (fromX, fromY, toX, toY) => {
        cy.get('canvas').last() // 🔄 Use last canvas = top layer
          .trigger('mousedown', {
            button: 0,
            clientX: fromX,
            clientY: fromY,
            force: true, // ✅ force to bypass coverage
          })
          .trigger('mousemove', {
            clientX: toX,
            clientY: toY,
            force: true,
          })
          .trigger('mouseup', { force: true });
      };

      const initialPos = getStagePos();
      simulateAutoPan(300, 300, 200, 200);

      cy.wait(500).then(() => {
        const afterPan = getStagePos();
        expect(afterPan.x).to.not.equal(initialPos.x);
        expect(afterPan.y).to.not.equal(initialPos.y);
      });

      cy.get('#zoomInButton').click().wait(300);
      cy.get('#zoomInButton').click().wait(300);

      const zoomedPos = getStagePos();
      simulateAutoPan(400, 300, 300, 200);

      cy.wait(500).then(() => {
        const afterZoomPan = getStagePos();
        expect(afterZoomPan.x).to.not.equal(zoomedPos.x);
        expect(afterZoomPan.y).to.not.equal(zoomedPos.y);
      });
    });
  });
});
