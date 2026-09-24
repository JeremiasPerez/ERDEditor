// Store complete diagram states so compound edits (including removed links) are atomic.
export class History {
  constructor(read, restore, changed = () => {}) {
    this.read = read;
    this.restore = restore;
    this.changed = changed;
    this.undoStack = [];
    this.redoStack = [];
    this.current = read();
    this.restoring = false;
  }

  commit() {
    if (this.restoring) return;
    const next = this.read();
    if (next === this.current) return;
    this.undoStack.push(this.current);
    if (this.undoStack.length > 100) this.undoStack.shift();
    this.current = next;
    this.redoStack.length = 0;
    this.changed();
  }

  move(from, to) {
    this.commit();
    if (!from.length) return;
    const next = from[from.length - 1];
    this.restoring = true;
    try {
      this.restore(next);
      to.push(this.current);
      from.pop();
      this.current = this.read();
    } finally {
      this.restoring = false;
      this.changed();
    }
  }

  undo() { this.move(this.undoStack, this.redoStack); }
  redo() { this.move(this.redoStack, this.undoStack); }
}
