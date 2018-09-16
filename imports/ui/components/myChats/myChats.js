import { Template } from 'meteor/templating';

import './myChats.html';

Template.myChats.helpers({
  myChats() {
    return JSON.parse(localStorage.getItem('myChats')) || false;
  },
});
