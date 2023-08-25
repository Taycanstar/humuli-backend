"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const requireLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("Authorization header missing");
            return res.status(400).json({ message: "Unauthorized: Token missing" });
        }
        const tokenParts = authHeader.split(" ");
        if (tokenParts.length !== 2) {
            console.log("Token format is incorrect");
            return res
                .status(400)
                .json({ message: "Unauthorized: Token format is incorrect" });
        }
        const token = tokenParts[1];
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        }
        catch (err) {
            console.error("Token verification failed:", err.message);
            return res
                .status(401)
                .json({ message: "Unauthorized: Token is invalid" });
        }
        const user = yield User_1.default.findById(payload._id);
        if (!user) {
            console.log("User with given ID not found");
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Unexpected error in requireLogin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.requireLogin = requireLogin;
