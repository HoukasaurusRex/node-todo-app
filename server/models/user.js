const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minLength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
}
UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({_id: user._id.toHexString(), access}, 'secretsauce').toString();
  const arr = [];

  user.tokens = arr.concat([{ access, token }]);
  console.log('Saving user...', user);
  return user.save().then(() => token);
};
UserSchema.statics.findByToken = function(token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, 'secretsauce');
  } catch (err) {
    return Promise.reject();
  }
  return User.findById({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
}
const User = mongoose.model('User', UserSchema);

module.exports = { User }

// NOTE: .methods creates methods on model instances, while .statics creates model methods
