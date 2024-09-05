import { dia, shapes } from '../node_modules/@joint/core/joint.mjs';

import {Node, ButtonNode, ButtonNodeView, Entity, WeakEntity, Attribute, MultiAttribute} from './Node.js';

const namespace = shapes;

const graph = new dia.Graph({}, { cellNamespace: namespace });

const paper = new dia.Paper({
  el: document.getElementById('paper'),
  model: graph,
  width: 1000,
  height: 600,
  background: { color: '#F5F5F5' },
  cellViewNamespace: namespace
});



const ent1 = new Entity()
ent1.position(250, 125);
ent1.attr({
  label: {
    text: 'PERSONA'
  }
});
ent1.addTo(graph);


const went1 = new WeakEntity()
went1.position(50, 125);
went1.attr({
  label: {
    text: 'PERSONA'
  }
});
went1.addTo(graph);

const at1 = new Attribute()
at1.position(500, 125);
at1.attr({
  label: {
    text: 'PERSONA'
  }
});
at1.addTo(graph);

const mat1 = new MultiAttribute()
mat1.position(500, 225);
mat1.attr({
  label: {
    text: 'PERSONA'
  }
});
mat1.addTo(graph);
