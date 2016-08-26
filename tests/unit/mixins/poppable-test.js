/* jshint expr:true */
import { expect } from 'chai';
import {
  describe,
  it
} from 'mocha';
import Ember from 'ember';
import PoppableMixin from 'ember-bubble-machine/mixins/poppable';

describe('PoppableMixin', function() {
  // Replace this with your real tests.
  it('works', function() {
    let PoppableObject = Ember.Object.extend(PoppableMixin);
    let subject = PoppableObject.create();
    expect(subject).to.be.ok;
  });
});
