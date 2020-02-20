const fs = require('fs');

const config = JSON.parse(fs.readFileSync(__dirname + '/config.json'))[process.env.NODE_ENV || 'development'];

module.exports = {
  config
}
