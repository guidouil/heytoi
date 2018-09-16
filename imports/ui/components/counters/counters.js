import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import './counters.html';

Template.counters.onCreated(() => {
  const instance = Template.instance();
  instance.chatsCount = new ReactiveVar();
  instance.messagesCount = new ReactiveVar();
  Meteor.call('getCounters', (error, counters) => {
    if (error) sAlert.log(error);
    if (counters) {
      instance.chatsCount.set(counters.chatsCount);
      instance.messagesCount.set(counters.messagesCount);
    }
  });
});

Template.counters.helpers({
  chatsCount() {
    return Template.instance().chatsCount.get();
  },
  messagesCount() {
    return Template.instance().messagesCount.get();
  },
});
