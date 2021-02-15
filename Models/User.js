const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  shippingAddress: {
    line1: {
      type: String,
      required: true,
    },
    line2: String,
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  balance: Number,
  isOwner: Boolean,
  storeIDs: [String],
});

// //before saving new user information this method will hash the user password with bcrypt
// userSchema.pre("save", function (next) {
//   const user = this;
//   if (!user.isModified("password")) {
//     return next();
//   }

//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) {
//       return next(err);
//     }
//     bcrypt.hash(user.password, salt, (err, hashed) => {
//       if (err) {
//         return next();
//       }
//       user.password = hashed;
//       next();
//     });
//   });
// });

//Method to compare password when user tries to login with username and password
userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      if (!isMatch) {
        return reject(err);
      }
      resolve(true);
    });
  });
};

mongoose.model("User", userSchema);

module.exports = userSchema;
