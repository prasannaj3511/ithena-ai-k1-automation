describe('K1_TC103 – Layer Window Opens', () => {
  it('zooms, clicks Layer button, and verifies window opens', () => {
    cy.visit('/');

    // ✅ Wait for your component element
    cy.get('lib-k1-component', { timeout: 10000 }).should('exist');

    cy.window().then((win) => {
      // ✅ Raw DOM element, NOT Cypress-wrapped
      const el = document.querySelector('lib-k1-component');
      expect(el).to.be.instanceOf(win.HTMLElement);

      // ✅ Retrieve Angular component instance correctly
      const comp = win.ng.getComponent(el);
      expect(comp).to.have.property('canvas');

      const stage = comp.canvas.stage.stage; // the Konva Stage
      expect(stage).to.have.property('find');

      // 🧠 Zoom, find “Layer” button, click via native event
      stage.scale({ x: 1.5, y: 1.5 });
      stage.batchDraw();
      const layerShape = stage.findOne(n =>
        ['Text', 'Rect', 'Group'].includes(n.getClassName()) &&
        n.text?.() === 'Layer'
      );
      expect(layerShape).to.exist;

      const pos = layerShape.getAbsolutePosition(),
            canvasEl = stage.container();

      canvasEl.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true, cancelable: true,
        clientX: pos.x, clientY: pos.y,
        view: win
      }));
      canvasEl.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true, clientX: pos.x, clientY: pos.y,
        view: win
      }));
    });

    // ✅ Finally, assert the Layer window appears
    cy.get('.layer-window-selector', { timeout: 5000 }).should('be.visible');
  });
});
