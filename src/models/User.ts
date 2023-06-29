import mongoose, { Document, Schema, Types } from "mongoose";
import crypto from "crypto";

interface IUser extends Document {
  firstName: string;
  lastName: string;
  organizationName?: string;
  email: string;
  password: string;
  gender?: string;
  phoneNumber?: string;
  birthday: string;
  username: string;
  photo?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  registrationTokens: string[];
  botId: Types.ObjectId[];
  createPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    organizationName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String },
    phoneNumber: { type: String },
    birthday: { type: String },
    username: { type: String },
    photo: { type: String },
    botId: [{ type: mongoose.Schema.Types.ObjectId }],
    registrationTokens: [{ type: String }],
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(4).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
