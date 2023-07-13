"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoute_1 = __importDefault(require("./src/routes/userRoute"));
const apiRoute_1 = __importDefault(require("./src/routes/apiRoute"));
const authRoute_1 = __importDefault(require("./src/routes/authRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 8000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const uri = process.env.DB_URI;
const d = process.env.POSTMARK_API_TOKEN;
//init routes
app.use("/u", userRoute_1.default);
app.use("/api", apiRoute_1.default);
app.use("/auth", authRoute_1.default);
// Connect to MongoDB
mongoose_1.default.connect(uri).then(() => {
    console.log("Connected to MongoDB");
}).catch;
