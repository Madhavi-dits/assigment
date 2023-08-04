
export const otp = Math.floor(1000 + Math.random() * 9000).toString();
export const otpExpiration = new Date(Date.now() + (5 * 60 * 1000));
export const message = `Your login OTP is: ${otp} and valid for 5 minutes.`;
export const currentTime = new Date().getTime();
export const time = currentTime.toString();

export const expiryDays = 90;
export const expiryPasswordDays = 97;
export const today = new Date();

export const expiryDate = new Date(today.getTime() - expiryDays * 24 * 60 * 60 * 1000);
export const expiryPasswordDate = new Date(today.getTime() - expiryPasswordDays * 24 * 60 * 60 * 1000);

