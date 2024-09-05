import { dia, shapes, util } from '../node_modules/@joint/core/joint.mjs';


const entityMarkup = util.svg/* xml */`
    <rect @selector="entityBody"/>
    <rect @selector="innerEntityBody"/>
    <text @selector="label"/>
`
export class Entity extends dia.Element {
  preinitialize() {
    this.markup = entityMarkup;
  }

  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'examples.Entity',
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
        label: {
          x: 'calc(w/2)',
          y: 'calc(h/2)',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'black'
        }
      }
    }
  }
}

export class WeakEntity extends Entity {
  preinitialize() {
    super.preinitialize();
  }

  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'examples.WeakEntity',
      size: {
        width: 150,
        height: 50
      },
      root: {
        cursor: 'move'
      },
      attrs: {
        innerEntityBody: {
          display: 'inline'
        }
      }
    }
  }
}


const weakEntityMarkup2 = util.svg/* xml */`
    <rect @selector="weakEntityBody"/>
`
export class WeakEntity2 extends Entity {
  preinitialize() {
    super.preinitialize();
    this.markup = weakEntityMarkup.concat(this.markup);
  }

  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'examples.WeakEntity',
      size: {
        width: 150,
        height: 50
      },
      attrs: {
        root: {
          cursor: 'move'
        },
        weakEntityBody: {
          width: 'calc(w)',
          height: 'calc(h)',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '2'
        },
        entityBody: {
          width: 'calc(w - 10)',
          height: 'calc(h - 10)',
          x: 5,
          y: 5,
          align: 'middle',
          verticalAlign: 'middle',
          fill: 'white',
          stroke: 'black',
          strokeWidth: '2'
        },
        label: {
          x: 'calc(w/2)',
          y: 'calc(h/2)',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'black'
        }
      }
    }
  }
}



const attributteMarkup = util.svg/* xml */`
    <ellipse @selector="attributeBody"/>
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
      type: 'examples.Attribute',
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
        label: {
          x: 'calc(w/2)',
          y: 'calc(h/2)',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'black'
        }
      }
    }
  }
}



const multiAttributteMarkup = util.svg/* xml */`
    <ellipse @selector="innerAttributeBody"/>
`
export class MultiAttribute extends Attribute {
  preinitialize() {
    super.preinitialize();
    this.markup = this.markup.concat(multiAttributteMarkup);
  }


  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'examples.Attribute',
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
          ry: 'calc(h/2-5)'
        },
        label: {
          x: 'calc(w/2)',
          y: 'calc(h/2)',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'black'
        }
      }
    }
  }
}











//  EXAMPLE



const nodeMarkup = util.svg/* xml */`
    <rect @selector="nodeBody"/>
    <clipPath @selector="clipPath"><rect @selector="clipPathRect"/></clipPath>
    <rect @selector="nodeHeader"/>
    <text @selector="nodeHeaderLabel"/>
    <text @selector="label"/>
`

export class Node extends dia.Element {
  preinitialize() {
    this.markup = nodeMarkup;
  }

  defaults() {
    const clipId = util.uuid();

    return {
      ...super.defaults,
      type: 'examples.Node',
      size: {
        width: 150,
        height: 80
      },
      attrs: {
        root: {
          cursor: 'move'
        },
        nodeBody: {
          width: 'calc(w)',
          height: 'calc(h)',
          fill: '#023047',
          rx: 6,
        },
        nodeHeaderLabel: {
          x: 15,
          y: 20 / 2 + 1,
          textAnchor: 'start',
          textVerticalAnchor: 'middle',
          fill: '#023047',
          text: 'Node',
          fontSize: 10,
        },
        nodeHeader: {
          x: 0,
          y: 0,
          width: 'calc(w)',
          height: 20,
          clipPath: `url(#${clipId})`,
          fill: '#ffb703'
        },
        clipPath: {
          id: clipId
        },
        clipPathRect: {
          width: 'calc(w)',
          height: 'calc(h)',
          rx: 6,
        },
        label: {
          x: 'calc(w/2)',
          y: 'calc(h/2+10)',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fill: 'white'
        },
      }
    }
  }
}



const buttonNodeMarkup = util.svg/* xml */`
    <foreignObject @selector="foreignObject">
        <div class="button-container" @selector="buttonContainer">
            <button class="button" @selector="button"></button>
        </div>
    </foreignObject>
`;

export class ButtonNode extends Node {
  preinitialize() {
    super.preinitialize();

    this.markup = this.markup.concat(buttonNodeMarkup);
  }

  defaults() {
    const clipId = util.uuid();

    return util.defaultsDeep({
      type: 'examples.ButtonNode',
      buttonTextVisible: 'Hide text',
      buttonTextHidden: 'Show text',
      attrs: {
        nodeHeaderLabel: {
          text: 'Button node'
        },
        label: {
          y: 'calc(h/2+25)',
          visibility: 'hidden'
        },
        foreignObject: {
          x: 0,
          y: 0,
          width: 'calc(w)',
          height: 'calc(h)',
        }
      }
    }, super.defaults());
  }
}

export class ButtonNodeView extends dia.ElementView {

  render() {
    super.render();
    this.el.getElementsByTagName('button')[0].textContent =
      this.model.get('buttonTextHidden');
  }

  events() {
    return {
      'click button': (evt) => { this.onButtonClick(evt) }
    }
  }

  onButtonClick(evt) {
    const visibility = this.model.attr('label/visibility');
    if (visibility === 'hidden') {
      this.model.attr('label/visibility', 'visible');
      evt.target.textContent = this.model.get('buttonTextVisible');
    } else {
      this.model.attr('label/visibility', 'hidden');
      evt.target.textContent = this.model.get('buttonTextHidden');
    }
  }
}
