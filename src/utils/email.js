"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var postmark = require("postmark");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const api = process.env.POSTMARK_API_TOKEN;
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // Send an email:
    var client = new postmark.ServerClient(api);
    client.sendEmail({
        From: "noreply@humuli.com",
        To: options.email,
        Subject: options.subject,
        HtmlBody: options.message,
        TextBody: options.message,
        MessageStream: "email-verification",
    });
});
exports.default = sendEmail;
