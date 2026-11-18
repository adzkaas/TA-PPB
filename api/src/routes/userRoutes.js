import express from "express";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/:id/avatar", UserController.uploadAvatar);
router.put("/:id", UserController.update);

export default router;
