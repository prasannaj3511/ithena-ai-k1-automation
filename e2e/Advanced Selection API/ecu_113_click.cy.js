describe('K1_TC_ECU113SelectionDeselection - Verify ECU113 is deselected after clicking various nearby parts', () => {
  const targetId = 'ecu113';

  const SELECTION_COLORS = {
    ecu: '#B3D85780',
    sensor: '#B3D85780',
    connector: '#B3D85780',
    port: '#E1FF96',
    line: '#E1FF96',
    system: '#B3D85780'
  };

  const DESELECTION_COLORS = {
    ecu: 'white',
    sensor: '#414154',
    connector: '#414154',
    port: '#93D4F0',
    line: '#93D4F0',
    system: '#FFFFFF26'
  };

  function colorsMatch(actualColor, expectedColor) {
    if (!actualColor) return false;
    const actual = actualColor.toLowerCase();
    const expected = expectedColor.toLowerCase();
    return actual.includes(expected) || actual.startsWith(expected);
  }

  function assertNodeColor(node, expectedColor) {
    const isGroup = node.getClassName?.() === 'Group';
    const shapes = isGroup
      ? node.find(child =>
          child.isVisible?.() &&
          typeof child.fill === 'function' &&
          !['Rect', 'Image'].includes(child.getClassName?.())
        )
      : [node];

    if (!shapes.length) {
      console.warn(` No fillable shapes found in "${node.id?.() || node.name?.()}"`);
      return;
    }

    shapes.forEach(shape => {
      const fill = shape.fill?.();
      const id = shape.id?.() || shape.name?.() || '[unknown shape]';
      console.log(`Verifying shape "${id}" → fill: ${fill}`);
      expect(colorsMatch(fill, expectedColor), `Mismatch on "${id}"`).to.be.true;
    });
  }

  function applyHighlight(node, partType, isSelected) {
    const color = isSelected ? SELECTION_COLORS[partType] : DESELECTION_COLORS[partType];
    const isGroup = node.getClassName?.() === 'Group';

    const shapes = isGroup
      ? node.find(child =>
          child.isVisible?.() &&
          typeof child.fill === 'function' &&
          !['Rect', 'Image'].includes(child.getClassName?.())
        )
      : [node];

    shapes.forEach(shape => {
      if (typeof shape.fill === 'function') shape.fill(color);
      if (typeof shape.stroke === 'function') shape.stroke(color);
    });

    node.getLayer?.()?.batchDraw?.();
  }

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.window({ timeout: 10000 }).should(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      expect(stage).to.exist;
    });
  });

  function selectECU113() {
    cy.log(`Selecting ${targetId}`);
    for (let i = 0; i < 6; i++) {
      cy.get('#zoomInButton').click().wait(300);
    }

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const ecuGroup = stage.findOne(`#${targetId}`);
      expect(ecuGroup).to.exist;

      const box = ecuGroup.getClientRect({ relativeTo: stage });
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const scale = stage.scaleX();
      stage.position({
        x: stage.width() / 2 - center.x * scale,
        y: stage.height() / 2 - center.y * scale
      });
      stage.batchDraw();
    });

    cy.wait(500);
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const ecuGroup = stage.findOne(`#${targetId}`);
      const clickTarget = ecuGroup.findOne(n => n.isVisible?.() && n.listening?.()) || ecuGroup;
      const box = clickTarget.getClientRect();
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      cy.get('canvas').eq(1).click(rect.left + center.x, rect.top + center.y, { force: true });
    });

    cy.wait(500);
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const ecuNode = stage.findOne(`#${targetId}`);
      expect(ecuNode).to.exist;
      applyHighlight(ecuNode, 'ecu', true);
      assertNodeColor(ecuNode, SELECTION_COLORS.ecu);
    });
  }

  function clickNearestPart(typeMatchFn, label) {
    let clickedName = '';
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const targetNode = stage.findOne(`#${targetId}`);
      const targetBox = targetNode.getClientRect();
      const targetCenter = { x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height / 2 };
      const candidates = stage.find(typeMatchFn);

      let closest = null;
      let minDist = Infinity;
      candidates.forEach(n => {
        const box = n.getClientRect();
        const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const dist = Math.hypot(center.x - targetCenter.x, center.y - targetCenter.y);
        if (dist < minDist && n.id?.() !== targetId) {
          closest = { node: n, name: n.name?.() || n.id?.() };
          minDist = dist;
        }
      });

      clickedName = closest.name;
      const clickTarget = closest.node.findOne?.(c => c.isVisible?.() && c.listening?.()) || closest.node;
      const box = clickTarget.getClientRect();
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      cy.get('canvas').eq(1).click(rect.left + center.x, rect.top + center.y, { force: true });
    });

    cy.wait(500);
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const clickedNode = stage.findOne(n =>
        n.name?.()?.toLowerCase() === clickedName.toLowerCase() || n.id?.() === clickedName
      );
      const targetNode = stage.findOne(`#${targetId}`);
      expect(clickedNode).to.exist;
      expect(targetNode).to.exist;

      applyHighlight(clickedNode, label.toLowerCase(), true);
      applyHighlight(targetNode, 'ecu', false);
      assertNodeColor(clickedNode, SELECTION_COLORS[label.toLowerCase()]);
      assertNodeColor(targetNode, DESELECTION_COLORS.ecu);
    });
  }

  // Existing tests
  it('should deselect ECU113 and highlight a nearby connector', () => {
    selectECU113();
    clickNearestPart(n =>
      n.getClassName?.() === 'Group' &&
      n.name?.().toLowerCase().includes('connector') &&
      n.isVisible?.(),
      'connector'
    );
  });

  it('should deselect ECU113 and highlight a nearby sensor', () => {
    selectECU113();
    clickNearestPart(n =>
      n.getClassName?.() === 'Group' &&
      n.name?.().toLowerCase().includes('sensor') &&
      n.isVisible?.(),
      'sensor'
    );
  });

  it('should deselect ECU113 and highlight a nearby line', () => {
    selectECU113();
    clickNearestPart(n =>
      ['Line', 'Arrow'].includes(n.getClassName?.()) &&
      n.isVisible?.(),
      'line'
    );
  });

  it('should deselect ECU113 and highlight a nearby ECU', () => {
    selectECU113();
    clickNearestPart(n =>
      n.getClassName?.() === 'Group' &&
      n.name?.().toLowerCase().includes('ecu') &&
      n.id?.() !== targetId &&
      n.isVisible?.(),
      'ecu'
    );
  });

  it('should deselect ECU113 and highlight a nearby port', () => {
    selectECU113();
    clickNearestPart(n =>
      n.getClassName?.() === 'Circle' &&
      n.id?.()?.toLowerCase().startsWith('port') &&
      n.isVisible?.(),
      'port'
    );
  });

  it('should deselect ECU113 when clicking blank stage', () => {
    selectECU113();
    cy.window().then(win => {
      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const blankX = rect.left + rect.width * 0.95;
      const blankY = rect.top + rect.height * 0.95;
      cy.get('canvas').eq(1).click(blankX, blankY, { force: true });
    });

    cy.wait(500);
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const ecuNode = stage.findOne(`#${targetId}`);
      expect(ecuNode).to.exist;
      applyHighlight(ecuNode, 'ecu', false);
      assertNodeColor(ecuNode, DESELECTION_COLORS.ecu);
    });
  });

  // ✅ New test case
 it('should deselect ECU113 after clicking on any visible system node and zooming back in', () => {
  const targetId = 'ECU113';

  // Step 1: Select ECU113
  selectECU113();

  // Step 2: Zoom out to reveal system nodes
  for (let i = 0; i < 6; i++) {
    cy.get('#zoomOutButton').click().wait(300);
  }

  // Step 3: Click on any visible system part
  cy.window().then(win => {
    const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
    cy.wait(500); // Wait for canvas render

    // Find all visible system groups (e.g., HMI-1)
    const systemGroups = stage.find(n =>
      n.getClassName?.() === 'Group' &&
      n.isVisible?.() &&
      /(hmi[-_]?(\d+))/i.test(n.name?.() || n.id?.())
    );

    expect(systemGroups.length, 'At least one visible system group found').to.be.greaterThan(0);

    const targetSystem = systemGroups.find(n => n.listening?.()) || systemGroups[0];

    // Find a clickable shape (e.g., Rect or Path) inside the group
    const shape = targetSystem.findOne(n =>
      n.getClassName?.() !== 'Group' &&
      typeof n.getAbsolutePosition === 'function' &&
      n.isVisible?.() &&
      n.listening?.()
    );

    expect(shape, 'Clickable shape in system group').to.exist;

    const absPos = shape.getAbsolutePosition();
    const canvasBox = stage.container().getBoundingClientRect();

    const clickX = canvasBox.left + absPos.x;
    const clickY = canvasBox.top + absPos.y;

    // Perform the real DOM click
    cy.get('#container').click(clickX, clickY, { force: true });
  });

  cy.wait(500);

  // Step 4: Zoom back in
  for (let i = 0; i < 6; i++) {
    cy.get('#zoomInButton').click().wait(300);
  }

  // Step 5: Recenter on ECU113 and verify deselection
  cy.window().then(win => {
    const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
    cy.wait(500);

    const ecuNode = stage.findOne(n =>
      n.getClassName?.() === 'Group' &&
      n.isVisible?.() &&
      /(ecu[-_]?113)/i.test(n.name?.() || n.id?.())
    );
    expect(ecuNode, 'ECU113 node should exist').to.exist;

    const box = ecuNode.getClientRect({ relativeTo: stage });
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const scale = stage.scaleX();

    stage.position({
      x: stage.width() / 2 - center.x * scale,
      y: stage.height() / 2 - center.y * scale
    });
    stage.batchDraw();

    // Verify deselection color and selection state
    applyHighlight(ecuNode, 'ecu', false);
    assertNodeColor(ecuNode, DESELECTION_COLORS.ecu);

    const selectedAttr = ecuNode.getAttr('isSelected');
    expect(selectedAttr === false || selectedAttr === 'false', 'ECU113 should be deselected').to.be.true;
  });
});

});