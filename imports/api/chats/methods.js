// Methods related to Chats

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Random } from 'meteor/random';
import { Email } from 'meteor/email';
import MJML from '/imports/startup/server/mjml.js';
import path from 'path';

import Chats from './collection.js';

Meteor.methods({
  'newChat'(email) {
    check(email, String);

    const me = Random.id();
    const you = Random.id();
    const meIp = this.connection.clientAddress;
    Chats.insert({
      me,
      you,
      meIp,
      deleted: false,
      messages: [{ from: 'Moi', text: 'Hey Toi', date: new Date() }],
      counter: 1,
    });

    // Send mail to contact
    const emailTemplate = new MJML(path.resolve('./assets/app/mjml/mewContact.mjml'));
    emailTemplate.helpers({ you });
    const emailBody = emailTemplate.compile();
    const { html } = emailBody;
    Email.send({
      from: 'moi.lerobot@mail.heytoi.fr',
      to: email,
      subject: "Hey Toi, quelqu'un cherche à te contacter.",
      html,
      text: `Salut,
Quelqu'un veut discuter avec toi et je n'ai pas le droit de te dire qui.\n
Si tu es curieu·x·se, clique sur ce lien pour commencer la conversation (ou copie-le dans la barre d'adresse de ton navigateur).\n
https://heytoi.fr/c/${you}\n\n
Sinon efface ce message et pardon pour le dérangement.\n
Cordialement,
Moi le robot de HeyToi.fr`,
    });

    return me;
  },
  'newMessage'(token, text) {
    check(token, String);
    check(text, String);

    const chat = Chats.findOne({ $or: [{ me: token }, { you: token }] });
    if (!chat) {
      throw new Meteor.Error(404, 'Chat not found');
    }
    const message = {
      text,
      date: new Date(),
    };
    if (token === chat.me) {
      message.from = 'Moi';
    }
    if (token === chat.you) {
      message.from = 'Toi';
    }
    if (!chat.meIp && token === chat.me) {
      const meIp = this.connection.clientAddress;
      Chats.update({ _id: chat._id }, { $set: { meIp } });
    }
    return Chats.update({ _id: chat._id }, {
      $push: { messages: message },
      $inc: { counter: 1 },
    });
  },
  'deleteMessages'(token) {
    check(token, String);
    const chat = Chats.findOne({ $or: [{ me: token }, { you: token }] });
    if (!chat) {
      throw new Meteor.Error(404, 'Chat not found');
    }
    return Chats.update({ _id: chat._id }, {
      $unset: { messages: '' },
      $set: { deleted: true },
    });
  },
  'getCounters'() {
    const chatsCount = Chats.find({}).count();
    const messagesPromise = Chats.aggregate([
      {
        $group: {
          _id: 'all',
          messagesCount: { $sum: '$counter' },
        },
      },
    ]).toArray();
    return messagesPromise.then((messages) => {
      return {
        chatsCount,
        messagesCount: messages[0].messagesCount,
      };
    });
  },
});
