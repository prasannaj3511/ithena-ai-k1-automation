describe('K1_TC_Camera6Selection - Zoom 4x, pan to Camera-6, and click', () => {
  const targetId = 'camera-6'; // lowercased to match internal naming convention

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);

    // ✅ Ensure Konva stage is available
    cy.window({ timeout: 10000 }).should(win => {
      expect(win.k1Stage, 'k1Stage is not defined on window').to.exist;
    });
  });

  it('should zoom 4 times, pan to Camera-6, and click it', () => {
    // 🔍 Step 1: Zoom in 4 times
    for (let i = 0; i < 4; i++) {
      cy.get('#zoomInButton').click().wait(300);
    }

    // 🎯 Step 2: Pan to Camera-6
    cy.window().then(win => {
      const stage = win.k1Stage;
      const cameraNode = stage.findOne(n =>
        typeof n.name === 'function' &&
        n.name()?.toLowerCase() === targetId
      );
      expect(cameraNode, 'Camera-6 node not found').to.exist;

      const box = cameraNode.getClientRect({ relativeTo: stage });
      const scale = stage.scaleX();
      const center = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
      };

      stage.position({
        x: stage.width() / 2 - center.x * scale,
        y: stage.height() / 2 - center.y * scale
      });
      stage.batchDraw();
    });

    cy.wait(500);

    // 🖱️ Step 3: Simulate click on Camera-6
    cy.window().then(win => {
      const stage = win.k1Stage;
      const cameraNode = stage.findOne(n =>
        typeof n.name === 'function' &&
        n.name()?.toLowerCase() === targetId
      );
      expect(cameraNode, 'Camera-6 node not found during click').to.exist;

      const box = cameraNode.getClientRect();
      const center = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
      };

      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / stage.width();
      const scaleY = rect.height / stage.height();

      const clickX = rect.left + center.x * scaleX;
      const clickY = rect.top + center.y * scaleY;

      cy.get('canvas').eq(1).click(clickX, clickY, { force: true });
    });

    cy.wait(500);
  });
});
