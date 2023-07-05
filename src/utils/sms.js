"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const twilio_1 = __importDefault(require("twilio"));
const readline_1 = require("readline");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const accountSid = "ACe4baf33ea8a23b79c47e7dc64314cd4b";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAa99e23617a15e5aefc6808668698730e";
const client = (0, twilio_1.default)(accountSid, authToken);
client.verify.v2
    .services(verifySid)
    .verifications.create({ to: "+1", channel: "sms" })
    .then((verification) => console.log(verification.status))
    .then(() => {
    const readline = (0, readline_1.createInterface)({
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
