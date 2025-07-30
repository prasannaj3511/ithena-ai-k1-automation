it("K1_TC-3 – should apply yellow titleColor to ecu48 from style.json", () => {
  cy.visit("http://localhost:4288");
  cy.wait(1000); // Let initial assets load

  // Enable Styling API
  cy.contains("button.layer-btn", "Tools").click({ force: true });
  cy.get(".popup-details-container").should("be.visible");
  cy.contains(".layer-category-btn", "Enable styling api").click({ force: true });
  cy.wait(500); // Wait for style.json to load

  // Reopen Tools menu and click on ecu48
  cy.contains("button.layer-btn", "Tools").click({ force: true });
  cy.get(".popup-details-container").should("exist");
  cy.get(".popup-details-container")
    .scrollTo("bottom", { duration: 300 })
    .wait(300);
  cy.contains("button.layer-category-btn", "ecu48")
    .scrollIntoView()
    .click({ force: true });
  cy.wait(500); // Wait for selection

  // Safely wait until Konva stage is ready
  cy.window()
    .its("k1TestUtils.getKonvaStage")
    .should("be.a", "function");

  cy.window().then((win) => {
    const stage = win.k1TestUtils.getKonvaStage();
    if (!stage) throw new Error("❌ Stage not found");

    // Zoom in to ensure labels are visible
    stage.scale({ x: 2, y: 2 });
    stage.draw();

    const allTextNodes = stage.find("Text");
    const ecu48Text = allTextNodes.find((node) =>
      node.text?.().toLowerCase().includes("ecu48")
    );

    expect(ecu48Text, "❌ Text node for ecu48 should exist").to.exist;

    const appliedColor = ecu48Text.fill();
    const expectedColor = "yellow"; // From style.json
    expect(appliedColor, "✅ Expected titleColor for ecu48").to.equal(expectedColor);
  });
});
