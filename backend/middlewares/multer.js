import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

// Approved formats: images (profile photos, hospital media) and PDFs
// (medical reports / record attachments). Anything else — including
// executables disguised with an image extension — is rejected before it
// ever touches disk.
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf'])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    // Never trust the original filename — path traversal / overwrite risk.
    // Keep only the (already-validated) extension.
    const ext = path.extname(file.originalname).toLowerCase()
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`
    callback(null, unique)
  },
})

const fileFilter = (req, file, callback) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
    const error = new Error(
      'Unsupported file type. Only JPG, PNG, WEBP and PDF files are allowed.'
    )
    error.status = 400
    return callback(error)
  }
  callback(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
})

export default upload
