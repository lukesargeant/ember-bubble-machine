import Ember from 'ember';
import Poppable from '../mixins/poppable';
import layout from '../templates/components/a-bubble';
import Box from 'ember-box-utils/utils/box';

const DIRECTION = {
  TOP: 'top', BOTTOM: 'bottom', LEFT: 'left', RIGHT: 'right'
};

DIRECTION.OPPOSITE = {
  top: DIRECTION.BOTTOM, bottom: DIRECTION.TOP, left: DIRECTION.RIGHT, right: DIRECTION.LEFT
};

const DEFAULT_DIRECTION_TEST_ORDER = [
  DIRECTION.BOTTOM, DIRECTION.TOP, DIRECTION.LEFT, DIRECTION.RIGHT
];

export default Ember.Component.extend(Poppable, {

  layout,

  classNames: ['a-bubble'],

  /**
   * Target that the bubble should anchor to.
   * @type {CssSelector|jQuery|DomElement}
   */
  target: null,

  /**
   * A list containing preferred and fall back directions in which to show the
   * bubble.
   * @type {Array}
   */
  directionPreference: Ember.computed(function() { return [DIRECTION.TOP]; }),

  /**
   * Minimum distance from the window edge that the bubble should be positioned.
   * @type {Number}
   */
  padding: 0,

  /**
   * The bubble should be contained within this element.
   * @type {CssSelector|jQuery|DomElement}
   */
  containment: null,

  /**
   * Sneaky yet semantically sound way to trigger rerenders based on the parent
   * context's knowledge of dom updates.
   * @type {Number}
   */
  domUpdate: 0,

  /**
   * Supported directions for rendering a bubble.
   * @type {Array}
   * @private
   */
  _directions: Ember.computed(function() { return DEFAULT_DIRECTION_TEST_ORDER; }),

  /**
   * The resulting order in which to attempt rendering the bubble in each
   * suported direction beginning with contextual preference.
   * @type {Array}
   * @private
   */
  _directionList: Ember.computed.uniq('directionPreference', '_directions'),

  /**
   * Returns a box with the dimensions of the bubble's content DOM element.
   * @type {Box}
   */
  _bubbleBox: Ember.computed('domUpdate', function() {
    return Box.fromElement(this.$('.a-bubble_content').get(0));
  }),

  /**
   * Returns a box with the dimensions of the bubble target DOM element.
   * @type {Box}
   */
  _targetBox: Ember.computed('target', 'domUpdate', function() {
    return Box.fromElement(this.get('target').get(0));
  }),

  /**
   * Returns a box with the dimensions of the containment DOM element.
   * @type {Box}
   */
  _containmentBox: Ember.computed('containment', 'domUpdate', function() {
    const el = Ember.$(this.get('containment')).get(0) || window;
    return Box.fromElement(el);
  }),

  /**
   * Rerender when things change.
   */
  updateOnChanges: Ember.observer('target', '_directionList', 'padding', 'domUpdate', function() {
    this.rerender();
  }),

  /**
   * Enforce fixed positioning for the bubble.
   */
  didInsertElement() {
    this._super(...arguments);
    this.$().css({ position: 'fixed', top: 0, left: 0 });
  },

  /**
   * When given a target, position the element.
   */
  didRender() {
    this._super(...arguments);
    if (this.get('target')) {
      this.positionBubble();
    }
  },

  /**
   * Implement PoppableMixin hook for when the popup is dimissed.
   */
  poppableDidPop() {
    this.set('target', null);
  },

  /**
   * Calculate where the bubble should render and position the anchor.
   */
  positionBubble() {
    const directionPreference = this.get('_directionList');
    const bubbleBox = this.get('_bubbleBox');
    const targetBox = this.get('_targetBox');
    const containmentBox = this.get('_containmentBox');
    const padding = this.get('padding');

    let anchorLeft, anchorTop, bubbleLeft, bubbleTop;
    let direction;
    for (let i = 0; i < directionPreference.length; i++) {
      direction = directionPreference[i];

      const opposite = DIRECTION.OPPOSITE[direction];
      const zone = containmentBox.clone();
      const constrainOptions = {};
      constrainOptions[opposite] = targetBox[direction];
      zone.crop(constrainOptions);

      if (zone.canContain(bubbleBox.clone().grow(padding))) {
        [ anchorLeft, anchorTop ] = targetBox.pointAt(direction);

        bubbleBox.pointTo(DIRECTION.OPPOSITE[direction], targetBox.pointAt(direction));
        bubbleBox.grow(padding);
        bubbleBox.constrain(containmentBox);
        bubbleBox.crop(containmentBox);
        bubbleBox.shrink(padding);
        [bubbleLeft, bubbleTop] = bubbleBox.pointAt('top left');
        break;
      }
    }

    this.$().css({ left: bubbleLeft, top: bubbleTop });
    this._setDirectionalCSSHooks(direction);
    this._positionAnchor(anchorLeft - bubbleLeft, anchorTop - bubbleTop);

  },

  /**
   * Adds the directional CSS hooks for styling.
   * @param {String} direction
   */
  _setDirectionalCSSHooks(direction) {
    this.$()
      .removeClass('a-bubble--top a-bubble--bottom a-bubble--left a-bubble--right')
      .addClass(`a-bubble--${direction.toLowerCase()}`);
  },

  /**
   * Position the bubble's anchor.
   * @param {Number} left,
   * @param {Number} top
   */
  _positionAnchor(left, top) {
    this.$('.a-bubble_anchor').css({ position: 'absolute', left, top });
  }
});
