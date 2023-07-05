"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.post("/register", userController_1.userController.register);
router.post("/confirm-user", userController_1.userController.confirmUser);
router.get("/check-user-exists", userController_1.userController.checkUserExists);
router.post("/resend-confirmation", userController_1.userController.resendConfirmation);
router.put("/add-personal-info/:id", userController_1.userController.addPersonalInfo);
router.post("/send-code", userController_1.userController.sendCode);
router.post("/resend-code", userController_1.userController.resendCode);
router.post("/confirm-phone-number/:id", userController_1.userController.confirmPhoneNumber);
exports.default = router;
