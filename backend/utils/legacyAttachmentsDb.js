// The DATABASE half of the legacy-attachment migration, kept separate from the
// CLI (scripts/migrateLegacyAttachments.js) so it can be tested against a local
// database without Cloudinary. Takes a raw collection handle (bypassing the
// schema's toJSON transforms) and touches ONLY attachment elements whose `url`
// equals the asset's url.
//
// Sets publicId/resourceType/format and clears `url` on the live attachments
// and on every versions[].snapshot.attachments entry. Idempotent: once `url` is
// cleared nothing matches again. Returns the number of documents modified.
export const applyAssetToRecords = async (collection, asset) => {
  const set = { publicId: asset.publicId, resourceType: asset.resourceType, format: asset.format, url: "" };
  const prefixed = (path) => Object.fromEntries(Object.entries(set).map(([k, v]) => [`${path}.$[a].${k}`, v]));
  const live = await collection.updateMany(
    { "attachments.url": asset.url },
    { $set: prefixed("attachments") },
    { arrayFilters: [{ "a.url": asset.url }] }
  );
  const versions = await collection.updateMany(
    { "versions.snapshot.attachments.url": asset.url },
    { $set: prefixed("versions.$[].snapshot.attachments") },
    { arrayFilters: [{ "a.url": asset.url }] }
  );
  return live.modifiedCount + versions.modifiedCount;
};
