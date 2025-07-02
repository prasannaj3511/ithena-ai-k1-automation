describe('K1 – Select HMI‑1 on Konva Canvas', () => {
  it('should find and click HMI‑1', () => {
    cy.visit('http://localhost:4288');

    // Wait until <lib-k1-component> is present in the DOM
    cy.window().should(() => {
      const el = document.querySelector('lib-k1-component');
      expect(el).to.exist;
    });

    // Then proceed with test logic
    cy.window().then((win) => {
      const el = document.querySelector('lib-k1-component');
      const component = win.ng.getComponent(el);
      expect(component).to.have.property('canvas');

      const stage = component.canvas.stage.stage;
      expect(stage).to.have.property('find');

      const texts = stage.find((n) => n.getClassName() === 'Text');
      const hmi = texts.find((t) => t.text && t.text() === 'HMI-1');
      expect(hmi, 'HMI-1 node exists').to.exist;

      const pos = hmi.getAbsolutePosition();
      const canvasEl = stage.container();

      canvasEl.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: pos.x,
          clientY: pos.y,
          view: win,
        })
      );
    });
  });
});
