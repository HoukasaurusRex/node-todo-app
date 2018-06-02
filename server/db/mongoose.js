const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://jt.houk:X63sB\!DGuhRyycr*@ds245250.mlab.com:45250/playground');

module.exports = { mongoose }
