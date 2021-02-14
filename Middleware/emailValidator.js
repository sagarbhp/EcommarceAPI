var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

module.exports = (testEmail) => {
  if (!testEmail) {
    return false;
  }

  if (testEmail.length > 200) {
    return false;
  }

  if (emailRegex.test(testEmail)) {
    return true;
  }

  return false;
};
