import redis from "../config/redis.js";

export const storeOTP = async (email, otp) => {
  await redis.set(`otp:${email}`, otp, "EX", 300); // 5 min
};

export const verifyOTP = async (email, otp) => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp || storedOtp !== otp.toString()) {
    throw new Error("Invalid or expired OTP");
  }

  await redis.del(`otp:${email}`);
  return true;
};
