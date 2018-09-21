import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import moment from 'moment';
import 'moment/locale/fr';
import './chat.html';

import Chats from '/imports/api/chats/collection.js';

Template.chat.onCreated(() => {
  const instance = Template.instance();
  instance.chat = new ReactiveVar();
  const token = FlowRouter.getParam('token');
  instance.subscribe('chat', token);
});

Template.chat.onRendered(() => {
  const instance = Template.instance();
  const token = FlowRouter.getParam('token');
  instance.autorun(() => {
    const chat = Chats.findOne({ $or: [{ me: token }, { you: token }] });
    if (chat) {
      instance.chat.set(chat);
      const myChats = JSON.parse(localStorage.getItem('myChats')) || [];
      if (chat.deleted) {
        if (myChats.indexOf(token) !== -1) {
          myChats.splice(myChats.indexOf(token), 1);
          localStorage.setItem('myChats', JSON.stringify(myChats));
        }
        $('#messageInput').addClass('disabled');
        $('#message').attr('placeholder', 'Ne dis plus rien 😕');
      } else {
        if (myChats.indexOf(token) === -1) {
          myChats.push(token);
          localStorage.setItem('myChats', JSON.stringify(myChats));
        }

        document.getElementById('message').focus();
        Meteor.setTimeout(() => {
          $('html, body').animate({ scrollTop: $(document).height() }, 1000);
        }, 500);
      }
      $('#newMessage').form({
        fields: {
          message: 'empty',
        },
      });
      sAlert.info('NE PASSEZ PAS VOTRE LIEN À QUELQU\'UN D\'AUTRE, CELA LUI PERMETTRAIT DE PARLER À VOTRE PLACE (VOUS ÊTES PRÉVENUS).');
    }
  });
});

Template.chat.helpers({
  chat() {
    return Template.instance().chat.get();
  },
  fromNow(date) {
    if (date) {
      return moment(date).locale('fr').fromNow();
    }
    return '';
  },
});

Template.chat.events({
  'submit #newMessage'(event) {
    event.preventDefault();
    const token = FlowRouter.getParam('token');
    const message = $('#message').val();
    if (!message) {
      sAlert.warning('Pas de message ?');
      return false;
    }
    Meteor.call('newMessage', token, message, (error, success) => {
      if (error) sAlert.error(error);
      if (success) {
        $('#message').val('');
        $('html, body').animate({ scrollTop: $(document).height() }, 500);
      }
    });
    return true;
  },
  'click #newMessageIcon'() {
    $('#newMessage').form('submit');
  },
  'click #closeInfo'() {
    $('#chatInfo').transition('fade');
  },
  'click #deleteMessages'() {
    $('#deleteMessagesModal').modal({
      onApprove() {
        const token = FlowRouter.getParam('token');
        Meteor.call('deleteMessages', token, (error) => {
          if (error) sAlert.error(error);
        });
      },
    }).modal('show');
  },
});
