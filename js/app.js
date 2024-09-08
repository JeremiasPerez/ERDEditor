import { dia, shapes, elementTools } from '../node_modules/@joint/core/joint.mjs';
import {Entity, Attribute, AttributeButton, SettingsButton} from './Node.js';



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
  const removeButton = new elementTools.Remove({
    scale: 1.5,
    y: '50%'
  });
  const attributeButton = new AttributeButton();
  const settingsButton = new SettingsButton();
  const toolsView = new dia.ToolsView({
    tools: [
      removeButton,
      attributeButton,
      settingsButton
    ]
  });
  elementView.addTools(toolsView);
  elementView.hideTools();
})

document.addEventListener('input',(e) => {
  if ('placeholder' in e.target.dataset && e.target.innerText.trim() == '') while (e.target.firstChild) e.target.removeChild(e.target.firstChild);
  else if (e.target.classList.contains('elementNameInput')){
    paper.findView(e.target.closest('.joint-element')).model.attr('label',e.target.innerText.trim())
    // todo - adjust width
  }
})

document.querySelector('#settingsCloseButton').addEventListener('click', (e) => {
  document.querySelector('#settingsContainer').classList.remove('visible')
})
