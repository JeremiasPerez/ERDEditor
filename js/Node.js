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
      settingsCont.querySelector("#isWeakInput").checked = element.model.prop('isWeak')
      settingsCont.querySelector("#isWeakInput").addEventListener('change', (e) => {element.model.prop('isWeak',e.currentTarget.checked)})
      break
    case 'erd.Attribute':
      settingsCont = document.querySelector('#attributeSettingsContent').content.cloneNode(true);
      settingsCont.querySelector("#isKeyInput").checked = element.model.prop('isKey')
      settingsCont.querySelector("#isKeyInput").addEventListener('change', (e) => {
        element.model.prop('isKey',e.currentTarget.checked)
        if(e.currentTarget.checked){
          document.querySelector("#isPartialKeyInput").disabled = true
          document.querySelector("#isPartialKeyInput").closest('.settings-element').classList.add('disabled')
        }
        else {
          document.querySelector("#isPartialKeyInput").closest('.settings-element').classList.remove('disabled')
          document.querySelector("#isPartialKeyInput").disabled = false
        }
      })
      settingsCont.querySelector("#isPartialKeyInput").checked = element.model.prop('isPartialKey')
      settingsCont.querySelector("#isPartialKeyInput").addEventListener('change', (e) => {
        element.model.prop('isPartialKey',e.currentTarget.checked)
        if(e.currentTarget.checked){
          document.querySelector("#isKeyInput").closest('.settings-element').classList.add('disabled')
          document.querySelector("#isKeyInput").disabled = true
        }
        else {
          document.querySelector("#isKeyInput").closest('.settings-element').classList.remove('disabled')
          document.querySelector("#isKeyInput").disabled = false
        }
      })
      settingsCont.querySelector("#isMultivaluatedInput").checked = element.model.prop('isMultivaluated')
      settingsCont.querySelector("#isMultivaluatedInput").addEventListener('change', (e) => {element.model.prop('isMultivaluated',e.currentTarget.checked)})
      settingsCont.querySelector("#isDerivatedInput").checked = element.model.prop('isDerivated')
      settingsCont.querySelector("#isDerivatedInput").addEventListener('change', (e) => {element.model.prop('isDerivated',e.currentTarget.checked)})
      break
    case 'erd.Relation':
      settingsCont = document.querySelector('#relationSettingsContent').content.cloneNode(true);
      settingsCont.querySelector("#isIndentifierInput").checked = element.model.prop('isIdentifier')
      settingsCont.querySelector("#isIndentifierInput").addEventListener('change', (e) => {element.model.prop('isIdentifier',e.currentTarget.checked)})
      settingsCont.querySelector('#showRoleInput').checked = element.model.prop('showRoles')
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
  initialize() {
    dia.Element.prototype.initialize.apply(this, arguments)
    let label = this.prop('labelText')
    if(label != null && typeof label === 'object'){
      this.prop('labelText',Object.values(label).join(''))
    }
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
      isWeak: false,
      labelText: '',
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
        }
      }
    }
  }
}
export class EntityView extends dia.ElementView {
  render() {
    dia.ElementView.prototype.render.apply(this, arguments);
    // label
    this.el.querySelector('.elementNameInput').innerText = this.model.prop('labelText')
    // is weak
    if(this.model.prop('isWeak')) this.model.attr('innerEntityBody/display',null)
    else this.model.attr('innerEntityBody/display', 'none')

    return this
  }
  initialize() {
    dia.ElementView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change', (model, options) => {
      if(options.propertyPath == 'size/width' || options.propertyPath == 'labelText') return // avoid re-render as it would lose focus
      this.render()
    })
  }
  manageInput(e) {
    this.model.prop('labelText',e.currentTarget.innerText.trim())
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
    let label = this.prop('labelText')
    if(label != null && typeof label === 'object'){
      this.prop('labelText',Object.values(label).join(''))
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
      isMultivaluated: false,
      isDerivated: false,
      isKey: false,
      isPartialKey: false,
      labelText: '',
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
        }
      }
    }
  }
}
export class AttributeView extends dia.ElementView {
  render() {
    dia.ElementView.prototype.render.apply(this, arguments)
    // label
    this.el.querySelector('.elementNameInput').innerText = this.model.prop('labelText')
    // is multivaluated attribute
    if(this.model.prop('isMultivaluated')) this.model.attr('innerAttributeBody/display',null)
    else this.model.attr('innerAttributeBody/display', 'none')
    // is derivated
    if(this.model.prop('isDerivated')) this.model.attr('attributeBody/strokeDasharray','5,5')
    else this.model.attr('attributeBody/strokeDasharray', null)
    // is (partial) key
    if(this.model.prop('isKey')) {
      this.el.querySelector('.elementNameInput').style.textDecorationLine = 'underline'
    } else if(this.model.prop('isPartialKey')) { // is partial key
      this.el.querySelector('.elementNameInput').style.textDecorationLine = 'underline'
      this.el.querySelector('.elementNameInput').style.textDecorationStyle = 'dotted'
    } else { // not key
      this.el.querySelector('.elementNameInput').style.textDecorationLine = null
      this.el.querySelector('.elementNameInput').style.textDecorationStyle = null
    }
    return this
  }
  initialize() {
    dia.ElementView.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change', (model, options) => {
      if(options.propertyPath == 'size/width' || options.propertyPath == 'labelText' ) return // avoid re-render as it would lose focus
      this.render()
    })
  }
  manageInput(e) {
    this.model.prop('labelText',e.currentTarget.innerText.trim())
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
    let label = this.prop('labelText')
    if(label != null && typeof label === 'object') this.prop('labelText',Object.values(label).join(''))
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
      isIdentifier: false,
      showRoles: false,
      labelText: '',
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
        }
      }
    }
  }

  setShowRoles(bool) {
    this.prop('showRoles',bool)
    let links = this.graph.getConnectedLinks(this)
    links.forEach((l) => l.prop('showRoles',bool))
  }
}
export class RelationView extends dia.ElementView {
  render() {
    dia.ElementView.prototype.render.apply(this, arguments);
    // label
    this.el.querySelector('.elementNameInput').innerText = this.model.prop('labelText')
    // identifier relationship
    if(this.model.prop('isIdentifier')) this.model.attr('innerRelationBody/display',null)
    else this.model.attr('innerRelationBody/display', 'none')
    return this
  }
  initialize() {
    dia.ElementView.prototype.initialize.apply(this, arguments)
    this.listenTo(this.model, 'change', (model, options) => {
      if(options.propertyPath == 'size/width' || options.propertyPath == 'labelText') return // avoid re-render as it would lose focus
      this.render()
    })
  }
  manageInput(e) {
    this.model.prop('labelText',e.currentTarget.innerText.trim())
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

// ATTRIBUTE LINKS
export class AttributeLink extends dia.Link {
  preinitialize() {
    this.markup = shapes.standard.Link.prototype.markup
  }
  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'erd.AttributeLink',
      attrs: {
        line: {
          connection: true,
          stroke: 'black',
          strokeWidth: 2,
          strokeLinejoin: 'round',
          targetMarker: 'none'
        },
        wrapper: {
          connection: true,
          strokeWidth: 10,
          strokeLinejoin: 'round'
        }
      }
    }
  }
}


// RELATIONSHIP LINKS
export class RelationshipLink extends dia.Link {
  preinitialize() {
    this.markup = shapes.standard.Link.prototype.markup
  }
  addCardinalityLabel() {
    const labelMarkup = util.svg/* xml */`
  <foreignObject @selector="linkCardLabel" data-linkId="${this.id}">
    <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="linkCardLabelContainer">
      <label @selector="linkLabelOpeningBrackets">(</label>
      <label @selector="linkLabelMinCard" class="linkLabelInput linkCardInput minCard" contenteditable="true" style="text-transform:uppercase" data-placeholder="X" autocomplete="off" autocorrect="off" spellcheck="false">${this.prop('minCard')}</label>
      <label @selector="linkLabelOpeningComa">,</label>
      <label @selector="linkLabelMaxCard" class="linkLabelInput linkCardInput maxCard" contenteditable="true" style="text-transform:uppercase" data-placeholder="X" autocomplete="off" autocorrect="off" spellcheck="false">${this.prop('maxCard')}</label>
      <label @selector="linkLabelClosingBrackets">)</label>
    </div>
  </foreignObject>`
    this.appendLabel({
      markup: labelMarkup,
      attrs: {
        linkCardLabel: {
          width: '6ch',
          height: 30,
          cursor: 'default'
        },
        labelType: 'cardinality'
      },
      position: {
        distance: 0.3,
        offset: 40
      }
    })
  }
  addRoleLabel() {
    const roleLabelMarkup = util.svg/* xml */`
  <foreignObject @selector="roleLabel" data-linkId="${this.id}">
    <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="linkRoleLabelContainer">
      <div @selector="linkRoleLabel" class="linkLabelInput linkRoleInput" contenteditable="true" style="text-transform:lowercase" data-placeholder="rol" autocomplete="off" autocorrect="off" spellcheck="false">${this.prop('role')}</div>
    </div>
  </foreignObject>`
    this.appendLabel({
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
        },
        labelType: 'role'
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
  }
  initialize() {
    dia.Link.prototype.initialize.apply(this, arguments);
    let minCard = this.prop('minCard')
    if(minCard != null && typeof minCard === 'object') this.prop('minCard',Object.values(minCard).join(''))
    let maxCard = this.prop('maxCard')
    if(maxCard != null && typeof maxCard === 'object') this.prop('maxCard',Object.values(maxCard).join(''))
    let role = this.prop('role')
    if(role != null && typeof role === 'object') this.prop('role',Object.values(role).join(''))
  }
  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'erd.RelationshipLink',
      showRoles: false,
      minCard: '',
      maxCard: '',
      role: '',
      attrs: {
        line: {
          connection: true,
          stroke: 'black',
          strokeWidth: 2,
          strokeLinejoin: 'round',
          targetMarker: 'none'
        },
        wrapper: {
          connection: true,
          strokeWidth: 10,
          strokeLinejoin: 'round'
        }
      }
    }
  }
}
export class RelationshipLinkView extends dia.LinkView {
  render() {
    dia.LinkView.prototype.render.apply(this, arguments)
    this.el.querySelector('.label .minCard').innerText = this.model.prop('minCard')
    this.el.querySelector('.label .maxCard').innerText = this.model.prop('maxCard')
    this.el.querySelector('.label .linkRoleInput').innerText = this.model.prop('role')
    if(!this.model.prop('showRoles')) this.el.querySelector('.linkRoleInput').closest('.label').style.display = 'none'
    else this.el.querySelector('.linkRoleInput').closest('.label').style.display = 'default'
    // todo assign initial width for import
    return this
  }
  initialize() {
    dia.LinkView.prototype.initialize.apply(this, arguments)

    this.listenTo(this.model, 'change', (model, options) => {
      let avoid = ['minCard','maxCard','role']
      if(!avoid.includes(options.propertyPath) && !options.propertyPath.includes('labels/')) this.render()
    })
  }
  manageCardInput(e) {
    let content = e.currentTarget.innerText.trim()
    const card = Number(content)
    if(content == '' || (content != 'N' && content != 'n' && (Number.isNaN(card) || card < 0 || !Number.isInteger(card)))){
      while (e.currentTarget.firstChild) e.currentTarget.removeChild(e.target.firstChild)
    }
    if(e.currentTarget.classList.contains('minCard')) this.model.prop('minCard',e.currentTarget.innerText)
    else if(e.target.classList.contains('maxCard')) this.model.prop('maxCard',e.currentTarget.innerText)
  }
  manageRoleInput(e) {
    let content = e.currentTarget.innerText.trim()
    if(content == ''){
      while (e.currentTarget.firstChild) e.currentTarget.removeChild(e.target.firstChild)
    }
    this.model.prop('role',e.currentTarget.innerText)
    this.model.label(1, {attrs: {roleLabel: {width: e.currentTarget.offsetWidth}}})
  }
  events() {
    return {
      'input .linkCardInput': (e) => {this.manageCardInput(e)},
      'input .linkRoleInput': (e) => {this.manageRoleInput(e)}
    }
  }
}

