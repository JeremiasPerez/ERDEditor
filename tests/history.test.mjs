import { test } from 'node:test';
import assert from 'node:assert/strict';
import { History } from '../js/History.mjs';

function editor() {
  let state = { cells: [] };
  const history = new History(() => JSON.stringify(state), value => { state = JSON.parse(value); });
  return { history, get state() { return state; }, set state(value) { state = value; } };
}

test('undo restores deleted elements and their connections; redo reapplies removal', () => {
  const e = editor();
  const cells = [{ id: 'a', label: 'Entity' }, { id: 'b' }, { id: 'link', source: 'a', target: 'b' }];
  e.state = { cells };
  e.history.commit();
  e.state = { cells: [cells[1]] };
  e.history.undo(); // Also commits an edit that has not reached its timer yet.
  assert.deepEqual(e.state.cells, cells);
  e.history.redo();
  assert.deepEqual(e.state.cells, [cells[1]]);
});

test('one commit groups a complete drag and undo/redo preserve positions', () => {
  const e = editor();
  e.state = { cells: [{ id: 'a', x: 10 }, { id: 'b', x: 40 }] };
  e.history.commit();
  for (let i = 0; i < 20; i++) e.state.cells.forEach(cell => cell.x++);
  e.history.commit();
  e.history.undo();
  assert.deepEqual(e.state.cells.map(cell => cell.x), [10, 40]);
  e.history.redo();
  assert.deepEqual(e.state.cells.map(cell => cell.x), [30, 60]);
});

test('no-op changes retain redo, but a new edit invalidates it', () => {
  const e = editor();
  e.state = { cells: [{ id: 'a' }] };
  e.history.commit();
  e.history.undo();
  e.history.commit();
  assert.equal(e.history.redoStack.length, 1);
  e.state = { cells: [{ id: 'b' }] };
  e.history.commit();
  assert.equal(e.history.redoStack.length, 0);
  e.history.redo();
  assert.equal(e.state.cells[0].id, 'b');
});

test('restoration changes do not add history entries and history is bounded', () => {
  let value = '0';
  const h = new History(() => value, next => { value = next; h.commit(); });
  for (let i = 1; i <= 110; i++) { value = String(i); h.commit(); }
  assert.equal(h.undoStack.length, 100);
  h.undo();
  assert.equal(value, '109');
  assert.equal(h.undoStack.length, 99);
  assert.equal(h.redoStack.length, 1);
});
