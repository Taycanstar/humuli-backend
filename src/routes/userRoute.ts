import express from "express";
import { userController } from "../controllers/userController";
const router = express.Router();

router.post("/check-email-exists", userController.checkEmailExists);
router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.post("/confirm-user", userController.confirmUser);
router.get("/check-user-exists", userController.checkUserExists);
router.post("/resend-confirmation", userController.resendConfirmation);
router.post("/send-code", userController.sendCode);
router.post("/resend-code", userController.resendCode);
router.post("/confirm-phone-number", userController.confirmPhoneNumber);
router.post("/forgot-password", userController.forgotPassword);
router.post("/confirm-otp", userController.confirmOtp);
router.post("/change-password", userController.changePassword);
router.post("/set-new-password", userController.setNewPassword);

export default router;
