import userModel from "../models/userModels.js";
import doctorModel from "../models/doctorModel.js";
import hospitalModel from "../models/hospitalModel.js";
import pharmacyModel from "../models/pharmacyModel.js";

// Admin is deliberately excluded — it has no DB row (env-var credentials),
// so it has no self-service password reset / email verification.
export const ACTOR_MODELS = {
  user: userModel,
  doctor: doctorModel,
  hospital: hospitalModel,
  pharmacy: pharmacyModel,
};
