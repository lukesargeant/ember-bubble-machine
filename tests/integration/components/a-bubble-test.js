/* jshint expr:true */
import Ember from 'ember';
import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import { describe, beforeEach } from 'mocha';
import hbs from 'htmlbars-inline-precompile';

const DIRECTIONAL_TEST_DEFS = {
  'top': {
    subject: 'bottom',
    test: 'lt',
    target: 'top'
  },
  'bottom': {
    subject: 'top',
    test: 'gt',
    target: 'bottom'
  },
  'left': {
    subject: 'right',
    test: 'lt',
    target: 'left'
  },
  'right': {
    subject: 'left',
    test: 'gt',
    target: 'right'
  }
};

const measure = function(selector) {
  const $el = Ember.$(selector);
  const { left, top } = $el.offset();
  return {
    left,
    top,
    right: left + $el.outerWidth(),
    bottom: top + $el.outerHeight()
  };
};

const logic = {
  gt: function(a, b) {
    return a >= b;
  },
  lt: function(a, b) {
    return a <= b;
  }
};

describeComponent(
  'a-bubble',
  'Integration: ABubbleComponent',
  {
    integration: true
  },
  function() {
    beforeEach(function() {
      this.setProperties({
        'containment': '#ember-testing',
        'directionPreference': ['top', 'right'],
        'domUpdate': Date.now(),
        'padding': 0
      });
      this.$().css('height', '400px');
      this.render(hbs`
        <style>
          .test-target {
            position: absolute;
            top: 100px;
            left: 100px;
            width: 50px;
            height: 50px;
            background: red;
          }
          .test-block {
            width: 50px;
            height: 50px;
            background: blue;
            overflow: hidden;
          }
          .test-block input {
            width: 40px;
          }
          .a-bubble_anchor {
            outline: 4px solid black;
            z-index: 1;
          }
        </style>
        <div class="test-target"></div>
        {{#a-bubble target=target
          directionPreference=directionPreference
          domUpdate=domUpdate
          containment=containment
          padding=padding}}
          <div class="test-block"><input /><input /></div>
        {{/a-bubble}}
      `);
    });

    it('hides provided block', function() {
      expect(this.$('.test-block')).to.have.lengthOf(0);
    });

    describe('when target is an element', function() {
      beforeEach(function() {
        this.set('target', this.$('.test-target'));
      });

      it('shows provided block', function() {
        expect(this.$('.test-block')).to.have.lengthOf(1);
      });

      ['top', 'bottom', 'left', 'right'].forEach(function(direction) {
        describe(`and directionPreference is ${direction}`, function() {
          beforeEach(function() {
            this.set('directionPreference', [direction]);
          });

          it(`should display content at ${direction} of target`, function() {
            const content = measure('.test-block');
            const target = measure('.test-target');
            const def = DIRECTIONAL_TEST_DEFS[direction];
            expect(logic[def.test](content[def.subject], target[def.target]),
              `Content ${def.subject} ${content[def.subject]} not ${def.test} target ${def.target} ${target[def.target]}`).to.be.true;
          });

          it(`should display anchor at the center point ${direction} of target`, function() {
            const anchor = measure('.a-bubble_anchor');
            const target = measure('.test-target');
            const def = DIRECTIONAL_TEST_DEFS[direction];
            expect(anchor[def.subject] === target[def.target],
              `Anchor ${def.subject} ${anchor[def.subject]} not equal to target ${def.target} ${target[def.target]}`).to.be.true;
            // TODO: check we're at the center of the correct edge.
          });
        });
      });

      describe('and there is not enough space in the directionPreference', function() {
        beforeEach(function() {
          this.$('.test-block').css('height', 101);
          this.set('domUpdate', Date.now());

        });

        it('should fall back to the next directionPreference', function() {
          const content = measure('.test-block');
          const target = measure('.test-target');
          const def = DIRECTIONAL_TEST_DEFS[this.get('directionPreference')[1]];

          expect(logic[def.test](content[def.subject], target[def.target]),
            `Content ${def.subject} ${content[def.subject]} not ${def.test} target ${def.target} ${target[def.target]}`).to.be.true;
        });
      });

      describe('and the bubble escapes the window with its center aligned with the target', function() {
        beforeEach(function() {
          this.$('.test-block').css('width', Ember.$('#ember-testing').width() - 50);
          this.set('domUpdate', Date.now());
        });

        it('should render the bubble within the containment', function() {
          const a = measure(this.$('.test-block'));
          const b = measure(Ember.$('#ember-testing'));
          expect(a.left >= b.left, 'a failed').to.be.true;
          expect(a.top >= b.top, 'b failed').to.be.true;
          expect(a.right <= b.right, 'c failed').to.be.true;
          expect(a.bottom <= b.bottom, 'd failed').to.be.true;
        });

        describe('and a padding is given', function() {
          const PADDING = 10;

          beforeEach(function() {
            this.set('padding', PADDING);
          });

          it('should render the bubble with respect to the padding', function() {
            const a = measure(this.$('.test-block'));
            const b = measure(Ember.$('#ember-testing'));
            expect(a.left >= b.left + PADDING, 'a failed').to.be.true;
            expect(a.top >= b.top + PADDING, 'b failed').to.be.true;
            expect(a.right <= b.right + PADDING, 'c failed').to.be.true;
            expect(a.bottom <= b.bottom + PADDING, 'd failed').to.be.true;
          });
        });
      });

      describe('and the body is clicked', function() {
        beforeEach(function() {
          Ember.run(() => Ember.$('body').mousedown());
        });

        it('hides provided block', function() {
          expect(this.$('.test-block')).to.have.lengthOf(0);
        });
      });
    });
  }
);
