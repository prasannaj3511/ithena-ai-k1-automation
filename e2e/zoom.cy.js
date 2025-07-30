describe('K1_TC_Sensor35SelectionDeselection - Verify sensor35 is deselected after clicking various nearby parts', () => {
  const targetId = 'sensor35';

  beforeEach(() => {
    cy.visit('http://localhost:4288');
    cy.window({ timeout: 10000 }).should((win) => {
      const stageGetter = win.k1TestUtils?.getKonvaStage || win.k1Stage;
      expect(stageGetter).to.exist;
    });
  });

  function selectSensor35() {
    cy.log(`Attempting to select ${targetId}`);

    for (let i = 0; i < 6; i++) {
      cy.get('#zoomInButton', { timeout: 5000 }).should('be.visible').click().wait(500);
    }

    cy.window().then((win) => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const sensorGroup = stage.findOne(`#${targetId}`);
      expect(sensorGroup, `${targetId} group must exist`).to.exist;

      const sensorBox = sensorGroup.getClientRect({ relativeTo: stage });
      const sensorCenter = {
        x: sensorBox.x + sensorBox.width / 2,
        y: sensorBox.y + sensorBox.height / 2
      };

      const containerWidth = stage.width();
      const containerHeight = stage.height();
      const scale = stage.scaleX();

      stage.position({
        x: containerWidth / 2 - sensorCenter.x * scale,
        y: containerHeight / 2 - sensorCenter.y * scale
      });

      stage.batchDraw();
      cy.wait(800);
      cy.log('Stage panned and batchDraw called.');

      const shapeForClick = sensorGroup.findOne(n =>
        typeof n.getClientRect === 'function' &&
        n.isVisible() &&
        n.listening()
      ) || sensorGroup;

      const box = shapeForClick.getClientRect();
      const center = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
      };

      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const clientX = rect.left + center.x;
      const clientY = rect.top + center.y;

      cy.get('canvas').eq(1).click(clientX, clientY, { force: true });
    });

    cy.wait(1000);

    cy.window().then((win) => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const sensorNode = stage.findOne(`#${targetId}`);
      expect(sensorNode, `${targetId} node must exist after selection attempt`).to.exist;

      const hasHighlight =
        sensorNode.findOne?.(child =>
          typeof child.stroke === 'function' && child.stroke() !== 'transparent' && child.stroke() !== ''
        ) || (sensorNode.stroke?.() !== 'transparent' && sensorNode.stroke?.() !== '' && sensorNode.stroke?.() !== null);

      expect(hasHighlight, `${targetId} should be selected and have a visual highlight`).to.be.ok;
      cy.log(`${targetId} successfully selected.`);
    });
  }

  function clickNearestPart(typeMatchFn, partLabel) {
    let clickedName = '';

    cy.window().then((win) => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const targetNode = stage.findOne(`#${targetId}`);
      const targetBox = targetNode.getClientRect();
      const targetCenter = {
        x: targetBox.x + targetBox.width / 2,
        y: targetBox.y + targetBox.height / 2
      };

      const candidates = stage.find(typeMatchFn);
      if (!candidates.length) throw new Error(`No visible ${partLabel}s found`);

      let closest = null;
      let minDistance = Infinity;

      candidates.forEach(node => {
        const box = node.getClientRect();
        const center = {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2
        };

        const dx = center.x - targetCenter.x;
        const dy = center.y - targetCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDistance && node.id?.() !== targetId) {
          minDistance = dist;
          closest = { node, box, name: node.name?.() || node.id?.() || `unnamed-${partLabel}` };
        }
      });

      if (!closest) throw new Error(`No nearby ${partLabel} found for ${targetId}`);

      clickedName = closest.name;
      cy.log(`Clicking ${partLabel} near ${targetId}: ${clickedName}`);

      const box = closest.box;
      const center = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2
      };

      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const clientX = rect.left + center.x;
      const clientY = rect.top + center.y;

      // Always simulate real Konva-compatible canvas click
      cy.get('canvas').eq(1).click(clientX, clientY, { force: true });
    });

    cy.wait(1000);

    cy.window().then((win) => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const clickedNode = stage.findOne(n =>
        n.name?.()?.toLowerCase() === clickedName.toLowerCase() || n.id?.() === clickedName
      );
      expect(clickedNode, `${partLabel} ${clickedName} must exist`).to.exist;

      const hasHighlight =
        clickedNode.findOne?.(child =>
          typeof child.stroke === 'function' && child.stroke() !== 'transparent' && child.stroke() !== ''
        ) || (clickedNode.stroke?.() !== 'transparent' && clickedNode.stroke?.() !== '' && clickedNode.stroke?.() !== null);

      expect(hasHighlight, `${partLabel} ${clickedName} should be highlighted`).to.be.ok;

      const targetNode = stage.findOne(`#${targetId}`);
      const targetStroke = targetNode?.stroke?.() || '';
      expect(targetStroke, `${targetId} should be deselected`).to.be.oneOf([null, '', 'transparent']);
      cy.log(`${targetId} successfully deselected by clicking ${clickedName}.`);
    });
  }

  it('should deselect sensor35 and highlight a nearby sensor', () => {
    selectSensor35();
    clickNearestPart(
      n => n.getClassName?.() === 'Group' && n.name?.().toLowerCase().includes('sensor') && n.isVisible(),
      'sensor'
    );
  });

  it('should deselect sensor35 and highlight a nearby connector', () => {
    selectSensor35();
    clickNearestPart(
      n => n.getClassName?.() === 'Group' && n.name?.().toLowerCase().includes('connector') && n.isVisible(),
      'connector'
    );
  });

  it('should deselect sensor35 and highlight a nearby line', () => {
    selectSensor35();
    clickNearestPart(
      n => ['Line', 'Arrow'].includes(n.getClassName?.()) && n.isVisible(),
      'line'
    );
  });

  it('should deselect sensor35 and highlight a nearby ECU', () => {
    selectSensor35();
    clickNearestPart(
      n => n.getClassName?.() === 'Group' && n.name?.().toLowerCase().includes('ecu') && n.isVisible(),
      'ecu'
    );
  });

  it('should deselect sensor35 and highlight a nearby port', () => {
    selectSensor35();
    clickNearestPart(
      n => n.getClassName?.() === 'Circle' && n.id?.().toLowerCase().startsWith('port') && n.isVisible(),
      'port'
    );
  });

  it('should deselect sensor35 when clicking on blank stage', () => {
    selectSensor35();

    cy.window().then((win) => {
      const canvas = win.document.querySelectorAll('canvas')[1];
      const rect = canvas.getBoundingClientRect();
      const blankX = rect.left + rect.width / 2;
      const blankY = rect.top + rect.height / 2;

      cy.get('canvas').eq(1).click(blankX, blankY, { force: true });
    });

    cy.wait(800);

    cy.window().then((win) => {
      const stage = win.k1TestUtils?.getKonvaStage?.() || win.k1Stage;
      const targetNode = stage.findOne(`#${targetId}`);
      const targetStroke = targetNode?.stroke?.() || '';
      expect(targetStroke, `${targetId} should be deselected`).to.be.oneOf([null, '', 'transparent']);
      cy.log(`${targetId} successfully deselected by clicking blank stage.`);
    });
  });
});
