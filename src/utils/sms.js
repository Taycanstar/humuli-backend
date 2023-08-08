"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const accountSid = "AC2fd7cab6ba937e8385a3e16101551271";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VA79d86b957d5a71f27d7b1da9e01e2f81";
const client = require("twilio")(accountSid, authToken);
client.verify.v2
    .services(verifySid)
    .verifications.create({ to: "+18632701870", channel: "sms" })
    .then((verification) => console.log(verification.status))
    .then(() => {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    readline.question("Please enter the OTP:", (otpCode) => {
        client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: "+18632701870", code: otpCode })
            .then((verification_check) => console.log(verification_check.status))
            .then(() => readline.close());
    });
});
