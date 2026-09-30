import { History } from './History.mjs';

export function setupEditorActions(graph, paper, addTools, initAuxConnection) {
  const selected = new Set();
  const deleteButton = document.querySelector('#deleteSelection');
  const paperContainer = document.querySelector('#paperCont');
  const undoButton = document.querySelector('#undo');
  const redoButton = document.querySelector('#redo');
  let dragging = null;
  let pointerDown = false;
  let marquee = null;
  let timer;
  const selectionBox = document.createElement('div');
  selectionBox.className = 'editor-selection-box';
  selectionBox.hidden = true;
  selectionBox.setAttribute('aria-hidden', 'true');
  document.body.appendChild(selectionBox);
  const stopMarquee = () => {
    marquee = null;
    selectionBox.hidden = true;
    document.body.classList.remove('editor-selecting');
    positionDeleteButton();
  };
  const positionDeleteButton = () => {
    const cells = [...selected].map(id => graph.getCell(id)).filter(Boolean);
    deleteButton.hidden = cells.length < 2 || !!marquee;
    if (deleteButton.hidden) return;
    const boxes = cells.map(cell => cell.getBBox());
    const corner = paper.localToClientPoint({
      x: Math.max(...boxes.map(box => box.x + box.width)),
      y: Math.min(...boxes.map(box => box.y))
    });
    const bounds = paperContainer.getBoundingClientRect();
    // Keep the action inside the canvas, including selections at its edges.
    deleteButton.style.left = `${Math.max(0, Math.min(paperContainer.clientWidth - 24,
      corner.x - bounds.left - paperContainer.clientLeft + paperContainer.scrollLeft + 8))}px`;
    deleteButton.style.top = `${Math.max(0, Math.min(paperContainer.clientHeight - 24,
      corner.y - bounds.top - paperContainer.clientTop + paperContainer.scrollTop - 28))}px`;
  };
  const editable = target => target.closest('input, textarea, select, [contenteditable="true"]');
  const paintSelection = () => {
    graph.getElements().forEach(cell => {
      cell.findView(paper)?.el.classList.toggle('editor-selected', selected.size > 1 && selected.has(cell.id));
    });
    positionDeleteButton();
  };
  const clearSelection = () => {
    selected.clear();
    paintSelection();
  };

  paper.on('element:pointerdown', (view, event) => {
    if (graph.get('linking') || editable(event.target)) return;
    const id = view.model.id;
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
    } else if (!selected.has(id)) {
      selected.clear();
      selected.add(id);
    }
    paintSelection();
    dragging = selected.has(id) ? id : null;
  });
  paper.on('blank:pointerdown', (event, x, y) => {
    if (graph.get('linking') || (event.button != null && event.button !== 0)) return;
    const additive = event.shiftKey || event.ctrlKey || event.metaKey;
    if (!additive) clearSelection();
    marquee = { start: { x, y }, initial: new Set(selected) };
    positionDeleteButton();
    dragging = null;
    document.body.classList.add('editor-selecting');
    document.activeElement?.blur();
    event.preventDefault();
  });
  document.addEventListener('pointermove', event => {
    if (!marquee) return;
    const startClient = paper.localToClientPoint(marquee.start);
    const width = Math.abs(event.clientX - startClient.x);
    const height = Math.abs(event.clientY - startClient.y);
    // A simple click on the background only clears selection.
    if (selectionBox.hidden && Math.max(width, height) < 3) return;
    selectionBox.hidden = false;
    Object.assign(selectionBox.style, {
      left: `${Math.min(startClient.x, event.clientX)}px`,
      top: `${Math.min(startClient.y, event.clientY)}px`,
      width: `${width}px`,
      height: `${height}px`
    });
    const end = paper.clientToLocalPoint({ x: event.clientX, y: event.clientY });
    const left = Math.min(marquee.start.x, end.x);
    const top = Math.min(marquee.start.y, end.y);
    const right = Math.max(marquee.start.x, end.x);
    const bottom = Math.max(marquee.start.y, end.y);
    selected.clear();
    marquee.initial.forEach(id => selected.add(id));
    graph.getElements().forEach(cell => {
      const box = cell.getBBox();
      if (box.x <= right && box.x + box.width >= left &&
          box.y <= bottom && box.y + box.height >= top) selected.add(cell.id);
    });
    paintSelection();
  });
  graph.on('change:position', (cell, position, options) => {
    if (cell.id !== dragging || options?.selectionMove) return;
    const previous = cell.previous('position');
    const dx = position.x - previous.x;
    const dy = position.y - previous.y;
    selected.forEach(id => {
      if (id !== cell.id) graph.getCell(id)?.translate(dx, dy, { selectionMove: true });
    });
    // Keep manually placed bends aligned when both ends move together.
    graph.getLinks().forEach(link => {
      if (selected.has(link.source().id) && selected.has(link.target().id)) {
        link.vertices(link.vertices().map(point => ({ x: point.x + dx, y: point.y + dy })));
      }
    });
  });
  graph.on('change:position change:size', positionDeleteButton);
  paper.on('scale translate resize', positionDeleteButton);
  graph.on('remove', cell => {
    selected.delete(cell.id);
    paintSelection();
  });
  graph.on('reset', () => {
    stopMarquee();
    clearSelection();
  });

  const read = () => JSON.stringify({ cells: graph.toJSON().cells
    .filter(cell => cell.id !== 'connectionLink')
    .map(cell => {
      // Export-only presentation changes must never create undo entries.
      if (cell.type === 'erd.Entity' || cell.type === 'erd.Relation') {
        if (cell.attrs?.elementName) delete cell.attrs.elementName.display;
        if (cell.attrs?.elementText) {
          delete cell.attrs.elementText.text;
          delete cell.attrs.elementText.display;
        }
        for (const selector of ['elementName', 'elementText']) {
          if (cell.attrs?.[selector] && !Object.keys(cell.attrs[selector]).length) delete cell.attrs[selector];
        }
      }
      return cell;
    }) });
  const history = new History(read, state => {
    dragging = null;
    document.activeElement?.blur();
    document.querySelector('#settingsContainer').classList.remove('visible');
    graph.fromJSON({ ...JSON.parse(state), linking: false });
    graph.unset('linkSource');
    initAuxConnection();
    graph.getCells().forEach(cell => {
      if (cell.get('type') === 'erd.InheritanceLink') cell.findView(paper)?.manageTools();
      else addTools(cell);
    });
  }, () => {
    undoButton.disabled = !history.undoStack.length;
    redoButton.disabled = !history.redoStack.length;
  });
  const commit = () => {
    clearTimeout(timer);
    if (!pointerDown) history.commit();
  };
  graph.on('add remove change reset', () => {
    if (history.restoring || pointerDown) return;
    clearTimeout(timer);
    // Coalesce model updates from one action, and successive keystrokes.
    timer = setTimeout(commit, editable(document.activeElement) ? 500 : 0);
  });
  document.addEventListener('pointerdown', event => {
    commit();
    pointerDown = !!event.target.closest('#paper');
  }, true);
  const endGesture = () => {
    stopMarquee();
    pointerDown = false;
    dragging = null;
    clearTimeout(timer);
    timer = setTimeout(commit, 0);
  };
  document.addEventListener('pointerup', endGesture);
  document.addEventListener('pointercancel', endGesture);
  window.addEventListener('blur', endGesture);
  document.addEventListener('focusout', () => {
    clearTimeout(timer);
    timer = setTimeout(commit, 0);
  });
  undoButton.addEventListener('click', () => history.undo());
  redoButton.addEventListener('click', () => history.redo());
  deleteButton.addEventListener('click', () => {
    history.commit();
    const cells = [...selected].map(id => graph.getCell(id)).filter(Boolean);
    document.querySelector('#settingsContainer').classList.remove('visible');
    graph.removeCells(cells);
    clearSelection();
    history.commit();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      stopMarquee();
      clearSelection();
    }
    // Let text fields retain the browser's native text undo/redo behavior.
    if (editable(event.target) || pointerDown || event.altKey || !(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key !== 'z' && key !== 'y') return;
    event.preventDefault();
    if (key === 'y' || event.shiftKey) history.redo();
    else history.undo();
  });
}
