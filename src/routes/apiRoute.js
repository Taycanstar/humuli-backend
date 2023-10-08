"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiController_1 = require("../controllers/apiController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/get-users", apiController_1.apiController.getUsers);
router.get("/get-user-by-id/:id", auth_1.requireLogin, apiController_1.apiController.getUserById);
router.get("/get-user", apiController_1.apiController.getUser);
router.put("/update-user", auth_1.requireLogin, apiController_1.apiController.updateUser);
router.get("/get-user-by-value", apiController_1.apiController.getUserByValue);
exports.default = router;
