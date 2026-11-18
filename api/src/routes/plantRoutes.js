import express from "express";
import { PlantController } from "../controllers/plantController.js";

const router = express.Router();

router.get("/", PlantController.getAll);
router.get("/:id", PlantController.getById);
router.post("/", PlantController.create);
router.put("/:id", PlantController.update);
router.delete("/:id", PlantController.remove);

export default router;
