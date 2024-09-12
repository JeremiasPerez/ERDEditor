import {util, dia, shapes, elementTools, linkTools } from '../node_modules/@joint/core/joint.mjs';
import {Entity, Attribute, Relation, AttributeButton, SettingsButton, LinkButton, toolsView} from './Node.js';

const namespace = {
  ...shapes,
  erd: {
    Attribute,
    Entity,
    Relation
  }
};
const graph = new dia.Graph({}, { cellNamespace: namespace });

const paper = new dia.Paper({
  el: document.getElementById('paper'),
  model: graph,
  width: 1000,
  height: 600,
  background: { color: 'white' },
  cellViewNamespace: namespace,
  guard: (e) => e.target.getAttribute('contenteditable') != null,
  snapLabels: true,
  interactive: {
    linkMove: false,
    labelMove: true
  }
});

paper.model.set('linking',false)


const link = new shapes.standard.Link();
link.set('id','connectionLink')
link.prop('source', { x: 0, y: 0 });
link.prop('target', { x: 0, y: 0 });
link.attr('line/stroke', 'black');
link.attr('line/strokeWidth', 1);
link.attr('line/targetMarker', 'none');
link.attr('line/display','none')
link.addTo(graph);


/*
paper.on('blank:pointerdown cell:pointerdown', () => {
  document.activeElement.blur();
});*/

paper.on('element:mouseenter', elementView => {
  elementView.showTools();
});
paper.on('element:mouseleave', elementView => {
  elementView.hideTools();
});

paper.on('cell:pointermove element:pointermove link:pointermove', (cellView, evt, x, y) => {
  if (!paper.model.get('linking')) return
  let link = document.querySelector('[model-id=connectionLink]')
  let linkEl = paper.findView(link)
  linkEl.model.prop('target', {x:x, y:y})
})

paper.on('blank:pointermove', (evt, x, y) => {
  if (!paper.model.get('linking')) return
  let link = document.querySelector('[model-id=connectionLink]')
  let linkEl = paper.findView(link)
  linkEl.model.prop('target', {x:x, y:y})
})

const validateConnection = (source, target) => {
  let validConnections = []
  let sourceType = source.model.get('type')
  let targetType = target.model.get('type')
  // valid connections: attribute - entity, attribute - relation, attribute - attribute, relation - entity
  let validCons = [
    ['erd.Entity','erd.Attribute'],['erd.Relation','erd.Attribute'],['erd.Attribute','erd.Attribute'],['erd.Relation','erd.Entity']
  ]
  let con = validCons.find(((el) => (el[0] == sourceType && el[1] == targetType) || (el[1] == sourceType && el[0] == targetType)))
  //if(con == null) return false

  // TODO: attribute can only be connected to one element
  console.log(graph.getConnectedLinks(source))

  return con
}

const manageConnection = (target) => {
  const sourceId = paper.model.get('linkSource')
  const source = paper.findView(document.querySelector('#'+sourceId))
  const con = validateConnection(source, target)
  if (con == null) return
  const link = new shapes.standard.Link({
    source: source.model,
    target: target.model,
    attrs: {
      line: {
        targetMarker: 'none'
      }
    }
  })
  if (con.includes('erd.Entity') && con.includes('erd.Relation')){

    const labelMarkup = util.svg/* xml */`
  <foreignObject @selector="linkLabel">
    <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="linkLabelContainer">
      <label @selector="linkLabelOpeningBrackets">(</label>
      <label @selector="linkLabelMinCard" class="linkCardInput" contenteditable="true" style="text-transform:uppercase" data-placeholder="X" autocomplete="off" autocorrect="off" spellcheck="false"></label>
      <label @selector="linkLabelOpeningComa">,</label>
      <label @selector="linkLabelMaxCard" class="linkCardInput" contenteditable="true" style="text-transform:uppercase" data-placeholder="X" autocomplete="off" autocorrect="off" spellcheck="false"></label>
      <label @selector="linkLabelClosingBrackets">)</label>
    </div>
  </foreignObject>`
    link.appendLabel({
      markup: labelMarkup,
      attrs: {
        linkLabel: {
          width: '5ch',
          height: 20
        }
      },
      position: {
        distance: 0.3,
        offset: 40
      }
    })
  }

  link.addTo(paper.model)

  var linkView = link.findView(paper);
  linkView.addTools(toolsView);
}


paper.on('link:mouseenter', (linkView) => {
  linkView.showTools();
});

paper.on('link:mouseleave', (linkView) => {
  linkView.hideTools();
});

paper.on('blank:pointerup', (evt, x, y) => {
  if (!paper.model.get('linking')) return
  let el = paper.findViewsFromPoint({x: x, y: y})
  if (el.length > 0) manageConnection(el[0])
  paper.model.set('linking',false)
  let link = document.querySelector('[model-id=connectionLink]')
  let linkEl = paper.findView(link)
  linkEl.model.attr('line/display','none')
})

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
document.querySelector('#createRelation').addEventListener('click',(e) => {
  const en = new Relation()
  en.position(500, 150);
  en.addTo(graph);
  const elementView = en.findView(paper)
  const removeButton = new elementTools.Remove({
    scale: 1.5,
    y: '50%'
  });
  const attributeButton = new AttributeButton();
  const settingsButton = new SettingsButton();
  const linkButton = new LinkButton();
  const toolsView = new dia.ToolsView({
    tools: [
      removeButton,
      attributeButton,
      settingsButton,
      linkButton
    ]
  });
  elementView.addTools(toolsView);
  elementView.hideTools();
})

document.querySelector('#exportAsJson').addEventListener('click',(e) => {
  console.log(graph.toJSON())
})

document.querySelector('#exportAsPng').addEventListener('click',async (e) => {
  /*const dataHeader = 'data:image/svg+xml;charset=utf-8'
  const $svg = document.querySelector('#paper svg')
  const $holder = document.getElementById('img-container')

  const destroyChildren = $element => {
    while ($element.firstChild) {
      const $lastChild = $element.lastChild ?? false
      if ($lastChild) $element.removeChild($lastChild)
    }
  }

  const loadImage = async url => {
    const $img = document.createElement('img')
    $img.src = url
    return new Promise((resolve, reject) => {
      $img.onload = () => resolve($img)
      $img.onerror = reject
    })
  }

  const serializeAsXML = $e => (new XMLSerializer()).serializeToString($e)

  const encodeAsUTF8 = s => `${dataHeader},${encodeURIComponent(s)}`
  const encodeAsB64 = s => `${dataHeader};base64,${btoa(s)}`

  const convertSVGtoImg = async e => {
    const format = 'png'
    destroyChildren($holder)

    const svgData = encodeAsUTF8(serializeAsXML($svg))

    const img = await loadImage(svgData)

    const $canvas = document.createElement('canvas')
    $canvas.width = $svg.clientWidth
    $canvas.height = $svg.clientHeight
    $canvas.getContext('2d').drawImage(img, 0, 0, $svg.clientWidth, $svg.clientHeight)

    const dataURL = await $canvas.toDataURL(`image/${format}`, 1.0)
    console.log(dataURL)

    const $img = document.createElement('img')
    $img.src = dataURL
    $holder.appendChild($img)
  }

  convertSVGtoImg()*/

  // todo -> antes de exportar, convertir los foreignObjects a texts
  /*await svg2pngWasm.initialize(fetch('https://unpkg.com/svg2png-wasm/svg2png_wasm_bg.wasm'))
  //const font = await fetch('./Roboto.ttf').then((res) => res.arrayBuffer());
  /** @type {Uint8Array} */
  /*const png = await svg2pngWasm.svg2png(
    '<svg viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">'+document.querySelector('#paper svg').innerHTML+'</svg>'
  );
  document.getElementById('img-container').src = URL.createObjectURL(
    new Blob([png], { type: 'image/png' }),
  );*/
})


document.addEventListener('input',(e) => {
  if ('placeholder' in e.target.dataset && e.target.innerText.trim() == ''){
    while (e.target.firstChild) e.target.removeChild(e.target.firstChild)
    let containerEl = paper.findView(e.target.closest('.joint-element'))
    containerEl.model.prop('size/width',containerEl.model.get('initialSize').width)
  }
  else if (e.target.classList.contains('elementNameInput')){
    let containerEl = paper.findView(e.target.closest('.joint-element'))
    containerEl.model.attr('label',e.target.innerText.trim())
    containerEl.model.prop('size/width',e.target.offsetWidth)
  }
  else if (e.target.classList.contains('linkCardInput')){
    let content = e.target.innerText.trim()
    const card = Number(content)
    if(content != 'N' && content != 'n' && (Number.isNaN(card) || card < 0 || !Number.isInteger(card))) e.target.innerText = ''
  }
})

document.querySelector('#settingsCloseButton').addEventListener('click', (e) => {
  document.querySelector('#settingsContainer').classList.remove('visible')
})
