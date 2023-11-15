import express from "express";
import { apiController } from "../controllers/apiController";
import { requireLogin } from "../middleware/auth";
const router = express.Router();

router.get("/get-users", apiController.getUsers);
router.get("/get-user-by-id/:id", apiController.getUserById);
router.get("/get-user", apiController.getUser);
router.put("/update-user", apiController.updateUser);
router.get("/get-user-by-value", apiController.getUserByValue);

export default router;
