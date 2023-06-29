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
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 8000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const uri = process.env.DB_URI;
//init routes
app.use("/u", userRoute_1.default);
// Connect to MongoDB
mongoose_1.default
    .connect(uri)
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((error) => {
    console.error("Error connecting to MongoDB", error);
});
app.get("/", (req, res) => {
    res.send("Hello, world!");
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
