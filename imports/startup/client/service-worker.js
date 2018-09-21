import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  navigator.serviceWorker.register('/sw.js').then().catch(error => console.error('ServiceWorker registration failed: ', error));
});
