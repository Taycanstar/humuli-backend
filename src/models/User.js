"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const HistorySchema = new mongoose_1.Schema({
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
const LapSchema = new mongoose_1.Schema({
    name: String,
    time: Number,
});
const SessionSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
const TaskSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
const AnalyticsSchema = new mongoose_1.Schema({
    dailyDuration: Number,
    weeklyDuration: Number,
    yearlyDuration: Number,
    mostActiveDay: String,
    mostFrequentTask: String,
});
const userSchema = new mongoose_1.Schema({
    deviceId: { type: String, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    organizationName: { type: String },
    email: { type: String },
    password: { type: String },
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
        stats: { type: mongoose_1.Schema.Types.Mixed },
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
    emailVerificationToken: { type: String },
    productsUsed: [{ type: String }],
}, { timestamps: true });
function arrayLimit(val) {
    return val.length <= 4;
}
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
