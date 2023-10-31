import { Request, Response } from "express";
import User, { IUser } from "../models/User";
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
        return res.status(400).json({ message: "User already exists " });
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
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered " });
      }

      const emailVerificationToken = crypto.randomBytes(20).toString("hex");

      const hashedPassword = await bcrypt.hash(password, 10);

      const userData: any = {
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

      const newUser = new User(userData);
      await newUser.save();

      const confirmationToken = crypto.randomBytes(20).toString("hex");
      const confirmation = new Confirmation({
        email,
        hashedPassword,
        confirmationToken,
      });
      await confirmation.save();

      const emailBody = `To verify your new email, please click the following link: ${process.env.SERVER_URL}/u/verify-email?token=${emailVerificationToken}`;

      await sendEmail({
        email: email,
        subject: "Maxticker - Verify your email ",
        message: emailBody,
      });

      const token = jwt.sign(
        { _id: newUser._id },
        process.env.SECRET as string,
        { expiresIn: "3650d" }
      );

      await newUser.save();

      res.status(200).json({
        token,
        createdAt: newUser.createdAt,
        user: newUser,
        message: "User created and authenticated successfully",
      });
    } catch (error: any) {
      console.error("Error during signup:", error?.message, error?.stack);
      res
        .status(500)
        .send({ message: "Failed to create user", error: error.message });
    }
  },

  login: async (req: Request, res: Response) => {
    const { email, password, registrationToken, productType } = req.body;

    const MAX_REFRESH_TOKENS = 5; // Set your desired limit

    try {
      let user = (await User.findOne({ email })) as IUser;
      if (!user) {
        return res.status(400).json({ message: "User doesn't exist" });
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

      if (!user.productsUsed.includes(productType)) {
        user.productsUsed.push(productType);
        await user.save();
      }

      const token = jwt.sign({ _id: user._id }, process.env.SECRET as string, {
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
      if (
        user.refreshTokens &&
        user.refreshTokens.length >= MAX_REFRESH_TOKENS
      ) {
        user.refreshTokens.shift(); // Remove the oldest token
      }
      // user.refreshTokens?.push(refreshToken);

      await user.save();

      return res.status(200).json({
        token,
        createdAt: user.createdAt,
        user: user,
        // , refreshToken
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error" });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string);
    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded._id);
    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { _id: user._id },
      process.env.SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token: newAccessToken });
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
    const emailBody = `To continue setting up your Maxticker account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;

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
      const emailBody = `Your Maxticker one-time password (OTP) is: <b>${otp}</b>`;

      await sendEmail({
        email: email,
        subject: "Maxticker - Reset your password",
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
      return res.status(404).send({ message: "OTP is incorrect" });
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
    const emailBody = `To continue setting up your Maxticker account, please click the following link to confirm your email: ${process.env.FRONTEND_URL}/onboarding/details?token=${confirmationToken}&email=${email}&hashedPassword=${hashedPassword}`;

    try {
      await sendEmail({
        email: email,
        subject: "Maxticker - Verify your email",
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

  setNewPassword: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.findOneAndUpdate(
        { email: email }, // filter by email
        { password: hashedPassword }, // update password
        { new: true } // return the updated document
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(201).send({ message: "Password changed successfully." });
    } catch (error) {
      console.error(
        "Failed to change password",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to change password" });
    }
  },
  getSubscription: async (req: Request, res: Response) => {
    const userId = req.params.id;

    console.log("Fetching subscription for user ID:", userId);

    try {
      let user = await User.findById(userId);
      console.log("User found:", user);

      if (!user || !user.subscription)
        return res.status(400).json({ message: "User or user data not found" });

      res.status(200).json({ subscription: user.subscription });
    } catch (error) {
      console.error(
        "Failed to fetch subscription ",
        JSON.stringify(error, null, 2)
      );
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  },

  editProfile: async (req: Request, res: Response) => {
    const { firstName, lastName } = req.body;

    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          firstName,
          lastName,
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(201).send({ message: "Edit successfully." });
    } catch (error) {
      console.error("Failed to edit profile", JSON.stringify(error, null, 2));
      res.status(500).send({ message: "Failed to edit profile" });
    }
  },

  changeEmail: async (req: Request, res: Response) => {
    const { email } = req.body;
    const id = req.params.id;

    try {
      // Check if the new email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Generate a verification token
      const emailVerificationToken = crypto.randomBytes(20).toString("hex");

      // Update the user's document with the new email and verification token
      // But don't set the email as verified yet
      const user = await User.findByIdAndUpdate(
        id,
        {
          email: email, // Temporary field to store the new email
          emailVerificationToken,
          emailVerified: false,
        },
        { new: true }
      );

      // Send the verification email
      const emailBody = `To verify your new email, please click the following link: ${process.env.SERVER_URL}/u/verify-email?token=${emailVerificationToken}`;
      await sendEmail({
        email: email,
        subject: "Maxticker - Verify your new email",
        message: emailBody,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(201).send({
        message:
          "Verification email sent. Please check your new email to confirm the change.",
      });
    } catch (error) {
      console.error("Failed to change email", JSON.stringify(error, null, 2));
      res.status(500).send({ message: "Failed to change email" });
    }
  },

  verifyEmail: async (req: Request, res: Response) => {
    const token = req.query.token;

    if (!token) {
      return res.status(400).send("Token is required.");
    }

    // Find a user with the matching token
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res
        .status(400)
        .send("Invalid verification link or token has expired.");
    }

    // Mark email as verified and clear the token
    user.emailVerified = true;
    user.emailVerificationToken = undefined; // Clear the token
    await user.save();

    res.send("Email verified successfully!");
  },

  changeProfilePassword: async (req: Request, res: Response) => {
    const { oldPassword, password } = req.body;
    const id = req.params.id;
    console.log("Received oldPassword (plaintext):", oldPassword);
    console.log("body ", req.body);
    try {
      const user = await User.findById(id);
      console.log("Stored password (hashed):", user?.password);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if oldPassword matches the user's current password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      res.status(201).send({ message: "Password changed successfully." });
    } catch (error) {
      console.error(
        "Failed to change password",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to change password" });
    }
  },

  cancelSubscription: async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await User.findByIdAndUpdate(
        id,
        { subscription: "standard" },
        { new: true }
      );

      res.status(201).send({ message: "Subscription cancelled successfully." });
    } catch (error) {
      console.error(
        "Failed to cancel subscription",
        JSON.stringify(error, null, 2)
      );
      res.status(500).send({ message: "Failed to cancel subscription" });
    }
  },
  deleteUser: async (req: Request, res: Response) => {
    const { id } = req.params; // Assuming the ID is passed as a URL parameter

    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Optionally, you can also delete the user's related data if necessary

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error during user deletion:", error);
      res.status(500).send({ message: "Failed to delete user" });
    }
  },
};
