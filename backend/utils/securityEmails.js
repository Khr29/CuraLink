// Shared wrapper matching the card style already used for the welcome /
// appointment emails in userController.js (blue header, white rounded
// card, gray footer) — kept in one place so every security email looks
// consistent instead of re-implementing the boilerplate per call site.
const wrap = (headerColor, title, subtitle, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      <div style="background:${headerColor}; color:white; padding:20px; text-align:center;">
        <h2 style="margin:0;">CuraLink</h2>
        <p style="margin:5px 0 0;">${subtitle}</p>
      </div>
      <div style="padding:20px;">
        ${bodyHtml}
      </div>
      <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
        © 2026 CuraLink. All rights reserved.
      </div>
    </div>
  </div>
`;

export const otpEmailHtml = (name, otp, purposeLabel) =>
  wrap(
    "#1976d2",
    "CuraLink",
    `${purposeLabel} 🔐`,
    `
      <p style="font-size:16px;">Hi <b>${name || "there"}</b>,</p>
      <p style="color:#555;">Use the code below to ${purposeLabel.toLowerCase()}. It expires in 10 minutes.</p>
      <div style="text-align:center; margin:25px 0;">
        <span style="display:inline-block; background:#f9f9f9; border:1px dashed #1976d2; border-radius:8px; padding:16px 32px; font-size:28px; font-weight:bold; letter-spacing:6px; color:#1976d2;">${otp}</span>
      </div>
      <p style="color:#777; font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
    `
  );

export const passwordChangedEmailHtml = (name) =>
  wrap(
    "#e53935",
    "CuraLink",
    "Password Changed 🔑",
    `
      <p style="font-size:16px;">Hi <b>${name || "there"}</b>,</p>
      <p style="color:#555;">Your CuraLink password was just changed. All other active sessions have been signed out.</p>
      <p style="color:#777; font-size:14px;">If this wasn't you, contact support immediately and reset your password.</p>
    `
  );

export const newLoginEmailHtml = (name, { device, ip, time }) =>
  wrap(
    "#1976d2",
    "CuraLink",
    "New Sign-in Detected 🔔",
    `
      <p style="font-size:16px;">Hi <b>${name || "there"}</b>,</p>
      <p style="color:#555;">We noticed a new sign-in to your CuraLink account.</p>
      <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin:20px 0;">
        <p><b>🕒 Time:</b> ${time}</p>
        <p><b>💻 Device:</b> ${device || "Unknown"}</p>
        <p><b>🌐 IP Address:</b> ${ip || "Unknown"}</p>
      </div>
      <p style="color:#777; font-size:14px;">If this was you, no action is needed. Otherwise, change your password immediately.</p>
    `
  );

export const accountLockedEmailHtml = (name) =>
  wrap(
    "#e53935",
    "CuraLink",
    "Account Temporarily Locked 🚫",
    `
      <p style="font-size:16px;">Hi <b>${name || "there"}</b>,</p>
      <p style="color:#555;">We detected repeated failed sign-in attempts on your account and temporarily rate-limited further attempts to protect it.</p>
      <p style="color:#777; font-size:14px;">If this wasn't you, no further action is needed — the account itself was never accessed.</p>
    `
  );
