"use strict";
// models/MoodmotifUser.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const User_1 = __importDefault(require("./User"));
const moodmotifSchema = new mongoose_1.Schema({
    moodData: { type: String }, // replace with your specific fields
});
const MoodmotifUser = User_1.default.discriminator("Moodmotif", moodmotifSchema);
exports.default = MoodmotifUser;
