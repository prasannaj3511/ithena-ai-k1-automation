describe('K1_TC_Bus1SelectionDeselection - Verify Bus1 is deselected after clicking nearby parts with color verification', () => {
  const targetId = 'bus1';

  // Color definitions for selection and deselection states 
  const SELECTION_COLORS = {
    busPrimary: '#B0FF44',     // Main bus line 
    busSecondary: '#E1FF96',   // Secondary bus elements
    connector: '#B3D85780',
    sensor: '#B3D85780',
    ecu: '#B3D85780',
    port: '#E1FF96',
    line: '#E1FF96'
  };

  const DESELECTION_COLORS = {
    busPrimary: '#93D4F0', 
    busSecondary: '#93D4F0',   // Secondary bus elements deselected
    connector: '#414154', 
    sensor: '#414154', 
    ecu: '#ffffff', 
    port: '#93D4F0', 
    line: '#93D4F0' 
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
          (typeof child.fill === 'function' || typeof child.stroke === 'function') &&
          !['Rect', 'Image'].includes(child.getClassName?.())
        )
      : [node];

    if (!shapes.length) {
      console.warn(` No fillable shapes found in "${node.id?.() || node.name?.()}"`);
      return;
    }

    shapes.forEach(shape => {
      const fill = shape.fill?.();
      const stroke = shape.stroke?.();
      const id = shape.id?.() || shape.name?.() || '[unknown shape]';
      
      // Check fill color if it exists
      if (fill) {
        expect(colorsMatch(fill, expectedColor), `Fill mismatch on "${id}" - expected ${expectedColor}, got ${fill}`).to.be.true;
      }
      
      // Check stroke color if it exists
      if (stroke) {
        expect(colorsMatch(stroke, expectedColor), `Stroke mismatch on "${id}" - expected ${expectedColor}, got ${stroke}`).to.be.true;
      }
    });
  }

  function applyHighlight(node, partType, isSelected) {
    const color = isSelected ? SELECTION_COLORS[partType] : DESELECTION_COLORS[partType];
    const isGroup = node.getClassName?.() === 'Group';

    const shapes = isGroup
      ? node.find(child =>
          child.isVisible?.() &&
          (typeof child.fill === 'function' || typeof child.stroke === 'function') &&
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
    cy.wait(1000);

    cy.window({ timeout: 10000 }).should(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      expect(stage).to.exist;
    });

    cy.contains('.layer-button-container .layer-btn', 'Tools').click();
    cy.get('.popup-details-container').should('exist').then($container => {
      const scrollUntilFound = (attempt = 0) => {
        if (attempt >= 20) throw new Error('Enable Bus Mode not found');
        const $match = Cypress.$('.layer-category-btn:contains(Enable Bus Mode)');
        if ($match.length && Cypress.dom.isVisible($match[0])) {
          cy.wrap($match).scrollIntoView().click({ force: true });
        } else {
          cy.wrap($container).scrollTo('bottom', { duration: 300 });
          cy.wait(300).then(() => scrollUntilFound(attempt + 1));
        }
      };
      scrollUntilFound();
    });

    cy.wait(1500);
  });

  function selectBus1() {
    cy.log(`Selecting ${targetId}`);
    
    for (let i = 0; i < 6; i++) {
      cy.get('#zoomInButton').click().wait(300);
    }

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      expect(busNode, 'Bus1 not found').to.exist;

      const box = busNode.getClientRect({ relativeTo: stage });
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
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      expect(busNode).to.exist;

      const box = busNode.getClientRect();
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / stage.width();
      const scaleY = rect.height / stage.height();

      const clickX = rect.left + center.x * scaleX;
      const clickY = rect.top + center.y * scaleY;

      cy.get('canvas').eq(1).click(clickX, clickY, { force: true });
    });

    cy.wait(500);
    
    // Apply highlight and verify Bus1 is selected with correct color
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      expect(busNode).to.exist;
      
      applyHighlight(busNode, 'busPrimary', true);
      assertNodeColor(busNode, SELECTION_COLORS.busPrimary);
    });
  }

  function clickNearestPart(typeMatchFn, partType) {
    let clickedName = '';
    
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const targetNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      expect(targetNode).to.exist;

      const targetBox = targetNode.getClientRect();
      const targetCenter = {
        x: targetBox.x + targetBox.width / 2,
        y: targetBox.y + targetBox.height / 2
      };

      const candidates = stage.find(typeMatchFn);
      let closest = null;
      let minDist = Infinity;

      candidates.forEach(n => {
        if (!n.isVisible() || n === targetNode) return;
        
        const box = n.getClientRect();
        const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const dist = Math.hypot(center.x - targetCenter.x, center.y - targetCenter.y);
        if (dist < minDist) {
          closest = { node: n, name: n.name?.() || n.id?.() };
          minDist = dist;
        }
      });

      expect(closest, 'No nearby part found for the given criteria').to.exist;

      clickedName = closest.name;
      let clickTarget = closest.node;
      
      if (closest.node.getClassName() === 'Group') {
        const hittableChild = closest.node.findOne(child => child.listening() && child.isVisible());
        if (hittableChild) {
          clickTarget = hittableChild;
          cy.log(`Closest element is a Group (${closest.name}). Targeting its clickable child: ${hittableChild.name() || hittableChild.getClassName()}`);
        } else {
           cy.log(`Closest element is a Group (${closest.name}), but no listening child was found. Clicking group center.`);
        }
      } else {
        cy.log(`Closest element is a ${closest.node.getClassName()} (${closest.name}). Targeting it directly.`);
      }

      const box = clickTarget.getClientRect();
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / stage.width();
      const scaleY = rect.height / stage.height();

      const clickX = rect.left + center.x * scaleX;
      const clickY = rect.top + center.y * scaleY;

      cy.get('canvas').eq(1).click(clickX, clickY, { force: true });
    });

    cy.wait(500);

    // Apply highlights and verify colors
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const clickedNode = stage.findOne(n =>
        n.name?.()?.toLowerCase() === clickedName.toLowerCase() || n.id?.() === clickedName
      );
      const targetNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      
      expect(clickedNode).to.exist;
      expect(targetNode).to.exist;

      // Apply highlights
      applyHighlight(clickedNode, partType, true);
      applyHighlight(targetNode, 'busPrimary', false);
      
      // Verify colors
      assertNodeColor(clickedNode, SELECTION_COLORS[partType]);
      assertNodeColor(targetNode, DESELECTION_COLORS.busPrimary);
    });
  }

  it('should deselect Bus1 after clicking a nearby connector (with pan) and verify colors', () => {
    selectBus1();

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === 'bus1'
      );
      expect(busNode, 'Bus1 not found').to.exist;

      const busBox = busNode.getClientRect();
      const busCenter = {
        x: busBox.x + busBox.width / 2,
        y: busBox.y + busBox.height / 2
      };

      const connectors = stage.find(n =>
        n.getClassName?.() === 'Group' &&
        n.name?.()?.toLowerCase().includes('connector') &&
        n.isVisible?.()
      );

      expect(connectors.length, 'No visible connectors found').to.be.greaterThan(0);

      let closestConnector = null;
      let minDist = Infinity;

      connectors.forEach(n => {
        const box = n.getClientRect();
        const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const dist = Math.hypot(center.x - busCenter.x, center.y - busCenter.y);
        if (dist < minDist && n !== busNode) {
          closestConnector = { node: n, name: n.name?.() || n.id?.() };
          minDist = dist;
        }
      });

      expect(closestConnector, 'No connector found to click').to.exist;

      const connectorBox = closestConnector.node.getClientRect({ relativeTo: stage });
      const connectorCenter = {
        x: connectorBox.x + connectorBox.width / 2,
        y: connectorBox.y + connectorBox.height / 2
      };
      const scale = stage.scaleX();
      stage.position({
        x: stage.width() / 2 - connectorCenter.x * scale,
        y: stage.height() / 2 - connectorCenter.y * scale
      });
      stage.batchDraw();

      win.__closestConnector = closestConnector;
    });

    cy.wait(500);

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const connector = win.__closestConnector;

      const clickTarget = connector.node.findOne(n =>
        n.isVisible?.() && n.listening?.()
      ) || connector.node;

      const box = clickTarget.getClientRect();
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

    // Apply highlights and verify colors
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const connector = win.__closestConnector;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === 'bus1'
      );
      
      expect(connector.node).to.exist;
      expect(busNode).to.exist;

      // Apply highlights
      applyHighlight(connector.node, 'connector', true);
      applyHighlight(busNode, 'busPrimary', false);
      
      // Verify colors
      assertNodeColor(connector.node, SELECTION_COLORS.connector);
      assertNodeColor(busNode, DESELECTION_COLORS.busPrimary);
    });

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === 'bus1'
      );
      expect(busNode).to.exist;

      const box = busNode.getClientRect({ relativeTo: stage });
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      const scale = stage.scaleX();
      stage.position({
        x: stage.width() / 2 - center.x * scale,
        y: stage.height() / 2 - center.y * scale
      });
      stage.batchDraw();
    });

    cy.wait(500);
  });
  
  it('should deselect Bus1 after clicking nearby ECU and verify colors', () => {
    selectBus1();
    clickNearestPart(n =>
      n.getClassName?.() === 'Group' &&
      n.name?.()?.toLowerCase().includes('ecu') &&
      n.isVisible?.(), 'ecu'
    );
  });

  it('should deselect Bus1 after clicking nearby sensor and verify colors', () => {
    selectBus1();
    clickNearestPart(n =>
      n.getClassName?.() === 'Group' &&
      n.name?.()?.toLowerCase().includes('sensor') &&
      n.isVisible?.(), 'sensor'
    );
  });

  it('should deselect Bus1 after clicking nearby port and verify colors', () => {
    selectBus1();
    clickNearestPart(n =>
      n.getClassName?.() === 'Circle' &&
      n.id?.()?.toLowerCase().startsWith('port') &&
      n.isVisible?.(), 'port'
    );
  });

  it('should deselect Bus1 after clicking nearby line and verify colors', () => {
    selectBus1();
    clickNearestPart(n =>
      ['Line', 'Arrow'].includes(n.getClassName?.()) &&
      n.name?.()?.toLowerCase() !== targetId.toLowerCase() &&
      n.isVisible?.(), 'line'
    );
  });

  it('should deselect Bus1 after clicking blank stage and verify colors', () => {
    selectBus1();

    cy.window().then(win => {
      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const clickX = rect.left + rect.width * 0.95;
      const clickY = rect.top + rect.height * 0.95;
      cy.get('canvas').eq(1).click(clickX, clickY, { force: true });
    });

    cy.wait(500);
    
    // Apply highlight and verify Bus1 is deselected
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      expect(busNode).to.exist;
      
      applyHighlight(busNode, 'busPrimary', false);
      assertNodeColor(busNode, DESELECTION_COLORS.busPrimary);
    });
  });
});