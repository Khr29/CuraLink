import dns from "node:dns/promises";
import mongoose from "mongoose";

// Some local dev environments (e.g. a Linux systemd-resolved stub at
// 127.0.0.53) fail to resolve MongoDB Atlas SRV records, so we force a
// public resolver. Production hosts provide a working DNS resolver by
// default, so this stays dev-only and never overrides resolver behavior
// in production.
if (process.env.NODE_ENV !== "production") {
  console.log(await dns.getServers()); // Agar 127.0.0.53 dikhe, change karo
  dns.setServers(["1.1.1.1"]); // Cloudflare DNS
}

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Databas Connected"));
  await mongoose.connect(process.env.MONGODB_URI);
};

export default connectDB;
