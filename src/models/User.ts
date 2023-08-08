import mongoose, { Date, Document, Schema, Types } from "mongoose";
import crypto from "crypto";

interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email: string;
  password: string;
  gender?: string;
  phoneNumber?: string;
  birthday?: string;
  username?: string;
  photo?: string;
  registrationTokens?: string[];
  emailVerified?: boolean;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    organizationName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String },
    phoneNumber: { type: String },
    birthday: { type: String },
    username: { type: String },
    photo: { type: String },
    registrationTokens: [{ type: String }],
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
