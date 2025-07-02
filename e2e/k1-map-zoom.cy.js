beforeEach(() => {
  cy.visit('http://localhost:64130');

  cy.window({ timeout: 10000 }).should((win) => {
    expect(win.k1TestUtils).to.exist;
  });

  // Retry until zoom node is available
  cy.window({ timeout: 10000 }).should((win) => {
    const node = win.k1TestUtils.getZoomNode?.();
    expect(node, 'Zoom node should be ready').to.exist;
  });
});
