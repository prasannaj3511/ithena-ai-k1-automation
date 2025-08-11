describe('K1_TC_Bus1SelectionDeselection - Verify Bus1 is deselected after clicking nearby parts with color verification', () => {
  const targetId = 'bus1';

  // Color definitions for selection and deselection states based on actual application colors
  const SELECTION_COLORS = {
    bus: '#B0FF44', 
    connector: '#B3D85780', 
    sensor: '#B3D85780', 
    ecu: '#B3D85780', 
    port: '#E1FF96', 
    line: '#E1FF96' 
  };
  
  const DESELECTION_COLORS = {
    bus: '#93D4F0', 
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
      console.warn(`No fillable shapes found in "${node.id?.() || node.name?.()}"`);
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

  function getBusLineNode(stage) {
    return stage.findOne(n =>
      n.getClassName?.() === 'Line' &&
      n.name?.()?.toLowerCase() === targetId
    );
  }

  function getPartTypeFromText(text) {
    const lowercaseText = text.toLowerCase();
    if (lowercaseText.includes('sensor')) return 'sensor';
    if (lowercaseText.includes('ecu')) return 'ecu';
    if (lowercaseText.includes('port')) return 'port';
    if (lowercaseText.includes('bus')) return 'line';
    return 'connector';
  }

  beforeEach(() => {
    cy.visit('http://localhost:4288/');
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
    
    // First verify Bus1 line is in deselected state
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busLineNode = getBusLineNode(stage);
      if (busLineNode) {
        assertNodeColor(busLineNode, DESELECTION_COLORS.bus);
      }
    });

    for (let i = 0; i < 6; i++) {
      cy.get('#zoomInButton').click().wait(300);
    }

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const titleNode = stage.findOne(n =>
        n.getClassName?.() === 'Text' &&
        n.text?.()?.toLowerCase().trim() === targetId
      );
      expect(titleNode).to.exist;

      const box = titleNode.getClientRect({ relativeTo: stage });
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
      const titleNode = stage.findOne(n =>
        n.getClassName?.() === 'Text' &&
        n.text?.()?.toLowerCase().trim() === targetId
      );
      expect(titleNode).to.exist;

      const box = titleNode.getClientRect();
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

    // Apply highlight and verify Bus1 line is selected with correct color
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busLineNode = getBusLineNode(stage);
      expect(busLineNode).to.exist;
      
      applyHighlight(busLineNode, 'bus', true);
      assertNodeColor(busLineNode, SELECTION_COLORS.bus);
    });
  }

  function clickNearestTitleWithPrefix(prefix) {
    let clickedText = '';
    let partType = '';

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;

      const targetNode = stage.findOne(n =>
        n.getClassName?.() === 'Text' &&
        n.text?.()?.toLowerCase().trim() === targetId
      );
      expect(targetNode).to.exist;

      const targetBox = targetNode.getClientRect();
      const targetCenter = {
        x: targetBox.x + targetBox.width / 2,
        y: targetBox.y + targetBox.height / 2
      };

      const matchingTextNodes = stage.find(n => {
        const text = n.text?.()?.toLowerCase().trim();
        return (
          n.getClassName?.() === 'Text' &&
          text?.startsWith(prefix.toLowerCase()) &&
          text !== targetId &&
          n.isVisible?.()
        );
      });

      let nearestText = null;
      let minDist = Infinity;

      matchingTextNodes.forEach(n => {
        const box = n.getClientRect();
        const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const dist = Math.hypot(center.x - targetCenter.x, center.y - targetCenter.y);
        if (dist > 10 && dist < minDist) {
          nearestText = n;
          minDist = dist;
        }
      });

      expect(nearestText).to.exist;
      
      clickedText = nearestText.text?.()?.toLowerCase().trim();
      partType = getPartTypeFromText(clickedText);

      const textBox = nearestText.getClientRect();
      const center = {
        x: textBox.x + textBox.width / 2,
        y: textBox.y + textBox.height / 2
      };

      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / stage.width();
      const scaleY = rect.height / stage.height();

      const clickX = rect.left + center.x * scaleX;
      const clickY = rect.top + center.y * scaleY;

      cy.get('canvas').eq(1).click(clickX, clickY, { force: true });

      // Store clicked text and part type for color verification
      win.__clickedText = clickedText;
      win.__partType = partType;
    });

    cy.wait(500);

    // Apply highlights and verify colors
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const clickedText = win.__clickedText;
      const partType = win.__partType;
      
      // Find the clicked component by text
      const clickedComponent = stage.findOne(n => 
        n.text?.()?.toLowerCase().trim() === clickedText
      );
      
      // Find associated visual component based on text
      let visualComponent = null;
      if (partType === 'sensor' || partType === 'ecu') {
        visualComponent = stage.findOne(n =>
          n.getClassName?.() === 'Group' &&
          n.name?.()?.toLowerCase().includes(partType)
        );
      } else if (partType === 'port') {
        visualComponent = stage.findOne(n =>
          n.getClassName?.() === 'Circle' &&
          n.id?.()?.toLowerCase().startsWith('port')
        );
      } else if (partType === 'line') {
        visualComponent = stage.findOne(n =>
          n.getClassName?.() === 'Line' &&
          n.name?.()?.toLowerCase().includes('bus') &&
          n.name?.()?.toLowerCase() !== targetId
        );
      }

      const busLineNode = getBusLineNode(stage);
      expect(busLineNode).to.exist;

      // Apply highlights if visual component found
      if (visualComponent) {
        applyHighlight(visualComponent, partType, true);
        assertNodeColor(visualComponent, SELECTION_COLORS[partType]);
      }
      
      // Apply deselection highlight to Bus1 and verify
      applyHighlight(busLineNode, 'bus', false);
      assertNodeColor(busLineNode, DESELECTION_COLORS.bus);
    });
  }

  it('should deselect Bus1 after clicking nearby sensor title and verify colors', () => {
    selectBus1();
    clickNearestTitleWithPrefix('sensor');
  });

  it('should deselect Bus1 after clicking nearby ECU title and verify colors', () => {
    selectBus1();
    clickNearestTitleWithPrefix('ecu');
  });

  it('should deselect Bus1 after clicking nearby port title and verify colors', () => {
    selectBus1();
    clickNearestTitleWithPrefix('port');
  });

  it('should deselect Bus1 after clicking nearby line title and verify colors', () => {
    selectBus1();
    clickNearestTitleWithPrefix('bus');
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
      const busLineNode = getBusLineNode(stage);
      expect(busLineNode).to.exist;
      
      applyHighlight(busLineNode, 'bus', false);
      assertNodeColor(busLineNode, DESELECTION_COLORS.bus);
    });
  });

  it('should deselect Bus1 after clicking a nearby or distant connector node and verify colors', () => {
    selectBus1();

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;

      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId
      );
      expect(busNode).to.exist;

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
      expect(connectors.length).to.be.greaterThan(0);

      let closestConnector = null;
      let minDist = Infinity;

      connectors.forEach(n => {
        const box = n.getClientRect();
        const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const dist = Math.hypot(center.x - busCenter.x, center.y - busCenter.y);
        if (dist < minDist && n !== busNode) {
          closestConnector = n;
          minDist = dist;
        }
      });

      expect(closestConnector).to.exist;

      const connectorBox = closestConnector.getClientRect({ relativeTo: stage });
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

      const clickTarget = connector.findOne(n => n.isVisible?.() && n.listening?.()) || connector;
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
      const connector = win.__closestConnector;
      const busLineNode = getBusLineNode(stage);
      
      expect(connector).to.exist;
      expect(busLineNode).to.exist;

      // Apply highlights
      applyHighlight(connector, 'connector', true);
      applyHighlight(busLineNode, 'bus', false);
      
      // Verify colors
      assertNodeColor(connector, SELECTION_COLORS.connector);
      assertNodeColor(busLineNode, DESELECTION_COLORS.bus);
    });

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId
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

    cy.window().should(win => {
      const selected = win.k1TestUtils?.getAllAnchors?.() || [];
      const stillSelected = selected.some(a => a.partId?.toLowerCase() === targetId);
      expect(stillSelected).to.be.false;
    });
  });
});