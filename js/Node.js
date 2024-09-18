import { dia, shapes, util, elementTools, linkTools, mvc } from '../node_modules/@joint/core/joint.mjs';


const showSettings = (element) => {
  let container = document.querySelector('#settingsContainer')
  container.classList.add('visible')
  const settingsContent = document.querySelector('#settingsContent')
  settingsContent.innerHTML = ''
  let settingsCont
  let elementPos = element.model.getBBox().topRight();
  let absPos = element.paper.localToClientPoint(elementPos);
  switch (element.model.attributes['type']){
    case 'erd.Entity':
      settingsCont = document.querySelector('#entitySettingsContent').content.cloneNode(true);
      settingsCont.querySelector("#isWeakInput").checked = element.model.attr('isWeak')
      settingsCont.querySelector("#isWeakInput").addEventListener('change', (e) => {element.model.attr('isWeak',e.currentTarget.checked)})
      break
    case 'erd.Attribute':
      settingsCont = document.querySelector('#attributeSettingsContent').content.cloneNode(true);
      settingsCont.querySelector("#isKeyInput").checked = element.model.attr('isKey')
      settingsCont.querySelector("#isKeyInput").addEventListener('change', (e) => {element.model.attr('isKey',e.currentTarget.checked)})
      settingsCont.querySelector("#isMultivaluatedInput").checked = element.model.attr('isMultivaluated')
      settingsCont.querySelector("#isMultivaluatedInput").addEventListener('change', (e) => {element.model.attr('isMultivaluated',e.currentTarget.checked)})
      settingsCont.querySelector("#isDerivatedInput").checked = element.model.attr('isDerivated')
      settingsCont.querySelector("#isDerivatedInput").addEventListener('change', (e) => {element.model.attr('isDerivated',e.currentTarget.checked)})
      break
    case 'erd.Relation':
      settingsCont = document.querySelector('#relationSettingsContent').content.cloneNode(true);
      settingsCont.querySelector("#isIndentifierInput").checked = element.model.attr('isIdentifier')
      settingsCont.querySelector("#isIndentifierInput").addEventListener('change', (e) => {element.model.attr('isIdentifier',e.currentTarget.checked)})
      settingsCont.querySelector('#showRoleInput').checked = element.model.attr('showRoles')
      settingsCont.querySelector('#showRoleInput').addEventListener('change', (e) => {element.model.setShowRoles(e.currentTarget.checked)})
      break
  }
  settingsContent.appendChild(settingsCont);
  container.style.left = (absPos.x+30)+'px'
  container.style.top = (absPos.y-((container.offsetHeight-element.model.getBBox().height)/2))+'px'
}

export const AttributeButton = elementTools.Button.extend({
  name: 'attribute-button',
  options: {
    markup: [
      {
        tagName: 'ellipse',
        selector: 'inner-ellipse',
        attributes: {
          cursor: 'pointer',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '1',
          rx: '10',
          ry: '5'
        }
      },
      {tagName: 'text',
        selector: 'add-button',
        attributes: {
          cursor: 'pointer',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'black',
          fontSize: 6,
          strokeWidth: 1,
          stroke: 'black',
          x: 0,
          y: 2
        },
        textContent: '➕',
      }],
    x: '50%',
    y: '100%',
    scale: 1.5,
    rotate: true,
    action: function(evt) {
      const at1 = new Attribute()
      at1.position(500, 125);
      at1.addTo(this.paper.model);
      const link = new shapes.standard.Link({
        source: this.model,
        target: at1,
        attrs: {
          line: {
            targetMarker: 'none'
          }
        }
      });
      link.addTo(this.paper.model);

      let linkView = link.findView(this.paper);


      const verticesTool = new linkTools.Vertices();
      const remButton = new linkTools.Remove();
      const linkToolsView = new dia.ToolsView({
        tools: [verticesTool, remButton]
      })
      linkView.addTools(linkToolsView);


      const elementView = at1.findView(this.paper)
      const removeButton = new elementTools.Remove({
        x: 0,
        y: "50%",
        scale: 1.5
      });
      const settingsButton = new SettingsButton();
      const attributeButton = new AttributeButton();
      const linkButton = new LinkButton()
      const toolsView = new dia.ToolsView({
        tools: [
          removeButton,
          settingsButton,
          attributeButton,
          linkButton
        ]
      });
      elementView.addTools(toolsView);
      elementView.hideTools();
    }
  }
});
export const SettingsButton = elementTools.Button.extend({
  name: 'settings-button',
  options: {
    markup: [
      {tagName: 'text',
        selector: 'settings-emoji',
        attributes: {
          cursor: 'pointer',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'black',
          fontSize: 12,
          y: 5
        },
        textContent: '⚙️',
      }],
    x: '100%',
    y: '50%',
    scale: 1.5,
    rotate: true,
    action: function(evt) {
      showSettings(this)
    }
  }
});
export const LinkButton = elementTools.Button.extend({
  name: 'link-button',
  options: {
    markup: [
      {
        tagName: 'circle',
        selector: 'outer-circle',
        attributes: {
          cursor: 'pointer',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '1',
          r: '8'
        }
      },
      {tagName: 'text',
        selector: 'link-button',
        attributes: {
          cursor: 'pointer',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'black',
          fontSize: 8,
          strokeWidth: 1,
          stroke: 'black',
          x: 0,
          y: 3
        },
        textContent: '🠀',
      }],
    x: '50%',
    y: '0%',
    scale: 1.5,
    rotate: true,
    action: function(evt, elementView, buttonView) {
      elementView.hideTools();
      let bbox = this.model.getBBox()
      this.paper.model.set('linking',true)
      this.paper.model.set('linkSource',this.el.id)
      let link = document.querySelector('[model-id=connectionLink]')
      let linkEl = this.paper.findView(link)
      linkEl.model.prop('source',this.model.getAbsolutePointFromRelative(bbox.width/2,bbox.height/2))
      // Estas dos líneas no van aquí porque Jointjs no funciona bien en este caso
      //linkEl.model.prop('target',this.model.getAbsolutePointFromRelative(bbox.width/2,0))
      //linkEl.model.attr('line/display',null)
      this.paper.el.dispatchEvent(new MouseEvent("mousedown"))
    }
  }
});

// ENTITIES
const entityMarkup = util.svg/* xml */`
    <rect @selector="entityBody"/>
    <rect @selector="innerEntityBody"/>
    <foreignObject @selector="elementName">
      <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="elementNameContainer">
        <div @selector="entityName" class="elementNameInput" contenteditable="true" style="text-transform:uppercase" data-placeholder="ENTIDAD" autocomplete="off" autocorrect="off" spellcheck="false"></div>
      </div>
    </foreignObject>
`
export class Entity extends dia.Element {
  preinitialize() {
    this.markup = entityMarkup;
  }

  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'erd.Entity',
      size: {
        width: 150,
        height: 50
      },
      initialSize: {
        width: 150,
        height: 50,
      },
      attrs: {
        root: {
          cursor: 'move'
        },
        entityBody: {
          width: 'calc(w)',
          height: 'calc(h)',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '2'
        },
        innerEntityBody: {
          width: 'calc(w - 10)',
          height: 'calc(h - 10)',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '2',
          x: 5,
          y: 5,
          align: 'middle',
          verticalAlign: 'middle',
          display: 'none'
        },
        elementName: {
          width: 'calc(w - 10)',
          height: 'calc(h - 10)',
          x: 5,
          y: 5
        },
        isWeak: false,
        labelText: ''
      }
    }
  }
}
export class EntityView extends dia.ElementView {
  render() {
    dia.ElementView.prototype.render.apply(this, arguments);
    // label
    this.el.querySelector('.elementNameInput').innerText = this.model.attr('labelText')
    // is weak
    if(this.model.attr('isWeak')) this.model.attr('innerEntityBody/display',null)
    else this.model.attr('innerEntityBody/display', 'none')

    return this
  }
  initialize() {
    dia.ElementView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change', (model, options) => {
      if(options.propertyPath == 'size/width' || options.propertyPath == 'attrs/labelText') return // avoid re-render as it would lose focus
      this.render()
    })
  }
  manageInput(e) {
    this.model.attr('labelText',e.currentTarget.innerText.trim())
    if(e.currentTarget.innerText.trim() == ''){
      while (e.currentTarget.firstChild) e.currentTarget.removeChild(e.currentTarget.firstChild)
      this.model.prop('size/width',this.model.get('initialSize').width)
    } else{
      this.model.prop('size/width',e.currentTarget.offsetWidth)
    }
  }
  events() {
    return {
      'input .elementNameInput': (e) => {this.manageInput(e)}
    }
  }
}

// ATTRIBUTES
const attributteMarkup = util.svg/* xml */`
    <ellipse @selector="attributeBody"/>
    <ellipse @selector="innerAttributeBody"/>
    <foreignObject @selector="elementName">
      <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="elementNameContainer">
        <div @selector="attributeName" class="elementNameInput" contenteditable="true" style="text-transform:capitalize" data-placeholder="atributo" autocomplete="off" autocorrect="off" spellcheck="false"></div>
      </div>
    </foreignObject>`
export class Attribute extends dia.Element {
  preinitialize() {
    this.markup = attributteMarkup
  }
  initialize() {
    dia.Element.prototype.initialize.apply(this, arguments)
    let label = this.attr('labelText')
    if(label != null && typeof label === 'object'){
      this.attr('labelText',Object.values(label).join(''))
    }
  }

  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'erd.Attribute',
      size: {
        width: 150,
        height: 50
      },
      initialSize: {
        width: 150,
        height: 50,
      },
      attrs: {
        root: {
          cursor: 'move'
        },
        attributeBody: {
          width: 'calc(w)',
          height: 'calc(h)',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '2',
          cx: 'calc(w/2)',
          cy: 'calc(h/2)',
          rx: 'calc(w/2)',
          ry: 'calc(h/2)'
        },
        innerAttributeBody: {
          width: 'calc(w-10)',
          height: 'calc(h-10)',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '2',
          cx: 'calc(w/2)',
          cy: 'calc(h/2)',
          rx: 'calc(w/2-5)',
          ry: 'calc(h/2-5)',
          display: 'none'
        },
        elementName: {
          width: 'calc(w - 10)',
          height: 'calc(h - 10)',
          x: 5,
          y: 5
        },
        attributeName: {
          style:{
            textDecorationThickness: '2px'
          }
        },
        isMultivaluated: false,
        isDerivated: false,
        isKey: false,
        isPartialKey: false,
        labelText: ''
      }
    }
  }
}
export class AttributeView extends dia.ElementView {
  render() {
    dia.ElementView.prototype.render.apply(this, arguments)
    // label
    this.el.querySelector('.elementNameInput').innerText = this.model.attr('labelText')
    // is multivaluated attribute
    if(this.model.attr('isMultivaluated')) this.model.attr('innerAttributeBody/display',null)
    else this.model.attr('innerAttributeBody/display', 'none')
    // is derivated
    if(this.model.attr('isDerivated')) this.model.attr('attributeBody/strokeDasharray','5,5')
    else this.model.attr('attributeBody/strokeDasharray', null)
    // is key
    if(this.model.attr('isKey')) this.el.querySelector('.elementNameInput').style.textDecorationLine = 'underline'
    else this.el.querySelector('.elementNameInput').style.textDecorationLine = null
    // is partial key
    if(this.model.attr('isPartialKey')) {
      this.el.querySelector('.elementNameInput').style.textDecorationLine = 'underline'
      this.el.querySelector('.elementNameInput').style.textDecorationThickness = 'dashed'
    }
    else{
      this.el.querySelector('.elementNameInput').style.textDecorationLine = null
      this.el.querySelector('.elementNameInput').style.textDecorationThickness = null
    }
    return this
  }
  initialize() {
    dia.ElementView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change', (model, options) => {
      if(options.propertyPath == 'size/width' || options.propertyPath == 'attrs/labelText') return // avoid re-render as it would lose focus
      this.render()
    })
  }
  manageInput(e) {
    this.model.attr('labelText',e.currentTarget.innerText.trim())
    if(e.currentTarget.innerText.trim() == ''){
      while (e.currentTarget.firstChild) e.currentTarget.removeChild(e.currentTarget.firstChild)
      this.model.prop('size/width',this.model.get('initialSize').width)
    } else{
      this.model.prop('size/width',e.currentTarget.offsetWidth)
    }
  }
  events() {
    return {
      'input .elementNameInput': (e) => {this.manageInput(e)}
    }
  }
}

// RELATIONSHIPS
const relationMarkup = util.svg/* xml */`
    <polygon @selector="relationBody"/>
    <polygon @selector="innerRelationBody"/>
    <foreignObject @selector="elementName">
      <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="elementNameContainer">
        <div @selector="attributeName" class="elementNameInput" contenteditable="true" style="text-transform:uppercase" data-placeholder="relación" autocomplete="off" autocorrect="off" spellcheck="false"></div>
      </div>
    </foreignObject>`
export class Relation extends dia.Element {
  preinitialize() {
    this.markup = relationMarkup;
  }
  initialize() {
    dia.Element.prototype.initialize.apply(this, arguments)
    let label = this.attr('labelText')
    if(label != null && typeof label === 'object') this.attr('labelText',Object.values(label).join(''))
  }
  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'erd.Relation',
      size: {
        width: 150,
        height: 50
      },
      initialSize: {
        width: 150,
        height: 50,
      },
      attrs: {
        root: {
          cursor: 'move'
        },
        relationBody: {
          width: 'calc(w)',
          height: 'calc(h)',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '2',
          points: '0,calc(h/2) calc(w/2),calc(h) calc(w),calc(h/2) calc(w/2),0'
        },
        innerRelationBody: {
          width: 'calc(w)',
          height: 'calc(h)',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '2',
          points: '12,calc(h/2) calc(w/2),calc(h-5) calc(w - 12),calc(h/2) calc(w/2),5',
          display: 'none'
        },
        elementName: {
          width: 'calc(w - 10)',
          height: 'calc(h - 10)',
          x: 5,
          y: 5
        },
        isIdentifier: false,
        showRoles: false,
        labelText: ''
      }
    }
  }

  setShowRoles(bool) {
    this.attr('showRoles',bool)
    let toggleLink = (link, display) => {
      let labels = link.labels()
      let rolLabelPos = labels.reduce((pos,l,i) => {
        if (l.attrs.roleLabel != null) pos.push(i)
        return pos
      },[])
      rolLabelPos.forEach((i) => {
        let value = display ? null : 'none'
        link.label(i, {attrs: {roleLabel: {display: value}}})
      })
    }
    let links = this.graph.getConnectedLinks(this)
    links.forEach((l) => {toggleLink(l,bool)})
  }
}
export class RelationView extends dia.ElementView {
  render() {
    dia.ElementView.prototype.render.apply(this, arguments);
    // label
    this.el.querySelector('.elementNameInput').innerText = this.model.attr('labelText')
    // identifier relationship
    if(this.model.attr('isIdentifier')) this.model.attr('innerRelationBody/display',null)
    else this.model.attr('innerRelationBody/display', 'none')
    return this
  }
  initialize() {
    dia.ElementView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change', (model, options) => {
      if(options.propertyPath == 'size/width' || options.propertyPath == 'attrs/labelText') return // avoid re-render as it would lose focus
      this.render()
    })
  }
  manageInput(e) {
    this.model.attr('labelText',e.currentTarget.innerText.trim())
    if(e.currentTarget.innerText.trim() == ''){
      while (e.currentTarget.firstChild) e.currentTarget.removeChild(e.currentTarget.firstChild)
      this.model.prop('size/width',this.model.get('initialSize').width)
    } else{
      this.model.prop('size/width',e.currentTarget.offsetWidth)
    }
  }
  events() {
    return {
      'input .elementNameInput': (e) => {this.manageInput(e)}
    }
  }
}
