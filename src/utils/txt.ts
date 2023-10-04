// sms.ts
import dotenv from "dotenv";
import path from "path";
import twilio from "twilio";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const accountSid = "AC19b6c353cf189d17546df9b1e701f384";
const authToken: string | undefined = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAd28020f6071a8321695bba3698575001";
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
