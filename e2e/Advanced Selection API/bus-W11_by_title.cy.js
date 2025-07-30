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

  function verifyBusColor(expectedColor) {
    cy.window().should(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' &&
        n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      expect(busNode).to.exist;
      const color = busNode.getAttr('stroke') || busNode.getAttr('fill');
      expect(color.toLowerCase()).to.equal(expectedColor.toLowerCase());
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
    for (let i = 0; i < 6; i++) {
      cy.get('#zoomInButton').click().wait(300);
    }

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const node = stage.findOne(n =>
        n.getClassName?.() === 'Text' && n.text?.()?.toLowerCase().trim() === targetId.toLowerCase()
      );
      expect(node).to.exist;
      const box = node.getClientRect({ relativeTo: stage });
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
      const node = stage.findOne(n =>
        n.getClassName?.() === 'Text' && n.text?.()?.toLowerCase().trim() === targetId.toLowerCase()
      );
      expect(node).to.exist;
      const box = node.getClientRect();
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
    verifyBusColor(SELECTION_COLORS.bus);
  }

  function clickNearestTitleWithPrefix(prefix) {
  cy.window().then(win => {
    const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
    const node = stage.findOne(n =>
      n.getClassName?.() === 'Text' && n.text?.()?.toLowerCase().trim() === targetId.toLowerCase()
    );
    expect(node).to.exist;
    const box = node.getClientRect();
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

    const matches = stage.find(n => {
      const text = n.text?.()?.toLowerCase().trim();
      return n.getClassName?.() === 'Text' &&
        text?.startsWith(prefix.toLowerCase()) &&
        text !== targetId.toLowerCase() &&
        n.isVisible?.();
    });

    let nearest = null;
    let minDist = Infinity;

    matches.forEach(n => {
      const b = n.getClientRect();
      const c = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      const dist = Math.hypot(c.x - center.x, c.y - center.y);
      if (dist > 10 && dist < minDist) {
        nearest = n;
        minDist = dist;
      }
    });

    expect(nearest).to.exist;

    // Find the most appropriate interactive parent (Group or Shape)
    let interactiveTarget = nearest;
    let current = nearest;

    while (current && (!current.listening?.() || current.getClassName?.() === 'Text')) {
      const parent = current.getParent?.();
      if (!parent) break;
      current = parent;
    }

    if (current?.listening?.() && current.getClassName?.() !== 'Text') {
      interactiveTarget = current;
    }

    // Click center of the interactive target
    const clickBox = interactiveTarget.getClientRect();
    const clickCenter = {
      x: clickBox.x + clickBox.width / 2,
      y: clickBox.y + clickBox.height / 2
    };

    const canvas = win.document.querySelectorAll('canvas')[1];
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / stage.width();
    const scaleY = rect.height / stage.height();
    const clickX = rect.left + clickCenter.x * scaleX;
    const clickY = rect.top + clickCenter.y * scaleY;

    cy.get('canvas').eq(1).click(clickX, clickY, { force: true });
  });

  cy.wait(500);
  verifyBusColor(DESELECTION_COLORS.bus);
}

  it('should deselect Bus-W11 after clicking nearby sensor title', () => {
    selectBusW11();
    clickNearestTitleWithPrefix('sensor');
  });

  it('should deselect Bus-W11 after clicking nearby ECU title', () => {
  selectBusW11();
  clickNearestTitleWithPrefix('ecu');
});


  it('should deselect Bus-W11 after clicking nearby port title', () => {
    selectBusW11();
    clickNearestTitleWithPrefix('port');
  });

  it('should deselect Bus-W11 after clicking nearby line title', () => {
    selectBusW11();
    clickNearestTitleWithPrefix('bus');
  });

  it('should deselect Bus-W11 after clicking blank stage', () => {
    selectBusW11();
    cy.window().then(win => {
      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const clickX = rect.left + rect.width * 0.95;
      const clickY = rect.top + rect.height * 0.95;
      cy.get('canvas').eq(1).click(clickX, clickY, { force: true });
    });
    cy.wait(500);
    verifyBusColor(DESELECTION_COLORS.bus);
  });

  it('should deselect Bus-W11 after clicking a nearby connector node', () => {
    selectBusW11();

    cy.window().then(win => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const busNode = stage.findOne(n =>
        n.getClassName?.() === 'Line' && n.name?.()?.toLowerCase() === targetId.toLowerCase()
      );
      expect(busNode).to.exist;

      const busBox = busNode.getClientRect();
      const busCenter = { x: busBox.x + busBox.width / 2, y: busBox.y + busBox.height / 2 };

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
    verifyBusColor(DESELECTION_COLORS.bus);
  });
});
