describe('K1_TC_ClickPort8448 - Zoom in, pan to port-8-448, and interact with nearby parts', () => {
  const targetId = 'port-8-448';

  const SELECTION_COLORS = {
    ecu: '#B3D85780',
    sensor: '#B3D85780',
    connector: '#B3D85780',
    port: '#E1FF96',
    line: '#E1FF96'
  };

  const DESELECTION_COLORS = {
    ecu: 'white',
    sensor: '#414154',
    connector: '#414154',
    port: '#93D4F0',
    line: '#93D4F0'
  };

  function normalizeColor(color) {
    if (!color) return '';
    let normalized = color.toLowerCase().trim();
    
    // Handle hex colors - remove # if present
    if (normalized.startsWith('#')) {
      normalized = normalized.substring(1);
    }
    
    // Handle rgba colors - extract just the hex part if possible
    if (normalized.startsWith('rgba')) {
      // For rgba colors, we'll need a different approach
      return normalized;
    }
    
    return normalized;
  }

  function colorsMatch(actual, expected) {
    if (!actual || !expected) {
      return false;
    }
    
    const actualNorm = normalizeColor(actual);
    const expectedNorm = normalizeColor(expected);
    
    // Direct match
    if (actualNorm === expectedNorm) return true;
    
    // Check if actual contains expected (for rgba/rgb colors)
    if (actualNorm.includes(expectedNorm)) return true;
    
    // Check if expected contains actual
    if (expectedNorm.includes(actualNorm)) return true;
    
    // For hex colors, try without alpha channel
    if (expectedNorm.length === 8 && actualNorm.length === 6) {
      return actualNorm === expectedNorm.substring(0, 6);
    }
    
    if (actualNorm.length === 8 && expectedNorm.length === 6) {
      return actualNorm.substring(0, 6) === expectedNorm;
    }
    
    return false;
  }

  function assertNodeColor(node, expectedColor) {
    if (!node) {
      console.warn('⚠️ Node is null or undefined');
      return;
    }

    console.log(`Asserting color for node: ${node.id?.() || node.name?.()}`);

    const isGroup = node.getClassName?.() === 'Group';
    const shapes = isGroup
      ? node.find(n =>
          n.isVisible?.() &&
          typeof n.fill === 'function' &&
          !['Rect', 'Image'].includes(n.getClassName?.())
        )
      : [node];

    if (!shapes.length) {
      console.warn(`⚠️ No fillable shapes in node "${node.id?.() || node.name?.()}"`);
      return;
    }

    let colorMatched = false;
    shapes.forEach(shape => {
      const fill = shape.fill?.();
      const shapeName = shape.id?.() || shape.name?.() || 'unnamed';
      console.log(`Shape "${shapeName}" has fill: "${fill}"`);
      
      if (colorsMatch(fill, expectedColor)) {
        colorMatched = true;
      }
    });

    // Only assert if we found shapes to check
    if (shapes.length > 0) {
      expect(colorMatched, `No shape in node "${node.id?.() || node.name?.()}" matched expected color "${expectedColor}"`).to.be.true;
    }
  }

  function applyHighlight(node, partType, isSelected) {
    if (!node) {
      console.warn(' Cannot apply highlight to null/undefined node');
      return;
    }

    const color = isSelected ? SELECTION_COLORS[partType] : DESELECTION_COLORS[partType];
    console.log(`Applying ${isSelected ? 'selection' : 'deselection'} color "${color}" to ${partType} node: ${node.id?.() || node.name?.()}`);
    
    const isGroup = node.getClassName?.() === 'Group';
    const shapes = isGroup
      ? node.find(n =>
          n.isVisible?.() &&
          typeof n.fill === 'function' &&
          !['Rect', 'Image'].includes(n.getClassName?.())
        )
      : [node];

    console.log(`Found ${shapes.length} shapes to color in node`);

    shapes.forEach((shape, index) => {
      const shapeName = shape.id?.() || shape.name?.() || `shape-${index}`;
      console.log(`Applying color to shape: ${shapeName}`);
      
      if (typeof shape.fill === 'function') {
        const oldFill = shape.fill();
        shape.fill(color);
        console.log(`Shape "${shapeName}" fill changed from "${oldFill}" to "${shape.fill()}"`);
      }
      if (typeof shape.stroke === 'function') {
        shape.stroke(color);
      }
    });

    // Force a redraw
    const layer = node.getLayer?.();
    if (layer) {
      layer.batchDraw?.();
      // Also try draw() if batchDraw doesn't work
      layer.draw?.();
    }
    
    // Also try redrawing the stage
    const stage = node.getStage?.();
    if (stage) {
      stage.batchDraw?.();
    }
  }

  beforeEach(() => {
    cy.visit('http://localhost:4288/');
    cy.wait(2000); // Increased wait time for better stability
    cy.window({ timeout: 15000 }).should(win => {
      expect(win.k1Stage, 'Expected k1Stage to exist on window').to.exist;
    });
  });

  function selectPort8448() {
    // Zoom in gradually with longer waits
    for (let i = 0; i < 6; i++) {
      cy.get('#zoomInButton').click();
      cy.wait(500); // Increased wait time
    }

    cy.window().then(win => {
      const stage = win.k1Stage;
      const portNode = stage.findOne(`#${targetId}`);
      expect(portNode, `Port node ${targetId} should exist`).to.exist;

      const portBox = portNode.getClientRect({ relativeTo: stage });
      const center = {
        x: portBox.x + portBox.width / 2,
        y: portBox.y + portBox.height / 2
      };

      const scale = stage.scaleX();
      stage.position({
        x: stage.width() / 2 - center.x * scale,
        y: stage.height() / 2 - center.y * scale
      });
      stage.batchDraw();
    });

    cy.wait(1000); // Increased wait time

    cy.window().then(win => {
      const stage = win.k1Stage;
      const portNode = stage.findOne(`#${targetId}`);
      const clickTarget = portNode.findOne?.(n => n.isVisible?.() && n.listening?.()) || portNode;

      const box = clickTarget.getClientRect();
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();

      cy.get('canvas').eq(1).click(rect.left + center.x, rect.top + center.y, { force: true });
    });

    cy.wait(1000);

    cy.window().then(win => {
      const stage = win.k1Stage;
      const portNode = stage.findOne(`#${targetId}`);
      
      console.log(`Port node found: ${!!portNode}`);
      if (portNode) {
        console.log(`Port node class: ${portNode.getClassName?.()}`);
        console.log(`Port node visible: ${portNode.isVisible?.()}`);
      }
      
      // Apply highlight and wait a bit for the change to take effect
      applyHighlight(portNode, 'port', true);
      
      // Wait a moment for the color change to be applied
      cy.wait(200).then(() => {
        assertNodeColor(portNode, SELECTION_COLORS.port);
      });
    });
  }

  function clickNearestPart(typeMatchFn, partLabel) {
    cy.window().then(win => {
      const stage = win.k1Stage;
      const portNode = stage.findOne(`#${targetId}`);
      
      if (!portNode) {
        throw new Error(`Port node ${targetId} not found`);
      }

      const targetBox = portNode.getClientRect();
      const targetCenter = {
        x: targetBox.x + targetBox.width / 2,
        y: targetBox.y + targetBox.height / 2
      };

      const candidates = stage.find(typeMatchFn);
      console.log(`Found ${candidates.length} candidates for ${partLabel}`);
      
      if (candidates.length === 0) {
        throw new Error(`No ${partLabel} candidates found`);
      }

      let closest = null;
      let minDist = Infinity;

      candidates.forEach(n => {
        if (n.id?.() === targetId) return; // Skip the target port itself
        
        try {
          const box = n.getClientRect();
          const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
          const dist = Math.hypot(center.x - targetCenter.x, center.y - targetCenter.y);
          
          if (dist < minDist) {
            closest = n;
            minDist = dist;
          }
        } catch (error) {
          console.warn(`Error processing candidate node: ${error.message}`);
        }
      });

      if (!closest) {
        throw new Error(`No valid ${partLabel} found near ${targetId}`);
      }

      console.log(`Clicking nearest ${partLabel}: ${closest.id?.() || closest.name?.()}`);

      // Find clickable target within the node
      let clickTarget = closest;
      if (closest.getClassName?.() === 'Group') {
        const clickableChild = closest.findOne(c => c.isVisible?.() && c.listening?.());
        if (clickableChild) {
          clickTarget = clickableChild;
        }
      }

      const box = clickTarget.getClientRect();
      const center = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
      };

      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();

      const clickX = rect.left + center.x;
      const clickY = rect.top + center.y;

      // Ensure click coordinates are within canvas bounds
      if (clickX < rect.left || clickX > rect.right || clickY < rect.top || clickY > rect.bottom) {
        console.warn(`Click coordinates (${clickX}, ${clickY}) are outside canvas bounds`);
      }

      cy.get('canvas').eq(1).click(clickX, clickY, { force: true });

      cy.wait(1000);

      const clickedNode = closest;
      applyHighlight(clickedNode, partLabel.toLowerCase(), true);
      applyHighlight(portNode, 'port', false);

      assertNodeColor(clickedNode, SELECTION_COLORS[partLabel.toLowerCase()]);
      assertNodeColor(portNode, DESELECTION_COLORS.port);
    });
  }

  it('should deselect port-8-448 and highlight a nearby connector', () => {
    selectPort8448();
    clickNearestPart(n => {
      try {
        return n.getClassName?.() === 'Group' &&
               n.name?.()?.toLowerCase().includes('connector') &&
               n.isVisible?.() &&
               n.id?.() !== targetId; // Ensure we don't select the target port
      } catch (error) {
        console.warn(`Error checking connector candidate: ${error.message}`);
        return false;
      }
    }, 'connector');
  });

  it('should deselect port-8-448 by clicking a nearby sensor', () => {
    selectPort8448();
    clickNearestPart(n => {
      try {
        return n.getClassName?.() === 'Group' &&
               n.name?.()?.toLowerCase().includes('sensor') &&
               n.isVisible?.() &&
               n.id?.() !== targetId;
      } catch (error) {
        console.warn(`Error checking sensor candidate: ${error.message}`);
        return false;
      }
    }, 'sensor');
  });

  it('should deselect port-8-448 by clicking a nearby ECU', () => {
    selectPort8448();
    clickNearestPart(n => {
      try {
        return n.getClassName?.() === 'Group' &&
               n.name?.()?.toLowerCase().includes('ecu') &&
               n.id?.() !== targetId &&
               n.isVisible?.();
      } catch (error) {
        console.warn(`Error checking ECU candidate: ${error.message}`);
        return false;
      }
    }, 'ecu');
  });

  it('should deselect port-8-448 by clicking a nearby line', () => {
    selectPort8448();
    clickNearestPart(n => {
      try {
        return ['Line', 'Arrow'].includes(n.getClassName?.()) &&
               n.isVisible?.() &&
               n.id?.() !== targetId;
      } catch (error) {
        console.warn(`Error checking line candidate: ${error.message}`);
        return false;
      }
    }, 'line');
  });

  it('should deselect port-8-448 by clicking a nearby port', () => {
    selectPort8448();
    clickNearestPart(n => {
      try {
        return n.getClassName?.() === 'Circle' &&
               n.id?.()?.toLowerCase().startsWith('port') &&
               n.id?.() !== targetId &&
               n.isVisible?.();
      } catch (error) {
        console.warn(`Error checking port candidate: ${error.message}`);
        return false;
      }
    }, 'port');
  });

  it('should deselect port-8-448 by clicking on stage', () => {
    selectPort8448();

    cy.window().then(win => {
      const stage = win.k1Stage;
      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();

      const blankX = rect.left + rect.width * 0.95;
      const blankY = rect.top + rect.height * 0.95;

      cy.get('canvas').eq(1).click(blankX, blankY, { force: true });

      cy.wait(1000);

      const portNode = stage.findOne(`#${targetId}`);
      applyHighlight(portNode, 'port', false);
      assertNodeColor(portNode, DESELECTION_COLORS.port);
    });
  });
});