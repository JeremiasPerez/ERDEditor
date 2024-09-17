import {util, dia, shapes, elementTools, linkTools } from '../node_modules/@joint/core/joint.mjs';
import {Entity, Attribute, Relation, AttributeButton, SettingsButton, LinkButton} from './Node.js';



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

paper.on('cell:mouseleave', elementView => {
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
  console.log('moving')
  let link = document.querySelector('[model-id=connectionLink]')
  let linkEl = paper.findView(link)
  linkEl.model.prop('target', {x:x, y:y})
  linkEl.model.attr('line/display',null)
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

const manageEntityRelationshipLink = (link, source, target) => {

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
        width: '6ch',
        height: 30,
        cursor: 'default'
      }
    },
    position: {
      distance: 0.3,
      offset: 40
    }
  })

  const roleLabelMarkup = util.svg/* xml */`
  <foreignObject @selector="roleLabel">
    <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="linkRoleLabelContainer">
      <div @selector="linkRoleLabel" class="linkRoleInput" contenteditable="true" style="text-transform:lowercase" data-placeholder="rol" autocomplete="off" autocorrect="off" spellcheck="false"></div>
    </div>
  </foreignObject>`
  link.appendLabel({
    markup: roleLabelMarkup,
    initialSize: {
      width: '5ch',
      height: 30
    },
    attrs: {
      roleLabel: {
        width: '5ch',
        height: 30,
        cursor: 'default'
      }
    },
    position: {
      distance: 0.6,
      offset: 30,
      args: {
        keepGradient: true,
        ensureLegibility: true
      }
    }
  })
  let sourceType = source.model.get('type')
  let relationship = sourceType == 'erd.Relation' ? source : target
  if (!relationship.model.attr('showRoles')){
    let labels = link.labels()
    link.labels(labels.map((l) => {
      if (l.attrs.roleLabel == null) return l
      l.attrs.roleLabel.display = 'none'
      return l
    }))
  }
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
    manageEntityRelationshipLink(link, source, target)
  }

  link.addTo(paper.model)

  // Add link tools
  let linkView = link.findView(paper);
  const verticesTool = new linkTools.Vertices();
  const removeButton = new linkTools.Remove();
  const toolsView = new dia.ToolsView({
    tools: [verticesTool, removeButton]
  })
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

let createEntity = (x, y) => {
  const en = new Entity()
  en.position(x-en.getBBox().width/2, y-en.getBBox().height/2);
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
      //attributeButton,
      settingsButton
    ]
  });
  elementView.addTools(toolsView);
  elementView.hideTools();
}
let createRelation = (x,y) => {
  const en = new Relation()
  en.position(x-en.getBBox().width/2, y-en.getBBox().height/2);
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
      //attributeButton,
      settingsButton,
      linkButton
    ]
  });
  elementView.addTools(toolsView);
  elementView.hideTools();
}

let createAttribute = (x,y) => {
  const at1 = new Attribute()
  at1.position(x-at1.getBBox().width/2, y-at1.getBBox().height/2);
  at1.addTo(graph);

  const elementView = at1.findView(paper)
  const removeButton = new elementTools.Remove({
    x: 0,
    y: "50%",
    scale: 1.5
  });
  const settingsButton = new SettingsButton()
  const linkButton = new LinkButton()
  const toolsView = new dia.ToolsView({
    tools: [
      removeButton,
      settingsButton,
      linkButton
    ]
  })
  elementView.addTools(toolsView)
  elementView.hideTools()
}

document.querySelector('#download').addEventListener('click',(e) => {
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graph.toJSON()))
  var a = document.createElement("a");
  a.click();
  a.setAttribute("href",dataStr)
  a.setAttribute("download", "diagram.json")
  document.body.appendChild(a);
  a.click()
  document.removeChild(a)
})

document.querySelector('#import').addEventListener('click',(e) => {
  let fileInput = document.querySelector('#file-input')
  fileInput.click()
})

document.querySelector('#file-input').addEventListener('change',(ev) => {
  const reader = new FileReader()
  //reader.onload = (e) => console.log('file contents:', e.target.result)

  reader.addEventListener("load", (e) => {
    graph.fromJSON(JSON.parse(reader.result))
  })

  reader.readAsText(ev.currentTarget.files[0]);

})


/*document.querySelector('#exportAsPng').addEventListener('click',async (e) => {
  const dataHeader = 'data:image/svg+xml;charset=utf-8'
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
  );
})*/


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
  else if (e.target.classList.contains('linkRoleInput')){
    // todo - resize label box
    let label = e.target.closest('.label')
    let link = paper.findView(e.target.closest('.joint-link'))
    console.log(link)
    let labels = link.model.labels()
    let rolLabelPos = labels.findIndex((l) => l.id == label.id)
    link.model.label(rolLabelPos, {attrs: {roleLabel: {width: e.target.offsetWidth}}})
  }
})

document.querySelector('#settingsCloseButton').addEventListener('click', (e) => {
  document.querySelector('#settingsContainer').classList.remove('visible')
})

let dragStart = (ev, type) => {
  ev.dataTransfer.setData('elementType',type)
}

document.querySelectorAll('.toolbarElement.diagramElement').forEach((el) => {
  el.addEventListener('dragstart',(e) => {
    dragStart(e, el.dataset.type)
  })
})

document.querySelector('#paper').addEventListener('dragover',(e) => {
  e.preventDefault()
})

document.querySelector('#paper').addEventListener('drop', (e) => {
  let type = e.dataTransfer.getData('elementType')
  let p = paper.clientToLocalPoint({ x: e.clientX, y: e.clientY });
  switch (type){
    case 'entity':
      createEntity(p.x,p.y)
      break
    case 'relationship':
      createRelation(p.x,p.y)
      break
    case 'attribute':
      createAttribute(p.x,p.y)
      break
  }
  e.preventDefault()
})
