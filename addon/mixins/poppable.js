import Ember from 'ember';

export default Ember.Mixin.create({

  _scopedDismissHandler: null,

  poppableDidPop() {
    this._super(...arguments);
  },

  /**
   * Set up dismiss handler.
   */
  didInsertElement() {
    this._super(...arguments);
    this.set('_scopedDismissHandler', (event) => {
      if (!Ember.$(event.target).closest(this.element).length) {
        this.poppableDidPop();
      }
    });
    Ember.$('html').on('mousedown', this.get('_scopedDismissHandler'));
  },

  /**
   * Tear down dimiss handler.
   */
  willDestroyElement() {
    Ember.$('html').off('mousedown', this.get('_scopedDismissHandler'));
    this._super(...arguments);
  }
});
