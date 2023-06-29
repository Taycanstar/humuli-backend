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
exports.userController = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
exports.userController = {
    signup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password, birthday, username, phoneNumber, firstName, lastName, organizationName, } = req.body;
        try {
            // Check if user already exists
            let user = (yield User_1.default.findOne({ email })) || (yield User_1.default.findOne({ username }));
            if (user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "User already exists" }] });
            }
            // Create a new user
            user = new User_1.default({
                email,
                password,
                birthday,
                username,
                phoneNumber,
                firstName,
                lastName,
                organizationName,
            }); // Assume you're saving plain password for simplicity
            // Save the user to the database
            yield user.save();
            res.status(200).send("User registered successfully");
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    }),
};
