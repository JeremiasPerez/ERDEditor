const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      let body = fs.readFileSync(file);
      if (pathname === '/js/app.js') body = body.toString().replace(
        'setupEditorActions(graph, paper, addTools, initAuxConnection)',
        'setupEditorActions(graph, paper, addTools, initAuxConnection); window.testEditor = { graph, paper, createEntity, createAttribute };'
      );
      res.setHeader('Content-Type', /\.m?js$/.test(file) ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
      res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().startsWith('https://cdn.jsdelivr.net/npm/@joint/core')) {
        request.respond({ contentType: 'text/javascript', body: fs.readFileSync(path.join(root, 'node_modules/@joint/core/dist/joint.js')) });
      } else request.continue();
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.waitForFunction(() => window.testEditor);
    await page.evaluate(() => {
      testEditor.createEntity(160, 150);
      testEditor.createEntity(380, 150);
    });
    await page.waitForTimeout(50);
    const positions = () => page.evaluate(() => testEditor.graph.getElements().map(cell => cell.position()));
    const initial = await positions();
    const corner = async index => page.evaluate(index => {
      const { paper, graph } = testEditor;
      const p = graph.getElements()[index].position();
      return paper.localToClientPoint({ x: p.x + 5, y: p.y + 5 });
    }, index);
    assert.equal(await page.$('#selectElements'), null);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 2; i++) {
      const p = await corner(i);
      await page.mouse.click(p.x, p.y);
    }
    await page.keyboard.up('Shift');
    assert.equal(await page.$$eval('.editor-selected', elements => elements.length), 2);
    const p = await corner(0);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + 80, p.y + 50, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(50);
    const moved = await positions();
    assert.deepEqual(moved, initial.map(p => ({ x: p.x + 80, y: p.y + 50 })));
    await page.keyboard.down('Control');
    await page.keyboard.press('z');
    await page.keyboard.up('Control');
    assert.deepEqual(await positions(), initial);
    await page.keyboard.down('Control');
    await page.keyboard.press('y');
    await page.keyboard.up('Control');
    assert.deepEqual(await positions(), moved);
    await page.click('#undo');
    assert.deepEqual(await positions(), initial);
    await page.click('#redo');
    assert.deepEqual(await positions(), moved);

    // Compound removal must restore the element and its connected link together.
    await page.evaluate(() => {
      const [a, b] = testEditor.graph.getElements();
      testEditor.graph.addCell({ type: 'erd.AttributeLink', source: { id: a.id }, target: { id: b.id } });
    });
    await page.waitForTimeout(50);
    await page.evaluate(() => testEditor.graph.getElements()[0].remove());
    await page.waitForTimeout(50);
    await page.click('#undo');
    assert.equal(await page.evaluate(() => testEditor.graph.getElements().length), 2);
    assert.equal(await page.evaluate(() => testEditor.graph.getLinks().filter(c => c.id !== 'connectionLink').length), 1);
    await page.click('#redo');
    assert.equal(await page.evaluate(() => testEditor.graph.getElements().length), 1);

    // Text edits remain editable after restoring a snapshot.
    await page.click('.elementNameInput');
    await page.keyboard.type('Cliente');
    await page.click('#undo');
    assert.equal(await page.$eval('.elementNameInput', el => el.innerText), '');
    await page.click('#redo');
    assert.equal(await page.$eval('.elementNameInput', el => el.innerText.toLowerCase()), 'cliente');

    // Export's temporary model attributes and selection outlines are not diagram edits.
    await page.evaluate(() => {
      window.htmlToImage.toPng = async () => 'data:image/png;base64,';
    });
    await page.click('#imageExport');
    await page.waitForTimeout(50);
    await page.click('#undo');
    assert.equal(await page.$eval('.elementNameInput', el => el.innerText), '');

    // Shift-click works without the selection mode, and Escape clears selection.
    await page.keyboard.press('Escape');
    await page.evaluate(() => testEditor.createEntity(600, 200));
    await page.waitForTimeout(50);
    const first = await corner(0);
    const second = await corner(1);
    await page.mouse.click(first.x, first.y);
    await page.keyboard.down('Shift');
    await page.mouse.click(second.x, second.y);
    await page.keyboard.up('Shift');
    assert.equal(await page.$$eval('.editor-selected', elements => elements.length), 2);
    await page.keyboard.press('Escape');
    assert.equal(await page.$$eval('.editor-selected', elements => elements.length), 0);

    // Rectangle selection starts on the background, in any drag direction.
    await page.reload();
    await page.waitForFunction(() => window.testEditor);
    await page.evaluate(() => {
      testEditor.createEntity(160, 150);
      testEditor.createEntity(380, 150);
      testEditor.createEntity(700, 350);
    });
    await page.waitForTimeout(50);
    const rectanglePositions = await positions();
    const clientPoint = point => page.evaluate(point => testEditor.paper.localToClientPoint(point), point);
    const rectangle = async (start, end) => {
      const a = await clientPoint(start);
      const b = await clientPoint(end);
      await page.mouse.move(a.x, a.y);
      await page.mouse.down();
      await page.mouse.move(b.x, b.y, { steps: 8 });
      assert.equal(await page.$eval('.editor-selection-box', el => el.hidden), false);
      await page.mouse.up();
      assert.equal(await page.$eval('.editor-selection-box', el => el.hidden), true);
    };
    for (const [start, end] of [
      [{ x: 50, y: 90 }, { x: 480, y: 210 }],
      [{ x: 480, y: 210 }, { x: 50, y: 90 }],
      [{ x: 50, y: 210 }, { x: 480, y: 90 }],
      [{ x: 480, y: 90 }, { x: 50, y: 210 }]
    ]) {
      await rectangle(start, end);
      assert.equal(await page.$$eval('.editor-selected', elements => elements.length), 2);
      assert.deepEqual(await positions(), rectanglePositions);
    }
    // Add an element by intersecting just part of its bounding box.
    await page.keyboard.down('Shift');
    await rectangle({ x: 600, y: 300 }, { x: 650, y: 340 });
    await page.keyboard.up('Shift');
    assert.equal(await page.$$eval('.editor-selected', elements => elements.length), 3);
    const groupCorner = await corner(0);
    await page.mouse.move(groupCorner.x, groupCorner.y);
    await page.mouse.down();
    await page.mouse.move(groupCorner.x + 20, groupCorner.y + 30, { steps: 5 });
    await page.mouse.up();
    await page.click('#undo');
    assert.deepEqual(await positions(), rectanglePositions);
    // Selection itself does not consume an undo step.
    await page.click('#undo');
    assert.equal(await page.evaluate(() => testEditor.graph.getElements().length), 0);
    await page.click('#redo');
    // Cancel a live rectangle without leaving an overlay or disabling text selection.
    const start = await clientPoint({ x: 30, y: 40 });
    const end = await clientPoint({ x: 500, y: 230 });
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 5 });
    await page.keyboard.press('Escape');
    await page.mouse.up();
    assert.equal(await page.$$eval('.editor-selected', elements => elements.length), 0);
    assert.equal(await page.$eval('.editor-selection-box', el => el.hidden), true);
    assert.equal(await page.$eval('body', el => el.classList.contains('editor-selecting')), false);

    // Delete the selection through the canvas action, preserving unselected elements.
    await page.evaluate(() => {
      const [a, b, c] = testEditor.graph.getElements();
      testEditor.graph.addCells([
        { type: 'erd.AttributeLink', source: { id: a.id }, target: { id: b.id } },
        { type: 'erd.AttributeLink', source: { id: b.id }, target: { id: c.id } }
      ]);
    });
    await page.waitForTimeout(50);
    await rectangle({ x: 50, y: 90 }, { x: 480, y: 210 });
    assert.equal(await page.$eval('#deleteSelection', el => el.hidden), false);
    assert.equal(await page.$eval('#deleteSelection', el => !!el.closest('#paperCont')), true);
    await page.click('#deleteSelection');
    assert.equal(await page.evaluate(() => testEditor.graph.getElements().length), 1);
    assert.equal(await page.evaluate(() => testEditor.graph.getLinks().filter(c => c.id !== 'connectionLink').length), 0);
    assert.equal(await page.$eval('#deleteSelection', el => el.hidden), true);
    await page.click('#undo');
    assert.deepEqual(await positions(), rectanglePositions);
    assert.equal(await page.evaluate(() => testEditor.graph.getLinks().filter(c => c.id !== 'connectionLink').length), 2);
    await page.click('#redo');
    assert.equal(await page.evaluate(() => testEditor.graph.getElements().length), 1);

    // History actions are on the left; all action buttons share size and styling.
    const toolbar = await page.evaluate(() => {
      const buttons = ['undo', 'redo', 'download', 'import', 'imageExport'].map(id => document.getElementById(id));
      return {
        left: buttons[1].getBoundingClientRect().right < document.querySelector('#toolbarElements').getBoundingClientRect().left,
        tops: buttons.map(button => button.getBoundingClientRect().top),
        heights: buttons.map(button => button.getBoundingClientRect().height),
        borders: buttons.map(button => getComputedStyle(button).border),
        backgrounds: buttons.map(button => getComputedStyle(button).backgroundColor)
      };
    });
    assert.equal(toolbar.left, true);
    assert.equal(new Set(toolbar.tops).size, 1);
    assert.equal(new Set(toolbar.heights).size, 1);
    assert.equal(new Set(toolbar.borders).size, 1);
    assert.equal(new Set(toolbar.backgrounds).size, 1);
    assert.deepEqual(errors, []);
    console.log('Browser checks passed: selection, group drag, bulk deletion and undo/redo, text editing, export, toolbar layout and styles.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
