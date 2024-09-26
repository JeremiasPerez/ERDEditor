//import {util, dia, shapes, elementTools, linkTools } from '../node_modules/@joint/core/joint.mjs';

const dia = joint.dia
const shapes = joint.shapes
const util = joint.util
const elementTools = joint.elementTools
const linkTools = joint.linkTools


import {
  Entity,
  Attribute,
  Relation,
  AttributeButton,
  SettingsButton,
  LinkButton,
  RelationView,
  AttributeView,
  EntityView,
  AttributeLink,
  RelationshipLink,
  RelationshipLinkView,
  InheritanceLink,
  InheritanceLinkView,
  ConnectionPoint,
  ConnectionPointView
} from './Node.js';


const default_width = 1000
const default_height = 600

const namespace = {
  ...shapes,
  erd: {
    Attribute,
    Entity,
    Relation,
    RelationView,
    AttributeView,
    EntityView,
    AttributeLink,
    RelationshipLink,
    RelationshipLinkView,
    InheritanceLink,
    InheritanceLinkView,
    ConnectionPoint,
    ConnectionPointView
  }
};
const graph = new dia.Graph({linking: false}, { cellNamespace: namespace });
const paper = new dia.Paper({
  el: document.getElementById('paper'),
  model: graph,
  width: default_width,
  height: default_height,
  background: { color: 'white' },
  cellViewNamespace: namespace,
  guard: (e) => e.target.getAttribute('contenteditable') != null,
  interactive: {
    linkMove: false,
    labelMove: true
  }
});

// CREAR CONEXIÓN AUXILIAR (la que se ve al hacer drag&drop
const initAuxConnection = () => {
  const link = new shapes.standard.Link();
  link.set('id','connectionLink')
  link.prop('source', { x: 0, y: 0 });
  link.prop('target', { x: 0, y: 0 });
  link.attr('line/stroke', 'black');
  link.attr('line/strokeWidth', 1);
  link.attr('line/targetMarker', 'none');
  link.attr('line/display','none')
  link.addTo(graph);
}
initAuxConnection()

// CREACIÓN ELEMENTOS
let createEntity = (x, y) => {
  const en = new Entity()
  en.position(x-en.getBBox().width/2, y-en.getBBox().height/2);
  en.addTo(graph);
}
let createRelation = (x,y) => {
  const en = new Relation()
  en.position(x-en.getBBox().width/2, y-en.getBBox().height/2);
  en.addTo(graph);
}
let createAttribute = (x,y) => {
  const at1 = new Attribute()
  at1.position(x-at1.getBBox().width/2, y-at1.getBBox().height/2);
  at1.addTo(graph);
}


/*
paper.on('blank:pointerdown cell:pointerdown', () => {
  document.activeElement.blur();
});*/

/*paper.on('element:mouseenter', elementView => {
  elementView.showTools();
});
paper.on('element:mouseleave', elementView => {
  elementView.hideTools();
});*/
paper.on('cell:mouseleave', elementView => {
  //elementView.hideTools();
});
paper.on('cell:mouseenter', (elementView, evt) => {
  // se busca el elemento sobre el que está el cursor ya que elementView a veces falla
  let target = evt.target.closest('.joint-cell')
  let view = paper.findView(target)
  if(view != null) view.showTools()
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
  linkEl.model.attr('line/display',null)
})
paper.on('blank:mouseover', () => {
  paper.hideTools()
})

const validateConnection = (source, target) => {
  let validConnections = []
  let sourceType = source.model.get('type')
  let targetType = target.model.get('type')
  if(source.model.id == target.model.id) return null
  // valid connections: attribute - entity, attribute - relation, attribute - attribute, relation - entity
  let validCons = [
    ['erd.Entity','erd.Attribute'],['erd.Relation','erd.Attribute'],['erd.Attribute','erd.Attribute'],['erd.Relation','erd.Entity'],['erd.Entity','erd.Entity'],['erd.Entity','erd.ConnectionPoint']
  ]
  let con = validCons.find(((el) => (el[0] == sourceType && el[1] == targetType) || (el[1] == sourceType && el[0] == targetType)))
  // TODO: attribute can only be connected to one element
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
  let link
  if (con.includes('erd.Entity') && con.includes('erd.Relation')){
    let relation = source.model.get('type') == 'erd.Relation' ? source : target
    link = new RelationshipLink({
      source: source.model,
      target: target.model,
      showRoles: relation.model.prop('showRoles')
    })
    link.addCardinalityLabel()
    link.addRoleLabel()
  }
  else if(con.includes('erd.Entity') && con.includes('erd.ConnectionPoint')){
    let con = source.model.get('type') == 'erd.ConnectionPoint' ? source : target
    let ent = source.model.get('type') == 'erd.Entity' ? source : target
    link = new InheritanceLink({
      source: ent.model,
      target: con.model,
      linkType: 'connection2subclass'
    })
    if(con.model.prop('connectionType') == 'category'){
      link.prop('linkType','connection2superclass')
      let superConns = con.model.prop('superclassConnections')
      superConns.push(link.id)
      con.model.prop('superclassConnections',superConns)
    } else {
      let subConns = con.model.prop('subclassConnections')
      subConns.push(link.id)
      con.model.prop('subclassConnections',subConns)
    }
  }
  else if(con.includes('erd.Attribute')){
    link = new AttributeLink({
      source: source.model,
      target: target.model
    })
  } else { // entity to entity
    link = new InheritanceLink({
      source: source.model,
      target: target.model,
      linkType: 'entity2entity'
    })
  }
  link.addTo(paper.model)
}


paper.on('link:mouseenter', (linkView) => {
  //linkView.showTools();
});
paper.on('link:mouseleave', (linkView) => {
  //linkView.hideTools();
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

// VENTANA OPCIONES
document.querySelector('#settingsCloseButton').addEventListener('click', (e) => {
  document.querySelector('#settingsContainer').classList.remove('visible')
})

// DRAG & DROP ELEMENTOS
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

const addTools = (model) => {
  const types = ['erd.Relation','erd.Entity','erd.Attribute','erd.AttributeLink','erd.RelationshipLink','erd.ConnectionPoint']
  if(!types.includes(model.prop('type'))) return
  const elementView = model.findView(paper)
  let tools = []
  switch (model.prop('type')){
    case 'erd.Relation':
      tools = [new elementTools.Remove({scale: 1.5,y: '50%'}),
        new SettingsButton(),
        new LinkButton()]
      break
    case 'erd.Entity':
      tools = [new elementTools.Remove({scale: 1.5,y: '50%'}),
        new SettingsButton(),
        new LinkButton()]
      break
    case 'erd.Attribute':
      tools = [new elementTools.Remove({scale: 1.5,y: '50%'}),
        new SettingsButton(),
        new LinkButton()]
      break
    case 'erd.AttributeLink':
      tools = [new linkTools.Vertices(), new linkTools.Remove({scale: 1.5})]
      break
    case 'erd.RelationshipLink':
      tools = [new linkTools.Vertices(), new linkTools.Remove({scale: 1.5})]
      break
    case 'erd.ConnectionPoint':
      tools = [new elementTools.Remove({scale: 1.5, x: '100%', y: '0%'})]
      break
  }
  const toolsView = new dia.ToolsView({tools: tools})
  elementView.addTools(toolsView)
  elementView.hideTools()
}
graph.on('add', (model, collection, options) => {
  addTools(model)
})

// BOTONES
document.querySelector('#download').addEventListener('click',(e) => {
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graph.toJSON()))
  var a = document.createElement("a");
  a.setAttribute("href",dataStr)
  a.setAttribute("download", "diagram.json")
  document.body.appendChild(a);
  a.click()
  document.body.removeChild(a)
})
document.querySelector('#import').addEventListener('click',(e) => {
  let fileInput = document.querySelector('#file-input')
  fileInput.click()
})
document.querySelector('#file-input').addEventListener('change',(ev) => {
  const reader = new FileReader()
  reader.addEventListener("load", (e) => {
    graph.fromJSON(JSON.parse(reader.result))
    let cont = document.querySelector('#paperCont')
    let cells = graph.getCells()
    cells.forEach((c) => {
      if(c.prop('type') == 'erd.InheritanceLink') paper.findViewByModel(c).manageTools()
      else addTools(c)
    })

    // Redimensionar contenedor
    let dim = cells.reduce((m, c) => {
      let view = paper.findViewByModel(c)
      if(view == null) return m
      let bbox = view.getBBox()
      if(bbox.x + bbox.width > m.w) m.w = bbox.x + bbox.width
      if(bbox.y + bbox.height > m.h) m.h = bbox.y + bbox.height
      return m
    },{w: default_width, h: default_height})
    cont.style.width = (dim.w+20)+'px'
    cont.style.height = (dim.h+20)+'px'
  })
  reader.readAsText(ev.currentTarget.files[0]);
})
let preImageExport = () => {
  let cells = graph.getCells()
  cells.forEach((c) => {
    c.findView(paper).hideTools()
    let elementsWithName = ['erd.Entity','erd.Attribute','erd.Relation']
    if (!elementsWithName.includes(c.prop('type'))) return
    c.attr('elementName/display','none')
    c.attr('elementText/display',null)
    c.attr('elementText/text',c.prop('labelText'))
  })
}
let postImageExport = () => {
  let cells = graph.getCells()
  cells.forEach((c) => {
    let elementsWithName = ['erd.Entity','erd.Attribute','erd.Relation']
    if (!elementsWithName.includes(c.prop('type'))) return
    c.attr('elementName/display',null)
    c.attr('elementText/display','none')
  })
}
document.querySelector('#imageExport').addEventListener('click',async (e) => {
  preImageExport()
  htmlToImage.toPng(document.querySelector('#paper')).then((dataUrl) => {
    let a = document.createElement('a')
    a.setAttribute('href',dataUrl)
    a.setAttribute('download', 'diagram.png')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    postImageExport()
  })
    .catch((error) => {
      postImageExport()
    })
})


let paperCont = document.querySelector('#paperCont')

const resizeObserver = new ResizeObserver((entries) => {
  if(paperCont.dataset.init == null){
    paperCont.dataset.init = 'true'
    return
  }
  paper.setDimensions(paperCont.offsetWidth, paperCont.offsetHeight)
});
resizeObserver.observe(paperCont);

