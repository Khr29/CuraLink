// Pure helpers for migrating LEGACY medical-record attachments (public
// Cloudinary delivery, only a `url` stored) to the authenticated delivery used
// by new uploads (publicId stored, short-lived signed links minted per read —
// see utils/attachmentAccess.js). No I/O here; scripts/migrateLegacyAttachments.js
// does the Cloudinary + database work.

// https://res.cloudinary.com/<cloud>/<image|video|raw>/upload/[transformations/][v123/]<public_id>[.<ext>]
const CLOUDINARY_URL_RE = /^https:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/upload\/(.+)$/i;
const VERSION_RE = /^v\d+$/;

// Returns { cloudName, resourceType, publicId, format } or null when the URL is
// not a plain public Cloudinary asset URL we can safely reverse into a public_id.
// Anything ambiguous returns null so it is reported, never guessed at.
export const parseCloudinaryAssetUrl = (url) => {
  if (typeof url !== "string") return null;
  const m = url.trim().split(/[?#]/)[0].match(CLOUDINARY_URL_RE);
  if (!m) return null;
  const [, cloudName, resourceTypeRaw, rest] = m;
  const resourceType = resourceTypeRaw.toLowerCase();

  let segments = rest.split("/");
  // Delivery URLs may carry transformation segments before the version. Only
  // accept them when a version marker exists to anchor where the public_id starts.
  const versionIdx = segments.findIndex((s) => VERSION_RE.test(s));
  if (versionIdx !== -1) segments = segments.slice(versionIdx + 1);
  else if (segments.some((s) => s.includes(",") || /^[a-z]{1,3}_[^/]*$/i.test(s))) return null;
  if (segments.length === 0 || segments.some((s) => s === "")) return null;

  let decoded;
  try {
    decoded = segments.map(decodeURIComponent);
  } catch {
    return null;
  }
  if (decoded.some((s) => s === "." || s === "..")) return null;

  const last = decoded[decoded.length - 1];
  let format = "";
  if (resourceType !== "raw") {
    // image/video public_ids exclude the extension; raw public_ids include it.
    const dot = last.lastIndexOf(".");
    if (dot > 0) {
      format = last.slice(dot + 1).toLowerCase();
      decoded[decoded.length - 1] = last.slice(0, dot);
    }
  }
  const publicId = decoded.join("/");
  return publicId ? { cloudName, resourceType, publicId, format } : null;
};

const isLegacy = (a) =>
  !!a && typeof a.url === "string" && a.url.length > 0 && !(typeof a.publicId === "string" && a.publicId.length > 0);

// Every legacy attachment in a (lean) record: the live list and each version snapshot.
export const collectLegacyAttachments = (record) => {
  const found = [];
  for (const a of record?.attachments || []) if (isLegacy(a)) found.push(a);
  for (const v of record?.versions || []) {
    for (const a of v?.snapshot?.attachments || []) if (isLegacy(a)) found.push(a);
  }
  return found;
};

// Groups legacy attachments across records by asset URL (one Cloudinary rename
// per asset, however many records/snapshots reference it).
export const planMigration = (records, { cloudName } = {}) => {
  const byUrl = new Map();
  const skipped = [];
  for (const record of records) {
    for (const a of collectLegacyAttachments(record)) {
      if (byUrl.has(a.url)) continue;
      const parsed = parseCloudinaryAssetUrl(a.url);
      if (!parsed) skipped.push({ recordId: String(record._id), reason: "not_a_plain_cloudinary_url" });
      else if (cloudName && parsed.cloudName !== cloudName) skipped.push({ recordId: String(record._id), reason: "different_cloud" });
      else byUrl.set(a.url, parsed);
    }
  }
  return { assets: [...byUrl.entries()].map(([url, parsed]) => ({ url, ...parsed })), skipped };
};
