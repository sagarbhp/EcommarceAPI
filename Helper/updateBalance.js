module.exports = (currentBalance, update) => {
  if (!currentBalance && !update) {
    return 0;
  }

  if (!currentBalance) {
    return update;
  }

  if (!update) {
    return currentBalance;
  }

  return currentBalance + update;
};
