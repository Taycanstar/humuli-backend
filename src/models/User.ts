import mongoose, { Date, Document, Schema, Types } from "mongoose";
import crypto from "crypto";

const HistorySchema = new Schema({
  action: {
    type: String,
    enum: ["start", "pause", "stop", "resume", "lap"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const LapSchema = new Schema({
  name: String,
  time: Number,
});

const SessionSchema = new Schema(
  {
    startTime: Number,
    totalDuration: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["running", "paused", "stopped"],
      default: "stopped",
    },
    laps: [LapSchema],
    history: [HistorySchema],
    breaks: { type: Number, default: 0 },
    timeSpentOnBreaks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TaskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    goal: {
      type: Number,
    },
    color: {
      type: String,
    },
    sessions: [SessionSchema],
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    activeDays: [{ type: Date }],
    fastestLap: { type: Number, default: Infinity },
    slowestLap: { type: Number, default: 0 },
    breaks: { type: Number, default: 0 },
    timeSpentOnBreaks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AnalyticsSchema = new Schema({
  dailyDuration: Number,
  weeklyDuration: Number,
  yearlyDuration: Number,
  mostActiveDay: String,
  mostFrequentTask: String,
});

interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  subscription?: string;
  email: string;
  password: string;
  gender?: string;
  phoneNumber?: string;
  birthday?: string;
  username?: string;
  photo?: string;
  registrationTokens?: string[];
  emailVerified?: boolean;
  moodmotifData?: {
    mood: string;
    stats: any;
  };
  maxtickerData?: {
    tasks: any[];
    history: any[];
    analytics: any;
  };
  productsUsed: string[];
  _id?: Types.ObjectId;
  refreshTokens?: string[];
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
    subscription: { type: String },
    emailVerified: { type: Boolean, default: false },
    moodmotifData: {
      mood: { type: String },
      stats: { type: Schema.Types.Mixed },
    },
    refreshTokens: [{ type: String }],

    maxtickerData: {
      tasks: {
        type: [TaskSchema],
        validate: [arrayLimit, "{PATH} exceeds the limit of 4 timers"],
      },
      history: [HistorySchema],
      analytics: AnalyticsSchema,
    },
    productsUsed: [{ type: String }],
  },
  { timestamps: true }
);

function arrayLimit(val: any[]) {
  return val.length <= 4;
}

const User = mongoose.model<IUser>("User", userSchema);

export default User;
export { IUser };
