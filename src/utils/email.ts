var postmark = require("postmark");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const api: string = process.env.POSTMARK_API_TOKEN!;

const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  // Send an email:
  var client = new postmark.ServerClient(api);

  client.sendEmail({
    From: "noreply@qubemind.com",
    To: options.email,
    Subject: options.subject,
    HtmlBody: options.message,
    TextBody: options.message,
    MessageStream: "onboarding",
  });
};

export default sendEmail;
