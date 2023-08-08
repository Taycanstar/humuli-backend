import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const accountSid = "AC2fd7cab6ba937e8385a3e16101551271";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VA79d86b957d5a71f27d7b1da9e01e2f81";
const client = require("twilio")(accountSid, authToken);

client.verify.v2
  .services(verifySid)
  .verifications.create({ to: "+18632701870", channel: "sms" })
  .then((verification: any) => console.log(verification.status))
  .then(() => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    readline.question("Please enter the OTP:", (otpCode: any) => {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: "+18632701870", code: otpCode })
        .then((verification_check: any) =>
          console.log(verification_check.status)
        )
        .then(() => readline.close());
    });
  });
