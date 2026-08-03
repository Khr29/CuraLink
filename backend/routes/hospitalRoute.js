import express from "express";
import {
  addHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  changeHospitalStatus,
} from "../controllers/hospitalController.js";
import upload from "../middlewares/multer.js";

const hospitalRouter = express.Router();

// Add Hospital
hospitalRouter.post(
  "/add",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  addHospital,
);

// Get All Hospitals
hospitalRouter.get("/list", getAllHospitals);

// Get Single Hospital
hospitalRouter.get("/:id", getHospitalById);

// Update Hospital
hospitalRouter.put("/update/:id", updateHospital);

// Delete Hospital
hospitalRouter.delete("/delete/:id", deleteHospital);

// Active / Inactive
hospitalRouter.patch("/status/:id", changeHospitalStatus);

export default hospitalRouter;
