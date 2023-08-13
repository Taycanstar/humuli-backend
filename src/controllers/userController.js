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
const Confirmation_1 = __importDefault(require("../models/Confirmation"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto_1 = __importDefault(require("crypto"));
const email_1 = __importDefault(require("../utils/email"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const txt_1 = require("../utils/txt");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
exports.userController = {
    checkEmailEdsxists: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        try {
            let user = yield User_1.default.findOne({ email });
            if (user) {
                return res.status(400).json({ message: "User already exists" });
            }
            res.status(200).send({
                message: "Email is valid",
            });
            console.log("success");
        }
        catch (error) {
            res.status(500).send({ message: "Request failed" });
        }
    }),
    signup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password, firstName, lastName, birthday, phoneNumber } = req.body;
        try {
            const confirmationToken = crypto_1.default.randomBytes(20).toString("hex");
            const hashedPassword = yield bcrypt.hash(password, 10);
            const confirmation = new Confirmation_1.default({
                email,
                hashedPassword,
                confirmationToken,
            });
            yield confirmation.save();
            const emailBody = `To continue setting up your Humuli account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/auth/onboarding/details?token=${confirmationToken}`;
            yield (0, email_1.default)({
                email: email,
                subject: "Humuli - Verify your email",
                message: emailBody,
            });
            // Instead of creating the user here, you might want to do it when the user clicks the link in the email.
            // However, if you want to proceed with this flow, then you can continue and send a single response after the user creation.
            const user = new User_1.default({
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                birthday,
            });
            yield user.save();
            // Create and return a JWT token for the user after successful signup
            const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
                expiresIn: "1h",
            });
            res.status(200).json({
                token,
                message: "User created and authenticated successfully",
            });
        }
        catch (error) {
            console.error("Failed to signup", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to create user" });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password, registrationToken } = req.body;
        try {
            let user = yield User_1.default.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Email doesn't exist" });
            }
            const isMatch = yield bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Password is incorrect" });
            }
            if (registrationToken) {
                if (!user.registrationTokens ||
                    !user.registrationTokens.includes(registrationToken)) {
                    yield User_1.default.findByIdAndUpdate(user._id, {
                        registrationTokens: user.registrationTokens
                            ? [...user.registrationTokens, registrationToken]
                            : [registrationToken],
                    });
                }
            }
            const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
                expiresIn: "1h",
            });
            return res.status(200).json({ token });
        }
        catch (error) {
            console.log(error);
        }
    }),
    confirmUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { confirmationToken, email, hashedPassword } = req.body;
        // Retrieve the confirmation document from the Confirmation collection
        const confirmation = yield Confirmation_1.default.findOne({ confirmationToken });
        if (!confirmation) {
            return res.status(404).send({ message: "Confirmation token not found" });
        }
        // Check if the email and hashedPassword match the confirmation document
        if (confirmation.email !== email ||
            confirmation.hashedPassword !== hashedPassword) {
            return res
                .status(401)
                .send({ message: "Invalid confirmation token, email, or password" });
        }
        const user = yield User_1.default.findOne({ email });
        try {
        }
        catch (error) {
            console.error("Failed to create user", JSON.stringify(error, null, 2));
            return res.status(500).send({ message: "Failed to create user" });
        }
        // Delete the confirmation document from the Confirmation collection
        yield Confirmation_1.default.deleteOne({ confirmationToken });
        res.status(200).send({ message: "User confirmed and created", user });
    }),
    checkUserExists: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email } = req.query;
            const user = yield User_1.default.findOne({ email });
            if (user) {
                res.status(200).json({ exists: true, user });
            }
            else {
                res.status(200).json({ exists: false });
            }
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while checking if the user exists.",
            });
        }
    }),
    checkEmailExists: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            const user = yield User_1.default.findOne({ email });
            if (user) {
                return res.status(400).json({ message: "User already exists" });
            }
            res.status(200).send({
                message: "Email is valid",
            });
        }
        catch (error) {
            res.status(500).json({
                error: "An error occurred while checking if the user exists.",
            });
        }
    }),
    resendConfirmation: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        // Check if user already exists
        let user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: "User does not exist" }] });
        }
        // Generate a confirmation token
        const confirmationToken = crypto_1.default.randomBytes(20).toString("hex");
        // Get the hashed password from the existing user
        const hashedPassword = user.password;
        // Save the confirmation token, email, and hashed password in a temporary storage
        const confirmation = new Confirmation_1.default({
            email,
            hashedPassword,
            confirmationToken,
        });
        yield confirmation.save();
        // Send the confirmation email
        const emailBody = `To continue setting up your Humuli account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;
        try {
            yield (0, email_1.default)({
                email: email,
                subject: "Qubemind - Verify your email",
                message: emailBody,
            });
            res.status(200).send({
                message: "Confirmation email resent. Please check your email.",
            });
            console.log("success");
        }
        catch (error) {
            console.error("Failed to send confirmation email", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to send confirmation email" });
        }
    }),
    sendCode: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { phoneNumber } = req.body;
        try {
            const response = yield (0, txt_1.sendVerificationCode)(phoneNumber);
            res.status(200).send({ message: "Verification code sent." });
        }
        catch (error) {
            console.error("Failed to send verification code", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to send verification code" });
        }
    }),
    confirmPhoneNumber: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { phoneNumber, otpCode } = req.body;
        try {
            const response = yield (0, txt_1.verifyNumber)(phoneNumber, otpCode);
            if (response.status === "approved") {
                res.status(200).send({ message: "Phone number verified." });
            }
            else {
                res.status(400).send({ message: "Invalid verification code." });
            }
        }
        catch (error) {
            console.error("Failed to verify phone number", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to verify phone number" });
        }
    }),
    resendCode: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { phoneNumber } = req.body;
        try {
            yield (0, txt_1.sendVerificationCode)(phoneNumber);
            res.status(200).send({ message: "Verification code resent." });
        }
        catch (error) {
            console.error("Failed to resend verification code", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to resend verification code" });
        }
    }),
    forgotPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        try {
            let user = yield User_1.default.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            // Generate a one-time code
            const otp = Math.floor(100000 + Math.random() * 900000); // generates a six digit number
            const confirmation = new Confirmation_1.default({
                email,
                confirmationToken: otp,
            });
            yield confirmation.save();
            // Send the OTP email
            const emailBody = `Your Qubemind one-time password (OTP) is: <b>${otp}</b>`;
            yield (0, email_1.default)({
                email: email,
                subject: "Qubemind - Reset your password",
                message: emailBody,
            });
            res.status(200).send({ message: "OTP sent. Please check your email." });
            console.log("success");
        }
        catch (error) {
            console.error("Failed to send OTP", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to send OTP" });
        }
    }),
    confirmOtp: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { confirmationToken, email } = req.body;
        // Retrieve the confirmation document from the Confirmation collection
        const confirmation = yield Confirmation_1.default.findOne({ confirmationToken });
        if (!confirmation) {
            return res.status(404).send({ message: "Confirmation token not found" });
        }
        // Check if the email and hashedPassword match the confirmation document
        if (confirmation.email !== email) {
            return res
                .status(401)
                .send({ message: "Invalid confirmation token, email, or password" });
        }
        let user = yield User_1.default.findOne({ email });
        // Delete the confirmation document from the Confirmation collection
        yield Confirmation_1.default.deleteOne({ confirmationToken });
        res.status(200).send({ message: "Otp confirmed", user });
    }),
    resendOtp: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        // Check if user already exists
        let user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: "User does not exist" }] });
        }
        // Generate a confirmation token
        const confirmationToken = crypto_1.default.randomBytes(20).toString("hex");
        // Get the hashed password from the existing user
        const hashedPassword = user.password;
        // Save the confirmation token, email, and hashed password in a temporary storage
        const confirmation = new Confirmation_1.default({
            email,
            hashedPassword,
            confirmationToken,
        });
        yield confirmation.save();
        // Send the confirmation email
        const emailBody = `To continue setting up your Qubemind account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;
        try {
            yield (0, email_1.default)({
                email: email,
                subject: "Qubemind - Verify your email",
                message: emailBody,
            });
            res.status(200).send({
                message: "Confirmation email resent. Please check your email.",
                user,
            });
            console.log("success");
        }
        catch (error) {
            console.error("Failed to send confirmation email", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to send confirmation email" });
        }
    }),
    changePassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { password } = req.body;
        try {
            const user = yield User_1.default.findByIdAndUpdate(req.params.id, {
                password,
            }, { new: true });
            console.log(user, "success");
            res.status(201).send({ message: "Password changed succesfully." });
        }
        catch (error) {
            res.status(500).send({ message: "Failed to change password" });
            console.log(error);
        }
    }),
};
