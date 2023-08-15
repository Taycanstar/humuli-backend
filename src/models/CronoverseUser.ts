// models/CronoverseUser.ts

import mongoose, { Schema } from "mongoose";
import User, { IUser } from "./User";

interface ICronoverseUser extends IUser {
  stopwatchData?: any; // replace with your specific fields
}

const cronoverseSchema = new Schema<ICronoverseUser>({
  stopwatchData: { type: String }, // replace with your specific fields
});

const CronoverseUser = User.discriminator<ICronoverseUser>(
  "Cronoverse",
  cronoverseSchema
);

export default CronoverseUser;
