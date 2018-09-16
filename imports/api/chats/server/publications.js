// All chats-related publications
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Chats from '../collection.js';

Meteor.publish('chat', (token) => {
  check(token, String);
  return Chats.find({ $or: [{ me: token }, { you: token }] });
});
