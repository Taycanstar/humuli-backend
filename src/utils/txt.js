"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyNumber = exports.sendVerificationCode = void 0;
// sms.ts
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const twilio_1 = __importDefault(require("twilio"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const accountSid = "ACe4baf33ea8a23b79c47e7dc64314cd4b";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAa99e23617a15e5aefc6808668698730e";
const client = (0, twilio_1.default)(accountSid, authToken);
const sendVerificationCode = (number) => {
    return client.verify.v2
        .services(verifySid)
        .verifications.create({ to: number, channel: "sms" });
};
exports.sendVerificationCode = sendVerificationCode;
const verifyNumber = (number, otpCode) => {
    return client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: number, code: otpCode });
};
exports.verifyNumber = verifyNumber;
