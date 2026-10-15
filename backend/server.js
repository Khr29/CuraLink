// import express from 'express'
// import dotenv from 'dotenv';
// import cors from 'cors'
// import 'dotenv/config'
// import connectDB from './config/mongodb.js'
// import connectCloudinary from './config/cloudinary.js'
// import adminRouter from './routes/adminRoute.js'
// import doctorRouter from './routes/doctorRoute.js';
// import userRouter from './routes/userRoute.js';

// dotenv.config();

// //app config

// const app = express()
// const port = process.env.PORT || 4000
// connectDB()
// connectCloudinary()

// //middleware
// app.use(express.json())
// app.use(cors()) // used to connect frontend to backend

// //api endpoints

// app.use('/api/admin',adminRouter) // localhost:4000/api/admin/add-doctor
// app.use('/api/doctor',doctorRouter)
// app.use('/api/user',userRouter)

// app.get('/', (req,res) => {
//     res.send("API Working egt")
// })

// app.listen(port, () => console.log("Server Started", port))

import express from "express";
import cors from "cors";
import "./config/loadEnv.js";
import { getMissingAuthConfig } from "./utils/authConfig.js";
import { buildCorsOptions } from "./utils/corsConfig.js";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import hospitalRouter from "./routes/hospitalRoute.js";
import pharmacyRouter from "./routes/pharmacyRoute.js";
import userRouter from "./routes/userRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import statsRouter from "./routes/statsRoute.js";
import medicalRecordRouter from "./routes/medicalRecordRoute.js";
import scheduleRouter from "./routes/scheduleRoute.js";

import helmet from "helmet";
import compression from "compression";
import { createRequestLogger } from "./utils/logRedaction.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import { generalApiLimiter } from "./middlewares/rateLimiters.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// Trust the platform's reverse proxy (Render/Railway/Heroku/etc.) so
// express-rate-limit and req.ip read the real client IP from
// X-Forwarded-For instead of the proxy's own address. Only enabled in
// production — locally there is no proxy in front of the server, so
// trusting X-Forwarded-For there would let a client spoof its own IP.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Auth fails closed when these are missing (see utils/authConfig.js), but the
// public, read-only parts of the site keep working — so warn loudly instead of
// refusing to boot. Names only; values are never logged.
const missingAuthConfig = getMissingAuthConfig();
if (missingAuthConfig.length) {
  console.error(`[CONFIG] Missing required auth configuration: ${missingAuthConfig.join(", ")}. Logins will fail until these are set.`);
}

// connect services (parallel execution for speed)
await Promise.all([connectDB(), connectCloudinary()]);

// middlewares
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
// HTTP request logger. Redacts prescription-verification tokens (they are in the
// URL path) and other secret query params — see utils/logRedaction.js.
app.use(createRequestLogger());
app.use(express.json({ limit: "10kb" })); // prevent large payload attacks
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // reads the httpOnly refresh-token cookies
// Fails closed: explicit allowlist from CORS_ORIGIN; with it unset, nothing is
// allowed in production and only localhost origins in development. See
// utils/corsConfig.js.
app.use(cors(buildCorsOptions()));

// General, role-tiered safety net against abuse/flooding — NOT the
// security control for sensitive endpoints (those are the dedicated
// login/register/forgot-password/OTP/review/booking limiters wired into
// their own routes). Admins are exempt; doctors/hospitals/patients each
// get a high-enough ceiling that normal usage never trips it. See
// middlewares/rateLimiters.js for the full rationale.
app.use("/api", generalApiLimiter);

// health check route (fast response)
app.get("/", (req, res) => {
  res.status(200).send("API Working 🚀");
});

// api routes
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/hospital", hospitalRouter);
app.use("/api/pharmacy", pharmacyRouter);
app.use("/api/review", reviewRouter);
app.use("/api/stats", statsRouter);
app.use("/api/medical-records", medicalRecordRouter);
app.use("/api/schedule", scheduleRouter);

// global error handler (reliability)
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Multer's own errors (e.g. LIMIT_FILE_SIZE) don't set .status — surface
  // them as 400s instead of a generic 500.
  const status = err.status || (err instanceof multer.MulterError ? 400 : 500);
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
