import fs from 'fs';
import path from 'path';

const Handlebars = require('handlebars');
const mjml2html = require('mjml');

const MJML = class MJML {
  constructor(file) {
    const folder = path.dirname(file);
    this.file = file;
    this.mjml = fs.readFileSync(file, 'utf8');
    const files = fs.readdirSync(folder);
    files.forEach(function (val) {
      const completePath = path.join(folder, val);
      const chunks = val.split('.');
      if (fs.statSync(completePath).isFile() && chunks.length > 0 && chunks[1] == "mjml") {
        const name = chunks[0];
        Handlebars.registerPartial(name, fs.readFileSync(completePath, 'utf8'));
      }
    });
  }

  helpers(object) {
    this.helpers = object;
  }

  compile() {
    const text = Handlebars.compile(this.mjml)(this.helpers || {});
    return mjml2html(text);
  }

  send(mailOptions) {
    mailOptions.html = this.compile();
    Email.send(mailOptions);
  }
};

export default MJML;
