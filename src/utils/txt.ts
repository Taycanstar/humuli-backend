// sms.ts
import dotenv from "dotenv";
import path from "path";
import twilio from "twilio";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const accountSid = "AC2fd7cab6ba937e8385a3e16101551271";
const authToken: string | undefined = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VA79d86b957d5a71f27d7b1da9e01e2f81";
const client = twilio(accountSid, authToken);

export const sendVerificationCode = (number: string) => {
  return client.verify.v2.services(verifySid).verifications.create({
    to: number,
    channel: "sms",
  });
};

export const verifyNumber = (number: string, otpCode: string) => {
  return client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: number, code: otpCode });
};
