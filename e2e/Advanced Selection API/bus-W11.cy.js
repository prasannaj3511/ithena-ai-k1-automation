// cypress/e2e/K1_TC_BusW11SelectionDeselection.cy.js

describe('K1_TC_BusW11SelectionDeselection - Verify Bus-W11 is deselected after clicking nearby parts', () => {
  const targetId = 'bus-W11';

  const SELECTION_COLORS = {
    bus: '#E1FF96',
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
    ecu: 'white',
    port: '#93D4F0',
    line: '#93D4F0'
  };

  function colorsMatch(actualColor, expectedColor) {
    if (!actualColor) return false;
    const actual = actualColor.toLowerCase();
    const expected = expectedColor.toLowerCase();
    return actual.includes(expected) || actual.startsWith(expected);
  }

  function assertBusColor(expectedColor, message = '') {
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' && n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      expect(busNode, `Bus node with id '${targetId}' should exist.`).to.exist;

      const actualColor = busNode.stroke?.() || busNode.getAttr('stroke');
      const colorMessage = message
        ? `${message} - Expected ${expectedColor}, got ${actualColor}`
        : `Expected ${expectedColor}, got ${actualColor}`;
      expect(colorsMatch(actualColor, expectedColor), colorMessage).to.be.true;
    });
  }

  function assertEcuColor(expectedColor, message = '') {
    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const ecuAnchor = stage.findOne(n => n.name?.()?.toLowerCase().includes('ecu'));
      expect(ecuAnchor, 'Could not find an anchor element for the ECU').to.exist;

      const ecuGroup = ecuAnchor.getParent();
      expect(ecuGroup, 'Could not find the parent group for the ECU').to.exist;

      const actualColor = ecuGroup.getAttr('fill');
      const colorMessage = message
        ? `${message} - Expected ECU fill ${expectedColor}, got ${actualColor}`
        : `Expected ECU fill ${expectedColor}, got ${actualColor}`;
      expect(colorsMatch(actualColor, expectedColor), colorMessage).to.be.true;
    });
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

  function selectBusW11() {
    assertBusColor(DESELECTION_COLORS.bus, 'Initial state: deselected');

    for (let i = 0; i < 6; i++) {
      cy.get('#zoomInButton').click().wait(300);
    }

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' && n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );

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
        n.getClassName?.() === 'Line' && n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );

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
    assertBusColor(SELECTION_COLORS.bus, 'After selection');
  }

  function clickNearestPart(typeMatchFn, partType = 'part') {
    assertBusColor(SELECTION_COLORS.bus, `Before clicking ${partType}`);

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' && n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      const busBox = busNode.getClientRect();
      const busCenter = {
        x: busBox.x + busBox.width / 2,
        y: busBox.y + busBox.height / 2
      };

      const candidates = stage.find(typeMatchFn);
      let closest = null;
      let minDist = Infinity;

      candidates.forEach(n => {
        const box = n.getClientRect();
        const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const dist = Math.hypot(center.x - busCenter.x, center.y - busCenter.y);
        if (dist < minDist && n !== busNode) {
          closest = n;
          minDist = dist;
        }
      });

      const clickTarget = closest.findOne?.(n => n.isVisible?.() && n.listening?.()) || closest;
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
    assertBusColor(DESELECTION_COLORS.bus, `After clicking ${partType}`);
  }

  it('deselects after connector click', () => {
    selectBusW11();
    clickNearestPart(n => n.getClassName?.() === 'Group' && n.name?.()?.includes('connector'), 'connector');
  });

  it('deselects after sensor click', () => {
    selectBusW11();
    clickNearestPart(n => n.getClassName?.() === 'Group' && n.name?.()?.includes('sensor'), 'sensor');
  });

  it('deselects after ECU click and verifies ECU is selected', () => {
    selectBusW11();

    assertEcuColor(DESELECTION_COLORS.ecu, 'Before clicking ecu');

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;

      const ecuAnchor = stage.findOne(n => n.name?.()?.toLowerCase().includes('ecu'));
      expect(ecuAnchor, 'Could not find an anchor element for the ECU.').to.exist;

      const clickTarget = ecuAnchor.getParent();
      expect(clickTarget, "The ECU anchor text must have a parent Group.").to.exist;
      expect(clickTarget.getClassName(), "The parent of the ECU anchor should be a Group.").to.equal('Group');

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

    assertBusColor(DESELECTION_COLORS.bus, 'After clicking ecu');
    assertEcuColor(SELECTION_COLORS.ecu, 'After clicking ecu');
  });

  it('deselects after port click', () => {
    selectBusW11();
    clickNearestPart(n => n.getClassName?.() === 'Circle' && n.id?.()?.toLowerCase().startsWith('port'), 'port');
  });

  // ========== THIS BLOCK IS NOW CORRECTED ==========
  it('deselects after line click', () => {
    selectBusW11();
    // Corrected the function name from clickNearest_part to clickNearestPart
    clickNearestPart(n => ['Line', 'Arrow'].includes(n.getClassName?.()), 'line');
  });
  // ===============================================

  it('deselects after clicking blank stage', () => {
    selectBusW11();

    cy.window().then(win => {
      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const clickX = rect.left + rect.width * 0.95;
      const clickY = rect.top + rect.height * 0.95;
      cy.get('canvas').eq(1).click(clickX, clickY, { force: true });
    });

    cy.wait(500);
    assertBusColor(DESELECTION_COLORS.bus, 'After clicking blank stage');
  });

  // Removed the malformed 'it' block that was here
});