import dotenv from "dotenv";
import path from "path";
import twilio from "twilio";
import { ReadLine, createInterface } from "readline";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const accountSid = "ACe4baf33ea8a23b79c47e7dc64314cd4b";
const authToken: string | undefined = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAa99e23617a15e5aefc6808668698730e";
const client = twilio(accountSid, authToken);

client.verify.v2
  .services(verifySid)
  .verifications.create({ to: "+1", channel: "sms" })
  .then((verification) => console.log(verification.status))
  .then(() => {
    const readline: ReadLine = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    readline.question("Please enter the OTP:", (otpCode: string) => {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: "+18632701870", code: otpCode })
        .then((verification_check) => console.log(verification_check.status))
        .then(() => readline.close());
    });
  });
