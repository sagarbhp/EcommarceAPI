const bcrypt = require("bcrypt");

module.exports = (password) => {
  let data = {};
  console.log("///////////////////////////////////////");

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      data.error = err;
      return;
    }
    bcrypt.hash(password, salt, (err, hashed) => {
      console.log("///////////////////////////////");
      if (err) {
        data.error = err;
        return;
      }
      data.hashed = hashed;
      return;
    });
  });
  return data;
};
