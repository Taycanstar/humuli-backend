import { Request, Response } from "express";
import User from "../models/User";
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
  register: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }
      // Generate a confirmation token
      const confirmationToken = crypto.randomBytes(20).toString("hex");

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // // Save the confirmation token, email, and hashed password in a temporary storage
      // await Confirmation.create({ email, hashedPassword, confirmationToken });

      const confirmation = new Confirmation({
        email,
        hashedPassword,
        confirmationToken,
      });

      await confirmation.save();

      // Send the confirmation email
      const emailBody = `To continue setting up your Qubemind account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/auth/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;

      await sendEmail({
        email: email,
        subject: "Qubemind - Verify your email",
        message: emailBody,
      });

      res
        .status(200)
        .send({ message: "Confirmation email sent. Please check your email." });

      console.log("success");
    } catch (error) {
      console.error(
        "Failed to send confirmation email",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to send confirmation email" });
    }
  },

  login: async (req: Request, res: Response) => {
    const { email, password, username, registrationToken } = req.body;
    try {
      let user =
        (await User.findOne({ email })) || (await User.findOne({ username }));
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
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

    // Create a new user document in the User collection
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      regisrationStep: "emailVerified",
    });

    try {
      await user.save();
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
    const emailBody = `To continue setting up your Qubemind account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;

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

  addPersonalInfo: async (req: Request, res: Response) => {
    const { firstName, lastName, birthday, organizationName } = req.body;
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          firstName,
          lastName,
          birthday,
          organizationName,
          registrationStep: "personalInfoVerified",
        },
        { new: true }
      );

      res.status(201).send({ message: "Personal details updated." });
    } catch {
      res.status(500).send({ message: "Failed to add personal information" });
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
        // save the phone number to the user document
        const user = await User.findByIdAndUpdate(
          req.params.id,
          {
            phoneNumber,
            registrationStep: "phoneNumberVerified",
          },
          { new: true }
        );

        res.status(200).send({ message: "Phone number verified.", user });
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
};
