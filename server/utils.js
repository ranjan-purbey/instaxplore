const fs = require('fs');

const config = JSON.parse(fs.readFileSync(__dirname + '/config.json'))[process.env.NODE_ENV || 'development'];

const stripHtml = (html = '') => html.replace(/(<([^>]+)>)/ig, '');

const randomString = (size = 10) => new Array(size).fill(null).map(() => parseInt(Math.random()*35).toString(36))
  .map(c => Math.random() < .5 ? c : c.toUpperCase()).join('');

module.exports = {
  config,
  stripHtml,
  randomString
}
