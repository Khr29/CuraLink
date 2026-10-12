import { v2 as cloudinary } from "cloudinary";

// Medical-record attachments are uploaded with Cloudinary delivery type
// "authenticated": the asset has NO public URL, and the stored document keeps
// only its public_id (never a deliverable link). A link is minted on every
// read, signed with the account API secret and valid for a few minutes, via
// Cloudinary's private download API. Callers only reach this after the
// controller's own per-role access check (canView etc.), so a leaked JSON
// payload or old link stops working shortly after it is issued.
//
// Legacy attachments (uploaded before this change, public delivery) have no
// `publicId`; they keep returning their stored `url` unchanged so existing
// records stay readable. Those files remain publicly reachable until they
// are migrated to authenticated delivery (a separate, deliberate one-time
// operation against Cloudinary + the database; not performed by this code).

export const ATTACHMENT_URL_TTL_SECONDS = 10 * 60;

export const isProtectedAttachment = (attachment) =>
  !!attachment && typeof attachment.publicId === "string" && attachment.publicId.length > 0;

export const signAttachmentUrl = (attachment, now = Date.now()) =>
  cloudinary.utils.private_download_url(attachment.publicId, attachment.format || "", {
    resource_type: attachment.resourceType || "image",
    type: "authenticated",
    attachment: false,
    expires_at: Math.floor(now / 1000) + ATTACHMENT_URL_TTL_SECONDS,
  });

// Returns a plain-object copy that is safe to send to a client: protected
// attachments get a fresh short-lived `url` and never expose publicId.
export const presentAttachment = (attachment) => {
  if (!attachment) return attachment;
  const plain = typeof attachment.toObject === "function" ? attachment.toObject() : { ...attachment };
  if (!isProtectedAttachment(plain)) return plain;
  const { publicId, resourceType, format, ...rest } = plain;
  return { ...rest, url: signAttachmentUrl(plain), expiresInSeconds: ATTACHMENT_URL_TTL_SECONDS };
};

// For .lean() record results, which bypass the schema's toJSON transform.
// Handles the live attachments and every historical version snapshot.
export const presentRecordAttachments = (record) => {
  if (!record || typeof record !== "object") return record;
  const out = { ...record };
  if (Array.isArray(out.attachments)) out.attachments = out.attachments.map(presentAttachment);
  if (Array.isArray(out.versions)) {
    out.versions = out.versions.map((v) =>
      v?.snapshot?.attachments
        ? { ...v, snapshot: { ...v.snapshot, attachments: v.snapshot.attachments.map(presentAttachment) } }
        : v
    );
  }
  return out;
};
