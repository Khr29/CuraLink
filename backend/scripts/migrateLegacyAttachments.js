// One-time migration: legacy PUBLIC medical-record attachments -> Cloudinary
// "authenticated" delivery (what new uploads already use).
//
//   node scripts/migrateLegacyAttachments.js            # DRY RUN (default): reads the database, prints a plan, changes NOTHING
//   node scripts/migrateLegacyAttachments.js --apply    # performs the migration
//
// What --apply does, per unique legacy asset:
//   1. Cloudinary: rename(publicId -> same publicId, type "upload" -> "authenticated").
//      The old public URL STOPS WORKING at this moment (that is the point).
//   2. Database: on every record and version snapshot referencing that URL, set
//      publicId/resourceType/format and clear `url`. Reads then mint signed links.
//   Re-running is safe: assets already authenticated are detected and only the
//   database step is repeated.
//
// SAFETY
//   - Reads MONGODB_URI via config/loadEnv.js and refuses a remote database
//     unless ALLOW_REMOTE_DB=true (config/dbSafety.js). Run against PRODUCTION
//     only deliberately, after a database backup + Cloudinary backup.
//   - Only touches attachments that have a `url` and no `publicId`.
//   - URLs it cannot reverse unambiguously into a public_id are reported and skipped.
//   - UNVERIFIED against live Cloudinary: that rename with the same public_id and
//     to_type "authenticated" is accepted. Try ONE staging asset first.
import "../config/loadEnv.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "../config/mongodb.js";
import { planMigration } from "../utils/legacyAttachments.js";
import { applyAssetToRecords } from "../utils/legacyAttachmentsDb.js";

const apply = process.argv.includes("--apply");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const legacyElem = { url: { $nin: ["", null] }, publicId: { $in: ["", null] } };

const existsAsAuthenticated = async (asset) => {
  try {
    await cloudinary.api.resource(asset.publicId, { type: "authenticated", resource_type: asset.resourceType });
    return true;
  } catch {
    return false;
  }
};

const migrateAsset = async (collection, asset) => {
  try {
    await cloudinary.uploader.rename(asset.publicId, asset.publicId, {
      type: "upload",
      to_type: "authenticated",
      resource_type: asset.resourceType,
      invalidate: true,
    });
  } catch (error) {
    if (!(await existsAsAuthenticated(asset))) {
      throw new Error(`Cloudinary rename failed (${error?.error?.message || error.message})`);
    }
    // Already authenticated by an earlier run: only the database step is outstanding.
  }
  return applyAssetToRecords(collection, asset);
};

const main = async () => {
  await connectDB(); // refuses a remote DB unless ALLOW_REMOTE_DB=true
  const collection = mongoose.connection.db.collection("medicalrecords");
  const records = await collection
    .find({ $or: [{ attachments: { $elemMatch: legacyElem } }, { "versions.snapshot.attachments": { $elemMatch: legacyElem } }] })
    .project({ attachments: 1, "versions.snapshot.attachments": 1 })
    .toArray();

  const { assets, skipped } = planMigration(records, { cloudName: process.env.CLOUDINARY_NAME });
  console.log(`[migrate] mode: ${apply ? "APPLY" : "DRY RUN (no changes)"}`);
  console.log(`[migrate] records with legacy attachments: ${records.length}`);
  console.log(`[migrate] unique assets to migrate: ${assets.length}`);
  console.log(`[migrate] skipped (cannot be migrated automatically): ${skipped.length}`);
  for (const s of skipped) console.log(`  - record ${s.recordId}: ${s.reason}`);
  if (!apply) {
    for (const a of assets) console.log(`  would migrate: ${a.resourceType}/${a.publicId}${a.format ? "." + a.format : ""}`);
    console.log("[migrate] Re-run with --apply to perform the migration.");
    return;
  }

  let ok = 0, failed = 0;
  for (const asset of assets) {
    try {
      const changed = await migrateAsset(collection, asset);
      ok += 1;
      console.log(`  migrated ${asset.resourceType}/${asset.publicId} (${changed} documents updated)`);
    } catch (error) {
      failed += 1;
      console.error(`  FAILED ${asset.resourceType}/${asset.publicId}: ${error.message}`);
    }
  }
  console.log(`[migrate] done: ${ok} migrated, ${failed} failed, ${skipped.length} skipped`);
  if (failed) process.exitCode = 1;
};

main()
  .catch((error) => {
    console.error("[migrate] aborted:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
