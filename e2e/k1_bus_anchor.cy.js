describe('K1 Test - Select HMI-1', () => {
  it('should select HMI-1 node on canvas', () => {
    cy.visit('http://localhost:4288');

    cy.window().then((win) => {
      const component = win.ng.getComponent(document.querySelector('lib-k1-component'));
      const stage = component.canvas.stage.stage;

      // Get all Konva Text nodes
      const allTexts = stage.find('Text');

      // Find the node with "HMI-1"
      const hmiNode = allTexts.find(t => t.text() === 'HMI-1');

      expect(hmiNode).to.not.be.undefined;

      // Simulate a click on the center of the HMI-1 node
      const pos = hmiNode.getAbsolutePosition();
      const stageContainer = stage.container();

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: pos.x,
        clientY: pos.y,
        view: win
      });

      stageContainer.dispatchEvent(clickEvent);
    });
  });
});
