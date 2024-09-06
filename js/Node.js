import { dia, shapes, util, elementTools } from '../node_modules/@joint/core/joint.mjs';


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
    x: '100%',
    y: '50%',
    scale: 1.5,
    rotate: true,
    action: function(evt) {
      const at1 = new Attribute()
      at1.position(500, 125);
      at1.addTo(this.paper.model);
      const link = new shapes.standard.Link();
      link.source(this.model);
      link.target(at1);
      link.addTo(this.paper.model);
    }
  }
});



const entityMarkup = util.svg/* xml */`
    <rect @selector="entityBody"/>
    <rect @selector="innerEntityBody"/>
    <foreignObject @selector="elementName">
      <div @selector="content" xmlns="http://www.w3.org/1999/xhtml" class="elementNameContainer">
        <div @selector="entityName" class="elementNameInput" contenteditable="true" style="text-transform:uppercase" data-placeholder="ENTITY"></div>
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
        isWeak: false
      }
    }
  }

  toggleWeakness() {
    this.attr('isWeak',!this.attr('isWeak'));
    if(this.attr('innerEntityBody/display') != null) this.removeAttr('innerEntityBody/display')
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
    <text @selector="label"/>
`
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
        label: {
          x: 'calc(w/2)',
          y: 'calc(h/2)',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'black'
        },
        isMultivaluated: false,
        isDerivated: false,
        isKey: false,
        isPartialKey: false
      }
    }
  }

  toggleMultivaluatedness() {
    this.attr('isMultivaluated',!this.attr('isMultivaluated'));
    if(this.attr('innerAttributeBody/display') != null) this.removeAttr('innerAttributeBody/display')
    else this.attr('innerAttributeBody/display', 'none')
  }

  toggleDerivatedness() {
    this.attr('isDerivated',!this.attr('isDerivated'));
    if(this.attr('attributeBody/strokeDasharray') != null) this.removeAttr('attributeBody/strokeDasharray')
    else this.attr('attributeBody/strokeDasharray', '5,5')
  }

  toggleKey() {
    this.attr('isKey',!this.attr('isKey'));
    if(this.attr('label/textDecoration') != null) this.removeAttr('label/textDecoration')
    else this.attr('label/textDecoration', 'underline')
  }

  togglePartialKey() {
    this.attr('isPartialKey',!this.attr('isPartialKey'));
    if(this.attr('label/style/textDecorationStyle') != null) this.removeAttr('label/style/textDecorationStyle')
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
