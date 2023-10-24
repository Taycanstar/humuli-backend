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
                return res.status(400).json({ message: "User already exists " });
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
        const { email, password, firstName, lastName, birthday, phoneNumber, productType, } = req.body;
        try {
            // Check if user already exists
            const existingUser = yield User_1.default.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already registered " });
            }
            const emailVerificationToken = crypto_1.default.randomBytes(20).toString("hex");
            const hashedPassword = yield bcrypt.hash(password, 10);
            const userData = {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                birthday,
                productsUsed: [productType],
                refreshTokens: [],
                subscription: "standard",
                emailVerificationToken,
            };
            switch (productType) {
                case "Moodmotif":
                    userData.moodData = {};
                    break;
                case "Maxticker":
                    userData.cronoverseData = {};
                    break;
                // ... handle other product types similarly
            }
            const newUser = new User_1.default(userData);
            yield newUser.save();
            const confirmationToken = crypto_1.default.randomBytes(20).toString("hex");
            const confirmation = new Confirmation_1.default({
                email,
                hashedPassword,
                confirmationToken,
            });
            yield confirmation.save();
            const emailBody = `To verify your new email, please click the following link: ${process.env.SERVER_URL}/u/verify-email?token=${emailVerificationToken}`;
            yield (0, email_1.default)({
                email: email,
                subject: "Maxticker - Verify your email",
                message: emailBody,
            });
            const token = jwt.sign({ _id: newUser._id }, process.env.SECRET, { expiresIn: "3650d" });
            yield newUser.save();
            res.status(200).json({
                token,
                createdAt: newUser.createdAt,
                user: newUser,
                message: "User created and authenticated successfully",
            });
        }
        catch (error) {
            console.error("Error during signup:", error === null || error === void 0 ? void 0 : error.message, error === null || error === void 0 ? void 0 : error.stack);
            res
                .status(500)
                .send({ message: "Failed to create user", error: error.message });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password, registrationToken, productType } = req.body;
        const MAX_REFRESH_TOKENS = 5; // Set your desired limit
        try {
            let user = (yield User_1.default.findOne({ email }));
            if (!user) {
                return res.status(400).json({ message: "User doesn't exist" });
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
            if (!user.productsUsed.includes(productType)) {
                user.productsUsed.push(productType);
                yield user.save();
            }
            const token = jwt.sign({ _id: user._id }, process.env.SECRET, {
                expiresIn: "3650d",
            });
            // const refreshToken = jwt.sign(
            //   { _id: user._id },
            //   process.env.REFRESH_SECRET as string,
            //   {
            //     expiresIn: "365d",
            //   }
            // );
            // Limit the number of refresh tokens
            if (user.refreshTokens &&
                user.refreshTokens.length >= MAX_REFRESH_TOKENS) {
                user.refreshTokens.shift(); // Remove the oldest token
            }
            // user.refreshTokens?.push(refreshToken);
            yield user.save();
            return res.status(200).json({
                token,
                createdAt: user.createdAt,
                user: user,
                // , refreshToken
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Server error" });
        }
    }),
    refreshToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        }
        catch (err) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        const user = yield User_1.default.findById(decoded._id);
        if (!user || !((_a = user.refreshTokens) === null || _a === void 0 ? void 0 : _a.includes(refreshToken))) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        const newAccessToken = jwt.sign({ _id: user._id }, process.env.SECRET, {
            expiresIn: "1h",
        });
        res.json({ token: newAccessToken });
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
        const emailBody = `To continue setting up your Maxticker account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;
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
            const emailBody = `Your Maxticker one-time password (OTP) is: <b>${otp}</b>`;
            yield (0, email_1.default)({
                email: email,
                subject: "Maxticker - Reset your password",
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
            return res.status(404).send({ message: "OTP is incorrect" });
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
        const emailBody = `To continue setting up your Maxticker account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;
        try {
            yield (0, email_1.default)({
                email: email,
                subject: "Maxticker - Verify your email",
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
    setNewPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        const hashedPassword = yield bcrypt.hash(password, 10);
        try {
            const user = yield User_1.default.findOneAndUpdate({ email: email }, // filter by email
            { password: hashedPassword }, // update password
            { new: true } // return the updated document
            );
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(201).send({ message: "Password changed successfully." });
        }
        catch (error) {
            console.error("Failed to change password", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to change password" });
        }
    }),
    getSubscription: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const userId = (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id;
        try {
            let user = yield User_1.default.findById(userId);
            if (!user || !user.subscription)
                return res.status(400).json({ message: "User or user data not found" });
            res.status(200).send(user.subscription);
        }
        catch (error) {
            console.error("Failed to fetch subscription ", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to change password" });
        }
    }),
    editProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { firstName, lastName } = req.body;
        try {
            const user = yield User_1.default.findByIdAndUpdate(req.params.id, {
                firstName,
                lastName,
            }, { new: true });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(201).send({ message: "Edit successfully." });
        }
        catch (error) {
            console.error("Failed to edit profile", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to edit profile" });
        }
    }),
    changeEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const id = req.params.id;
        try {
            // Check if the new email is already in use
            const existingUser = yield User_1.default.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
            // Generate a verification token
            const emailVerificationToken = crypto_1.default.randomBytes(20).toString("hex");
            // Update the user's document with the new email and verification token
            // But don't set the email as verified yet
            const user = yield User_1.default.findByIdAndUpdate(id, {
                email: email,
                emailVerificationToken,
                emailVerified: false,
            }, { new: true });
            // Send the verification email
            const emailBody = `To verify your new email, please click the following link: ${process.env.SERVER_URL}/u/verify-email?token=${emailVerificationToken}`;
            yield (0, email_1.default)({
                email: email,
                subject: "Maxticker - Verify your new email",
                message: emailBody,
            });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(201).send({
                message: "Verification email sent. Please check your new email to confirm the change.",
            });
        }
        catch (error) {
            console.error("Failed to change email", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to change email" });
        }
    }),
    verifyEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.query.token;
        if (!token) {
            return res.status(400).send("Token is required.");
        }
        // Find a user with the matching token
        const user = yield User_1.default.findOne({ emailVerificationToken: token });
        if (!user) {
            return res
                .status(400)
                .send("Invalid verification link or token has expired.");
        }
        // Mark email as verified and clear the token
        user.emailVerified = true;
        user.emailVerificationToken = undefined; // Clear the token
        yield user.save();
        res.send("Email verified successfully!");
    }),
    changeProfilePassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { oldPassword, password } = req.body;
        const id = req.params.id;
        console.log("Received oldPassword (plaintext):", oldPassword);
        console.log("body ", req.body);
        try {
            const user = yield User_1.default.findById(id);
            console.log("Stored password (hashed):", user === null || user === void 0 ? void 0 : user.password);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            // Check if oldPassword matches the user's current password
            const isMatch = yield bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            }
            const hashedPassword = yield bcrypt.hash(password, 10);
            yield User_1.default.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
            res.status(201).send({ message: "Password changed successfully." });
        }
        catch (error) {
            console.error("Failed to change password", JSON.stringify(error, null, 2));
            res.status(500).send({ message: "Failed to change password" });
        }
    }),
};
