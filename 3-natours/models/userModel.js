const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an user name.'],
    trim: true,
    maxlength: [10, 'User name cannot be more than 10 characters.'],
    minlength: [2, 'User name cannot be less than 3 characters.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address.'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    match: [
      passwordRegex,
      'It must contain at least one lowercase letter.\nIt must contain at least one uppercase letter.\nIt must contain at least one digit.\nIt must contain at least one special character from the set [@$!%*?&].\nIt must be at least 8 characters in length.',
    ],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// password encryption
userSchema.pre('save', async function (next) {
  // monitor if the password has been changed
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // removed this after the original password has encrypted
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // sometimes that token might signed before this
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query

  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires =
    Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN, 10);

  console.log(
    { resetToken: resetToken },
    this.passwordResetToken,
    this.passwordResetExpires,
  );

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
