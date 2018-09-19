import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import './newContact.html';

Template.newContact.onRendered(() => {
  $('#newContact').form({
    fields: {
      email: ['email', 'empty'],
    },
  });
});

const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

Template.newContact.events({
  'input #email'() {
    $('#emailField').removeClass('error');
    $('#newContact').removeClass('error');
  },
  'submit #newContact'(event) {
    event.preventDefault();
    const email = $('#newContact').form('get value', 'email').toLowerCase();
    if (!email || !validateEmail(email)) {
      $('#emailField').addClass('error');
      $('#newContact').addClass('error');
      sAlert.warning('Cette adresse email n\'est pas valide.');
      return false;
    }
    $('#newContactBtn').addClass('loading');
    Meteor.call('newChat', email, (error, me) => {
      $('#newContactBtn').removeClass('loading');
      if (error) sAlert.error(error);
      if (me) {
        FlowRouter.go(`/c/${me}`);
      }
    });
    return true;
  },
});
