import { dia, shapes, elementTools } from '../node_modules/@joint/core/joint.mjs';
import {Entity, Attribute, AttributeButton} from './Node.js';



const namespace = {
  ...shapes,
  erd: {
    Attribute,
    Entity
  }
};
const graph = new dia.Graph({}, { cellNamespace: namespace });

const paper = new dia.Paper({
  el: document.getElementById('paper'),
  model: graph,
  width: 1000,
  height: 600,
  background: { color: '#F5F5F5' },
  cellViewNamespace: namespace,
  guard: (e) => e.target.getAttribute('contenteditable') != null
});

paper.on('blank:pointerdown cell:pointerdown', () => {
  document.activeElement.blur();
});
paper.on('element:mouseenter', elementView => {
  elementView.showTools();
});
paper.on('element:mouseleave', elementView => {
  elementView.hideTools();
});

document.querySelector('#createEntity').addEventListener('click',(e) => {
  const en = new Entity()
  en.position(500, 150);
  en.addTo(graph);
  const elementView = en.findView(paper)
  const removeButton = new elementTools.Remove();
  const attributeButton = new AttributeButton();
  const toolsView = new dia.ToolsView({
    tools: [
      removeButton,
      attributeButton
    ]
  });
  elementView.addTools(toolsView);
  elementView.hideTools();
})

document.addEventListener('input',(e) => {
  if ('placeholder' in e.target.dataset && e.target.innerText.trim() == '') while (e.target.firstChild) e.target.removeChild(e.target.firstChild);
})


/*
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
*/
