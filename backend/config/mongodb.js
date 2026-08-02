import dns from "node:dns/promises";
// Current DNS check
console.log(await dns.getServers()); // Agar 127.0.0.53 dikhe, change karo
// Set reliable DNS
dns.setServers(["1.1.1.1"]); // Cloudflare DNS

import mongoose from "mongoose";
const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Databas Connected"));
  await mongoose.connect(process.env.MONGODB_URI);
};

export default connectDB;
