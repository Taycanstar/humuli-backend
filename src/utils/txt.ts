// sms.ts
import dotenv from "dotenv";
import path from "path";
import twilio from "twilio";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const accountSid = "ACe4baf33ea8a23b79c47e7dc64314cd4b";
const authToken: string | undefined = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAa99e23617a15e5aefc6808668698730e";
const client = twilio(accountSid, authToken);

export const sendVerificationCode = (number: string) => {
  return client.verify.v2
    .services(verifySid)
    .verifications.create({ to: number, channel: "sms" });
};

export const verifyNumber = (number: string, otpCode: string) => {
  return client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: number, code: otpCode });
};
