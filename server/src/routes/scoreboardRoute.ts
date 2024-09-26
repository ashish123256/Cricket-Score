import express from "express";
import { scoreboardController } from "../controllers/scoreboardController";
const router = express.Router();

router.get("/scoreboard",scoreboardController);

export default router