import Ember from 'ember';

export default Ember.Controller.extend({
  bubbleTarget: null,
  actions: {
    showContent1() {
      this.setProperties({
        'bubbleTarget1': Ember.$('.target1'),
        'directionPreference': ['right']
      });
    },
    showContent2() {
      this.setProperties({
        'bubbleTarget2': Ember.$('.target2'),
        'directionPreference': ['bottom']
      });
    },
    showContent3() {
      this.setProperties({
        'bubbleTarget3': Ember.$('.target3'),
        'directionPreference': ['top']
      });
    },
    showContent4() {
      this.setProperties({
        'bubbleTarget4': Ember.$('.target4'),
        'directionPreference': ['left']
      });
    }
  }
});
