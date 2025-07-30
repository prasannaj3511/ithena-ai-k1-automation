describe('K1_TC134 - Verify perception-19 is deselected after clicking various nearby parts', () => {
  const targetId = 'perception-19';
  const maxScrolls = 15;

  const COLORS = {
    selected: {
      sensor: '#B3D85780',
      ecu: '#B3D85780',
      connector: '#B3D85780',
      port: '#E1FF96',
      line: '#E1FF96',
      'perception-19': '#B3D85780'
    },
    deselected: {
      sensor: '#414154',
      ecu: 'white',
      connector: '#414154',
      port: '#93d4f0',
      line: '#93d4f0',
      'perception-19': '#ffffff26'
    }
  };

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.wait(1000);
  });

  function selectPerception() {
    cy.contains('.layer-button-container .layer-btn', 'Tools').click();
    cy.get('.popup-details-container').should('exist').then(($container) => {
      const tryScroll = (attempt = 0) => {
        if (attempt >= maxScrolls) {
          throw new Error(`"${targetId}" not found after ${maxScrolls} scroll attempts`);
        }
        const $match = Cypress.$(`.layer-category-btn:contains(${targetId})`);
        if ($match.length && Cypress.dom.isVisible($match[0])) {
          cy.wrap($match).scrollIntoView().click({ force: true });
        } else {
          cy.wrap($container).scrollTo('bottom', { duration: 300 });
          cy.wait(300).then(() => tryScroll(attempt + 1));
        }
      };
      tryScroll();
    });

    cy.wait(1000);
    cy.get('#zoomInButton').click().wait(300);
    cy.get('#zoomInButton').click().wait(500);
  }

  function normalizeColor(color) {
    if (!color || color === 'transparent' || color === '') {
      return 'transparent';
    }
    return color.toLowerCase().replace(/\s/g, '');
  }

  function clickNearestPart(typeMatchFn, partLabel) {
    let clickedName = '';
    let clickedPartType = partLabel.toLowerCase();

    cy.window().then((win) => {
      const stage = win.k1Stage;
      if (!stage) {
        throw new Error('Stage not found');
      }

      const perceptionNode = stage.findOne(n => n.name?.()?.toLowerCase() === targetId);
      if (!perceptionNode) {
        throw new Error('perception-19 not found');
      }

      const perceptionBox = perceptionNode.getClientRect();
      const perceptionCenter = {
        x: perceptionBox.x + perceptionBox.width / 2,
        y: perceptionBox.y + perceptionBox.height / 2
      };

      const candidates = stage.find(typeMatchFn);
      if (!candidates.length) {
        throw new Error(`No visible ${partLabel}s found`);
      }

      let closest = null;
      let minDistance = Infinity;

      candidates.forEach(node => {
        try {
          const box = node.getClientRect();
          const center = {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2
          };

          const dx = center.x - perceptionCenter.x;
          const dy = center.y - perceptionCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < minDistance && dist > 0) {
            minDistance = dist;
            closest = { node, box, name: node.name?.() || `unnamed-${partLabel}` };
          }
        } catch (error) {
          cy.log(`Error processing candidate node: ${error.message}`);
        }
      });

      if (!closest) {
        throw new Error(`No nearby ${partLabel} found`);
      }

      clickedName = closest.name;
      cy.log(`Clicking ${partLabel} near perception-19: ${clickedName}`);

      const canvas = win.document.querySelectorAll('canvas')[1];
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const rect = canvas.getBoundingClientRect();
      const clientX = rect.left + closest.box.x + closest.box.width / 2;
      const clientY = rect.top + closest.box.y + closest.box.height / 2;

      cy.get('canvas').eq(1).click(clientX, clientY, { force: true });
    });

    cy.wait(800);

    cy.window().then((win) => {
      const stage = win.k1Stage;
      const clickedNode = stage.findOne(n => n.name?.()?.toLowerCase() === clickedName.toLowerCase());
      
      expect(clickedNode, `${partLabel} ${clickedName} must exist`).to.exist;

      const hasHighlight =
        clickedNode.findOne?.(child =>
          typeof child.stroke === 'function' && child.stroke() !== 'transparent' && child.stroke() !== ''
        ) || (clickedNode.stroke?.() !== 'transparent' && clickedNode.stroke?.() !== '' && clickedNode.stroke?.() !== null);

      expect(hasHighlight, `${partLabel} ${clickedName} should be highlighted`).to.be.ok;

      const perceptionNode = stage.findOne(n => n.name?.()?.toLowerCase() === targetId);
      expect(perceptionNode, 'perception-19 node must exist').to.exist;

      const perceptionStroke = perceptionNode?.stroke?.() || '';
      const deselectedColor = COLORS.deselected['perception-19'];
      const normalizedPerceptionStroke = normalizeColor(perceptionStroke);
      const normalizedDeselectedColor = normalizeColor(deselectedColor);

      const isDeselected = normalizedPerceptionStroke === normalizedDeselectedColor ||
                          perceptionStroke === null ||
                          perceptionStroke === '' ||
                          perceptionStroke === 'transparent';

      expect(isDeselected, `perception-19 should be deselected (expected: ${deselectedColor}, got: ${perceptionStroke})`).to.be.true;
    });
  }

  it('should deselect perception-19 and highlight a nearby sensor', () => {
    selectPerception();
    clickNearestPart(
      n => n.getClassName?.() === 'Group' && 
           n.name?.().toLowerCase().includes('sensor') && 
           n.isVisible() && 
           !n.name?.().toLowerCase().includes('perception'),
      'sensor'
    );
  });

  it('should deselect perception-19 and highlight a nearby connector', () => {
    selectPerception();
    clickNearestPart(
      n => n.getClassName?.() === 'Group' && 
           n.name?.().toLowerCase().includes('connector') && 
           n.isVisible() && 
           !n.name?.().toLowerCase().includes('perception'),
      'connector'
    );
  });

  it('should deselect perception-19 and highlight a nearby line', () => {
    selectPerception();
    clickNearestPart(
      n => ['Line', 'Arrow'].includes(n.getClassName?.()) && 
           n.isVisible() && 
           !n.name?.().toLowerCase().includes('perception'),
      'line'
    );
  });

  it('should deselect perception-19 and highlight a nearby ECU', () => {
    selectPerception();
    clickNearestPart(
      n => n.getClassName?.() === 'Group' && 
           n.name?.().toLowerCase().includes('ecu') && 
           n.isVisible() && 
           !n.name?.().toLowerCase().includes('perception'),
      'ecu'
    );
  });

  it('should deselect perception-19 and highlight a nearby port', () => {
    selectPerception();
    clickNearestPart(
      n => n.getClassName?.() === 'Circle' &&
           n.id?.().startsWith('port') &&
           n.isVisible(),
      'port'
    );
  });

  it('should deselect perception-19 and apply default color when clicking on blank stage', () => {
    const targetId = 'perception-19';
    const deselectedColor = COLORS.deselected[targetId];

    selectPerception();

    cy.window().then((win) => {
      const canvas = win.document.querySelectorAll('canvas')[1];
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const rect = canvas.getBoundingClientRect();
      const blankX = rect.left + rect.width / 2;
      const blankY = rect.top + rect.height / 2;

      cy.get('canvas').eq(1).click(blankX, blankY, { force: true });
    });

    cy.wait(500);

    cy.window().then((win) => {
      const stage = win.k1Stage;
      const perceptionNode = stage.findOne(n => n.name?.()?.toLowerCase() === targetId);
      expect(perceptionNode, 'perception-19 node must exist').to.exist;

      const perceptionStroke = perceptionNode?.stroke?.() || '';
      const normalizedPerceptionStroke = normalizeColor(perceptionStroke);
      const normalizedExpected = normalizeColor(deselectedColor);

      const isDeselected =
        normalizedPerceptionStroke === normalizedExpected ||
        normalizedPerceptionStroke === 'transparent' ||
        perceptionStroke === null ||
        perceptionStroke === '';

      expect(isDeselected, `perception-19 should be deselected and default color applied (expected: ${deselectedColor}, got: ${perceptionStroke})`).to.be.true;
    });
  });
});
