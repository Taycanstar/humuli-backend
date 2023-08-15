import { Request, Response } from "express";
import User from "../models/User";
import MoodmotifUser from "../models/MoodmotifUser";
import CronoverseUser from "../models/CronoverseUser";
import Confirmation from "../models/Confirmation";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
import crypto from "crypto";
import sendEmail from "../utils/email";
import dotenv from "dotenv";
import path from "path";
import { sendVerificationCode, verifyNumber } from "../utils/txt";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const userController = {
  checkEmailEdsxists: async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
      res.status(200).send({
        message: "Email is valid",
      });

      console.log("success");
    } catch (error) {
      res.status(500).send({ message: "Request failed" });
    }
  },

  signup: async (req: Request, res: Response) => {
    const {
      email,
      password,
      firstName,
      lastName,
      birthday,
      phoneNumber,
      productType,
    } = req.body;

    try {
      const confirmationToken = crypto.randomBytes(20).toString("hex");
      const hashedPassword = await bcrypt.hash(password, 10);

      const confirmation = new Confirmation({
        email,
        hashedPassword,
        confirmationToken,
      });

      await confirmation.save();

      const emailBody = `To continue setting up your Humuli account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/auth/onboarding/details?token=${confirmationToken}`;

      await sendEmail({
        email: email,
        subject: "Humuli - Verify your email",
        message: emailBody,
      });

      let newUser;
      const userData = {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        birthday,
      };

      switch (productType) {
        case "Moodmotif":
          newUser = new MoodmotifUser(userData);
          break;
        case "Cronoverse":
          newUser = new CronoverseUser(userData);
          break;
        default:
          newUser = new User(userData);
      }

      await newUser.save();

      // Create and return a JWT token for the user after successful signup
      const token = jwt.sign(
        { _id: newUser._id },
        process.env.SECRET as string,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({
        token,
        message: "User created and authenticated successfully",
      });
    } catch (error) {
      console.error("Failed to signup", JSON.stringify(error, null, 2));
      res.status(500).send({ message: "Failed to create user" });
    }
  },

  signup2: async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, birthday, phoneNumber } =
      req.body;

    try {
      const confirmationToken = crypto.randomBytes(20).toString("hex");
      const hashedPassword = await bcrypt.hash(password, 10);

      const confirmation = new Confirmation({
        email,
        hashedPassword,
        confirmationToken,
      });

      await confirmation.save();

      const emailBody = `To continue setting up your Humuli account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/auth/onboarding/details?token=${confirmationToken}`;

      await sendEmail({
        email: email,
        subject: "Humuli - Verify your email",
        message: emailBody,
      });

      // Instead of creating the user here, you might want to do it when the user clicks the link in the email.
      // However, if you want to proceed with this flow, then you can continue and send a single response after the user creation.

      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        birthday,
      });

      await user.save();
      // Create and return a JWT token for the user after successful signup
      const token = jwt.sign({ _id: user._id }, process.env.SECRET as string, {
        expiresIn: "1h",
      });

      res.status(200).json({
        token,
        message: "User created and authenticated successfully",
      });
    } catch (error) {
      console.error("Failed to signup", JSON.stringify(error, null, 2));
      res.status(500).send({ message: "Failed to create user" });
    }
  },

  login: async (req: Request, res: Response) => {
    const { email, password, registrationToken } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Email doesn't exist" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Password is incorrect" });
      }
      if (registrationToken) {
        if (
          !user.registrationTokens ||
          !user.registrationTokens.includes(registrationToken)
        ) {
          await User.findByIdAndUpdate(user._id, {
            registrationTokens: user.registrationTokens
              ? [...user.registrationTokens, registrationToken]
              : [registrationToken],
          });
        }
      }

      const token = jwt.sign({ _id: user._id }, process.env.SECRET as string, {
        expiresIn: "1h",
      });

      return res.status(200).json({ token });
    } catch (error) {
      console.log(error);
    }
  },

  confirmUser: async (req: Request, res: Response) => {
    const { confirmationToken, email, hashedPassword } = req.body;

    // Retrieve the confirmation document from the Confirmation collection
    const confirmation = await Confirmation.findOne({ confirmationToken });
    if (!confirmation) {
      return res.status(404).send({ message: "Confirmation token not found" });
    }

    // Check if the email and hashedPassword match the confirmation document
    if (
      confirmation.email !== email ||
      confirmation.hashedPassword !== hashedPassword
    ) {
      return res
        .status(401)
        .send({ message: "Invalid confirmation token, email, or password" });
    }

    const user = await User.findOne({ email });

    try {
    } catch (error) {
      console.error("Failed to create user", JSON.stringify(error, null, 2));
      return res.status(500).send({ message: "Failed to create user" });
    }

    // Delete the confirmation document from the Confirmation collection
    await Confirmation.deleteOne({ confirmationToken });

    res.status(200).send({ message: "User confirmed and created", user });
  },
  checkUserExists: async (req: Request, res: Response) => {
    try {
      const { email } = req.query;
      const user = await User.findOne({ email });
      if (user) {
        res.status(200).json({ exists: true, user });
      } else {
        res.status(200).json({ exists: false });
      }
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while checking if the user exists.",
      });
    }
  },
  checkEmailExists: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      res.status(200).send({
        message: "Email is valid",
      });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while checking if the user exists.",
      });
    }
  },
  resendConfirmation: async (req: Request, res: Response) => {
    const { email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User does not exist" }] });
    }

    // Generate a confirmation token
    const confirmationToken = crypto.randomBytes(20).toString("hex");

    // Get the hashed password from the existing user
    const hashedPassword = user.password;

    // Save the confirmation token, email, and hashed password in a temporary storage
    const confirmation = new Confirmation({
      email,
      hashedPassword,
      confirmationToken,
    });

    await confirmation.save();

    // Send the confirmation email
    const emailBody = `To continue setting up your Humuli account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;

    try {
      await sendEmail({
        email: email,
        subject: "Qubemind - Verify your email",
        message: emailBody,
      });

      res.status(200).send({
        message: "Confirmation email resent. Please check your email.",
      });

      console.log("success");
    } catch (error) {
      console.error(
        "Failed to send confirmation email",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to send confirmation email" });
    }
  },

  sendCode: async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    try {
      const response = await sendVerificationCode(phoneNumber);
      res.status(200).send({ message: "Verification code sent." });
    } catch (error) {
      console.error(
        "Failed to send verification code",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to send verification code" });
    }
  },

  confirmPhoneNumber: async (req: Request, res: Response) => {
    const { phoneNumber, otpCode } = req.body;
    try {
      const response = await verifyNumber(phoneNumber, otpCode);
      if (response.status === "approved") {
        res.status(200).send({ message: "Phone number verified." });
      } else {
        res.status(400).send({ message: "Invalid verification code." });
      }
    } catch (error) {
      console.error(
        "Failed to verify phone number",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to verify phone number" });
    }
  },
  resendCode: async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    try {
      await sendVerificationCode(phoneNumber);
      res.status(200).send({ message: "Verification code resent." });
    } catch (error) {
      console.error(
        "Failed to resend verification code",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to resend verification code" });
    }
  },
  forgotPassword: async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      // Generate a one-time code
      const otp = Math.floor(100000 + Math.random() * 900000); // generates a six digit number

      const confirmation = new Confirmation({
        email,
        confirmationToken: otp,
      });

      await confirmation.save();

      // Send the OTP email
      const emailBody = `Your Qubemind one-time password (OTP) is: <b>${otp}</b>`;

      await sendEmail({
        email: email,
        subject: "Qubemind - Reset your password",
        message: emailBody,
      });

      res.status(200).send({ message: "OTP sent. Please check your email." });

      console.log("success");
    } catch (error) {
      console.error("Failed to send OTP", JSON.stringify(error, null, 2));
      res.status(500).send({ message: "Failed to send OTP" });
    }
  },

  confirmOtp: async (req: Request, res: Response) => {
    const { confirmationToken, email } = req.body;

    // Retrieve the confirmation document from the Confirmation collection
    const confirmation = await Confirmation.findOne({ confirmationToken });
    if (!confirmation) {
      return res.status(404).send({ message: "Confirmation token not found" });
    }

    // Check if the email and hashedPassword match the confirmation document
    if (confirmation.email !== email) {
      return res
        .status(401)
        .send({ message: "Invalid confirmation token, email, or password" });
    }

    let user = await User.findOne({ email });

    // Delete the confirmation document from the Confirmation collection
    await Confirmation.deleteOne({ confirmationToken });

    res.status(200).send({ message: "Otp confirmed", user });
  },
  resendOtp: async (req: Request, res: Response) => {
    const { email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User does not exist" }] });
    }

    // Generate a confirmation token
    const confirmationToken = crypto.randomBytes(20).toString("hex");

    // Get the hashed password from the existing user
    const hashedPassword = user.password;

    // Save the confirmation token, email, and hashed password in a temporary storage
    const confirmation = new Confirmation({
      email,
      hashedPassword,
      confirmationToken,
    });

    await confirmation.save();

    // Send the confirmation email
    const emailBody = `To continue setting up your Qubemind account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;

    try {
      await sendEmail({
        email: email,
        subject: "Qubemind - Verify your email",
        message: emailBody,
      });

      res.status(200).send({
        message: "Confirmation email resent. Please check your email.",
        user,
      });

      console.log("success");
    } catch (error) {
      console.error(
        "Failed to send confirmation email",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to send confirmation email" });
    }
  },

  changePassword: async (req: Request, res: Response) => {
    const { password } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          password,
        },
        { new: true }
      );
      console.log(user, "success");
      res.status(201).send({ message: "Password changed succesfully." });
    } catch (error) {
      res.status(500).send({ message: "Failed to change password" });
      console.log(error);
    }
  },
};
