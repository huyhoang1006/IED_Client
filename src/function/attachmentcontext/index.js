import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let attachmentDir

if (process.env.NODE_ENV === 'development') {
  attachmentDir = path.join(__dirname, '/../attachment')
} else {
  attachmentDir = path.join(app.getPath('userData'), 'attachment')
}

if (!fs.existsSync(attachmentDir)) {
  fs.mkdirSync(attachmentDir, { recursive: true })
}

export function getAttachmentPath(filename) {
  return path.join(attachmentDir, filename)
}

export function getAttachmentDir() {
  return attachmentDir
}