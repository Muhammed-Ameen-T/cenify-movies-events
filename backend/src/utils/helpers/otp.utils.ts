/**
 * Generates a random numeric OTP (One-Time Password) of the specified length.
 *
 * @param {number} n - The desired length of the OTP.
 * @returns {string} A randomly generated OTP of `n` digits.
 */
export function generateOtp(n: number): string {
  let otp = '';
  for (let i = 0; i < n; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp.toString();
}
