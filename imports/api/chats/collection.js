// Definition of the Chats collection
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Chats = new Mongo.Collection('chats');

Chats.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

const messageSchema = new SimpleSchema({
  from: {
    type: String,
  },
  text: {
    type: String,
  },
  date: {
    type: Date,
  },
});

const ChatSchema = new SimpleSchema({
  me: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  you: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  messages: {
    type: Array,
    optional: true,
  },
  'messages.$': {
    type: messageSchema,
  },
  counter: {
    type: Number,
    optional: true,
  },
  deleted: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date();
      }
    },
    optional: true,
  },
});

Chats.attachSchema(ChatSchema);

export default Chats;
