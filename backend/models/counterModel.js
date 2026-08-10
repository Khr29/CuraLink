import mongoose from "mongoose";

// Generic atomic-increment counter, keyed by an arbitrary string id (e.g.
// "prescription-2026"). Used wherever a sequential public-facing number is
// needed — findOneAndUpdate's $inc is atomic, so concurrent finalizations
// never hand out the same sequence number.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const counterModel =
  mongoose.models.counter || mongoose.model("counter", counterSchema);

export default counterModel;
