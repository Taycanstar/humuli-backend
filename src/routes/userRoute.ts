import express from "express";
import { userController } from "../controllers/userController";
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/fake-login", userController.fakeLogin);
router.post("/login", userController.login);
router.post("/confirm-user", userController.confirmUser);
router.get("/check-user-exists", userController.checkUserExists);
router.post("/resend-confirmation", userController.resendConfirmation);
router.put("/add-personal-info/:id", userController.addPersonalInfo);
router.post("/send-code", userController.sendCode);
router.post("/resend-code", userController.resendCode);
router.post("/confirm-phone-number/:id", userController.confirmPhoneNumber);
router.post("/forgot-password", userController.forgotPassword);
router.post("/confirm-otp", userController.confirmOtp);
router.post("/change-password", userController.changePassword);

export default router;
