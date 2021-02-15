module.exports = (currentBalance, update) => {
  if (!currentBalance && !update) {
    return 0;
  }

  if (typeof update !== "number") {
    throw new Error("Expected valid number");
  }

  if (!currentBalance) {
    return update;
  }

  if (!update) {
    return currentBalance;
  }

  return currentBalance + update;
};
