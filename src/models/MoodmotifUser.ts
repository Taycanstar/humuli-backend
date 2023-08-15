// models/MoodmotifUser.ts

import mongoose, { Schema } from "mongoose";
import User, { IUser } from "./User";

interface IMoodmotifUser extends IUser {
  moodData?: any; // replace with your specific fields
}

const moodmotifSchema = new Schema<IMoodmotifUser>({
  moodData: { type: String }, // replace with your specific fields
});

const MoodmotifUser = User.discriminator<IMoodmotifUser>(
  "Moodmotif",
  moodmotifSchema
);

export default MoodmotifUser;
