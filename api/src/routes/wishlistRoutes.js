import express from "express";
import { WishlistController } from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", WishlistController.getAll);
router.get("/:id", WishlistController.getById);
router.post("/", WishlistController.create);
router.delete("/:id", WishlistController.remove);

export default router;
