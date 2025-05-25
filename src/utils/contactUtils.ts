
export const maskLastName = (lastName: string) => {
  if (!lastName) return '';
  return lastName.charAt(0) + '*'.repeat(lastName.length - 1);
};

export const maskPhoneNumber = (phone: string) => {
  if (!phone || phone.length < 4) return phone;
  const lastFour = phone.slice(-4);
  const maskedPart = '*'.repeat(phone.length - 4);
  return maskedPart + lastFour;
};
