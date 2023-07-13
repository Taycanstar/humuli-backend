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
exports.apiController = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
exports.apiController = {
    getUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield User_1.default.find({});
            console.log("Data: ", users);
            res.json(users);
        }
        catch (error) {
            console.error("Failed to fetch users", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to fetch users" });
        }
    }),
    getUserById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        try {
            const user = yield User_1.default.findById(id);
            res.json(user);
        }
        catch (error) {
            console.log("error: ", error);
            res.status(500).send({ message: "Failed to fetch user" });
        }
    }),
    getUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // req.user should contain the currently logged-in user object
            res.json(req.user);
        }
        catch (error) {
            console.log("error: ", error);
            res.status(500).send({ message: "Failed to fetch user" });
        }
    }),
    updateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        try {
            const user = yield User_1.default.findByIdAndUpdate(id, { username: req.body.username }, { new: true });
            res.json(user);
        }
        catch (error) {
            console.log("error: ", error);
            res.status(500).send({ message: "Failed to update user" });
        }
    }),
    getUserByValue: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { value } = req.query;
            const user = (yield User_1.default.findOne({ email: value })) ||
                (yield User_1.default.findOne({ username: value }));
            if (user) {
                res.status(200).json({ user });
            }
            else {
                res.status(404).json({ message: "User not found" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch user by email" });
        }
    }),
};
