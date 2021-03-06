const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      delete ret.passwordHash;
    }
  }
});

schema.virtual('password').set(function(password) {
  this.passwordHash = bcrypt.hashSync(password, 6);
});

schema.statics.authenticate = async function({ email, password }) {
  const user = await this.findOne({ email });
  if(!user) {
    const err = new Error('Invalid Email/Password');
    err.status = 401;
    throw err;
  }

  const validPassword = bcrypt.compareSync(password, user.passwordHash);
  if(!validPassword) {
    const err = new Error('Invalid Email/Password');
    err.status = 401;
    throw err;
  }
  return user;
};

schema.methods.authToken = function() {
  return jwt.sign(this.toJSON(), process.env.APP_SECRET, {
    expiresIn: '48h'
  });
};

module.exports = mongoose.model('User', schema);
