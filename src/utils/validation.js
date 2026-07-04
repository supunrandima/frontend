export const isValidSriLankanMobileNumber = (number) => {
  // Checks if the number is exactly 10 digits and starts with 07
  const regex = /^07\d{8}$/;
  return regex.test(number);
};
