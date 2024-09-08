import { dia, shapes, util, elementTools } from '../node_modules/@joint/core/joint.mjs';



const showSettings = (element) => {
  document.querySelector('#settingsContainer').classList.add('visible')
  const settingsContent = document.querySelector('#settingsContent')
  settingsContent.innerHTML = ''
  let settingsCont
  switch (element.model.attributes['type']){
    case 'erd.Entity':
      settingsCont = document.querySelector('#entitySettingsContent').content.cloneNode(true);
      settingsCont.querySelector("#isWeakInput").checked = element.model.attr('isWeak')
      settingsCont.querySelector("#isWeakInput").addEventListener('change', () => {element.model.toggleWeakness()})
      break;
    case 'erd.Attribute':
      settingsCont = document.querySelector('#attributeSettingsContent').content.cloneNode(true);
      settingsCont.querySelector("#isKeyInput").checked = element.model.attr('isKey')
      settingsCont.querySelector("#isKeyInput").addEventListener('change', () => {element.model.toggleKey()})
      settingsCont.querySelector("#isMultivaluatedInput").checked = element.model.attr('isMultivaluated')
      settingsCont.querySelector("#isMultivaluatedInput").addEventListener('change', () => {element.model.toggleMultivaluatedness()})
      settingsCont.querySelector("#isDerivatedInput").checked = element.model.attr('isDerivated')
      settingsCont.querySelector("#isDerivatedInput").addEventListener('change', () => {element.model.toggleDerivatedness()})
      break;
  }
  settingsContent.appendChild(settingsCont);
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
          fontSize: 8,
          strokeWidth: 1.5,
          stroke: 'black',
          x: 0,
          y: 3
        },
        textContent: '+',
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
      const elementView = at1.findView(this.paper)
      const removeButton = new elementTools.Remove({
        x: 0,
        y: "50%",
        scale: 1.5
      });
      const settingsButton = new SettingsButton();
      const attributeButton = new AttributeButton();
      const toolsView = new dia.ToolsView({
        tools: [
          removeButton,
          settingsButton,
          attributeButton
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

const entityMarkup = util.svg/* xml */`
    <rect @selector="entityBody"/>
    <rect @selector="innerEntityBody"/>
    <foreignObject @selector="elementName">
      <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="elementNameContainer">
        <div @selector="entityName" class="elementNameInput" contenteditable="true" style="text-transform:uppercase" data-placeholder="ENTITY" autocomplete="off" autocorrect="off" spellcheck="false"></div>
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
        label: ''
      }
    }
  }

  toggleWeakness() {
    this.attr('isWeak',!this.attr('isWeak'));
    if(this.attr('innerEntityBody/display') != null) this.attr('innerEntityBody/display',null)
    else this.attr('innerEntityBody/display', 'none')
  }
}

/*
export class EntityView extends dia.ElementView {
  init() {
    this.addTools(toolsView);
    this.hideTools();
  }
}
*/

const attributteMarkup = util.svg/* xml */`
    <ellipse @selector="attributeBody"/>
    <ellipse @selector="innerAttributeBody"/>
    <foreignObject @selector="elementName">
      <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="elementNameContainer">
        <div @selector="attributeName" class="elementNameInput" contenteditable="true" style="text-transform:lowercase" data-placeholder="ATTRIBUTE" autocomplete="off" autocorrect="off" spellcheck="false"></div>
      </div>
    </foreignObject>`
export class Attribute extends dia.Element {
  preinitialize() {
    this.markup = attributteMarkup;
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
        isMultivaluated: false,
        isDerivated: false,
        isKey: false,
        isPartialKey: false,
        label: ''
      }
    }
  }

  toggleMultivaluatedness() {
    this.attr('isMultivaluated',!this.attr('isMultivaluated'));
    if(this.attr('innerAttributeBody/display') != null) this.attr('innerAttributeBody/display',null)
    else this.attr('innerAttributeBody/display', 'none')
  }

  toggleDerivatedness() {
    this.attr('isDerivated',!this.attr('isDerivated'));
    if(this.attr('attributeBody/strokeDasharray') != null) this.attr('attributeBody/strokeDasharray',null)
    else this.attr('attributeBody/strokeDasharray', '5,5')
  }

  toggleKey() {
    this.attr('isKey',!this.attr('isKey'));
    if(this.attr('attributeName/style/textDecoration') != null) this.attr('attributeName/style/textDecoration',null)
    else this.attr('attributeName/style/textDecoration', 'underline')
  }

  togglePartialKey() {
    this.attr('isPartialKey',!this.attr('isPartialKey'));
    if(this.attr('label/style/textDecorationStyle') != null) this.attr('label/style/textDecorationStyle',null)
    else this.attr('label/style/textDecorationStyle', 'dashed')
  }
}



//  EXAMPLE

//
//
// const nodeMarkup = util.svg/* xml */`
//     <rect @selector="nodeBody"/>
//     <clipPath @selector="clipPath"><rect @selector="clipPathRect"/></clipPath>
//     <rect @selector="nodeHeader"/>
//     <text @selector="nodeHeaderLabel"/>
//     <text @selector="label"/>
// `
//
// export class Node extends dia.Element {
//   preinitialize() {
//     this.markup = nodeMarkup;
//   }
//
//   defaults() {
//     const clipId = util.uuid();
//
//     return {
//       ...super.defaults,
//       type: 'examples.Node',
//       size: {
//         width: 150,
//         height: 80
//       },
//       attrs: {
//         root: {
//           cursor: 'move'
//         },
//         nodeBody: {
//           width: 'calc(w)',
//           height: 'calc(h)',
//           fill: '#023047',
//           rx: 6,
//         },
//         nodeHeaderLabel: {
//           x: 15,
//           y: 20 / 2 + 1,
//           textAnchor: 'start',
//           textVerticalAnchor: 'middle',
//           fill: '#023047',
//           text: 'Node',
//           fontSize: 10,
//         },
//         nodeHeader: {
//           x: 0,
//           y: 0,
//           width: 'calc(w)',
//           height: 20,
//           clipPath: `url(#${clipId})`,
//           fill: '#ffb703'
//         },
//         clipPath: {
//           id: clipId
//         },
//         clipPathRect: {
//           width: 'calc(w)',
//           height: 'calc(h)',
//           rx: 6,
//         },
//         label: {
//           x: 'calc(w/2)',
//           y: 'calc(h/2+10)',
//           textAnchor: 'middle',
//           textVerticalAnchor: 'middle',
//           fill: 'white'
//         },
//       }
//     }
//   }
// }
//
//
//
// const buttonNodeMarkup = util.svg/* xml */`
//     <foreignObject @selector="foreignObject">
//         <div class="button-container" @selector="buttonContainer">
//             <button class="button" @selector="button"></button>
//         </div>
//     </foreignObject>
// `;
//
// export class ButtonNode extends Node {
//   preinitialize() {
//     super.preinitialize();
//
//     this.markup = this.markup.concat(buttonNodeMarkup);
//   }
//
//   defaults() {
//     const clipId = util.uuid();
//
//     return util.defaultsDeep({
//       type: 'examples.ButtonNode',
//       buttonTextVisible: 'Hide text',
//       buttonTextHidden: 'Show text',
//       attrs: {
//         nodeHeaderLabel: {
//           text: 'Button node'
//         },
//         label: {
//           y: 'calc(h/2+25)',
//           visibility: 'hidden'
//         },
//         foreignObject: {
//           x: 0,
//           y: 0,
//           width: 'calc(w)',
//           height: 'calc(h)',
//         }
//       }
//     }, super.defaults());
//   }
// }
//
// export class ButtonNodeView extends dia.ElementView {
//
//   render() {
//     super.render();
//     this.el.getElementsByTagName('button')[0].textContent =
//       this.model.get('buttonTextHidden');
//   }
//
//   events() {
//     return {
//       'click button': (evt) => { this.onButtonClick(evt) }
//     }
//   }
//
//   onButtonClick(evt) {
//     const visibility = this.model.attr('label/visibility');
//     if (visibility === 'hidden') {
//       this.model.attr('label/visibility', 'visible');
//       evt.target.textContent = this.model.get('buttonTextVisible');
//     } else {
//       this.model.attr('label/visibility', 'hidden');
//       evt.target.textContent = this.model.get('buttonTextHidden');
//     }
//   }
// }
