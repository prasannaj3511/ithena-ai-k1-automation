describe('K1 Test - Select HMI-1', () => {
  it('should select HMI-1 node on canvas', () => {
    cy.visit('http://localhost:4288');

    // Retry until the Angular component is available
    cy.window().then((win) => {
      return new Cypress.Promise((resolve, reject) => {
        const check = () => {
          const el = document.querySelector('lib-k1-component');
          if (el) {
            resolve({ win, el });
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }).then(({ win, el }) => {
      const component = win.ng.getComponent(el);
      const stage = component.canvas.stage.stage;

      const allTexts = stage.find(node => node.getClassName() === 'Text');
      const hmiNode = allTexts.find(node => node.text && node.text() === 'HMI-1');
      expect(hmiNode).to.not.be.undefined;

      const pos = hmiNode.getAbsolutePosition();
      const stageContainer = stage.container();

      const clickEvent = new MouseEvent('mousedown', {
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
