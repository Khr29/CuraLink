import express from "express";
import { getPlatformStats } from "../controllers/statsController.js";

const statsRouter = express.Router();

statsRouter.get("/", getPlatformStats);

export default statsRouter;
