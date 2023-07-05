import mongoose, { Document, Schema } from "mongoose";

interface IConfirmation extends Document {
  email: string;
  hashedPassword: string;
  confirmationToken: string;
}

const ConfirmationSchema: Schema = new Schema({
  email: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  confirmationToken: { type: String, required: true },
});

export default mongoose.model<IConfirmation>(
  "Confirmation",
  ConfirmationSchema
);
