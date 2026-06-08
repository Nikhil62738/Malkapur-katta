import { Router } from "express"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"
import { requireAdmin } from "../middleware/auth.js"

const router = Router()
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 50 * 1024 * 1024 },
})

function isConfigured() {
	return !!(
		process.env.CLOUDINARY_CLOUD_NAME &&
		process.env.CLOUDINARY_API_KEY &&
		process.env.CLOUDINARY_API_SECRET
	)
}

function configure() {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	})
}

// POST /api/upload  (multipart: file, path?)  -> { url, publicId }
router.post("/", requireAdmin, upload.single("file"), async (req, res, next) => {
	try {
		if (!req.file) return res.status(400).json({ error: "No file uploaded" })
		if (!isConfigured()) {
			return res.status(500).json({
				error: "Cloudinary is not configured. Set CLOUDINARY_* env vars.",
			})
		}
		configure()
		const baseFolder = process.env.CLOUDINARY_FOLDER || "malkapur-katta"
		const subPath = (req.body && req.body.path) || ""
		// Group uploads under <baseFolder>/<leading dirs of the storage path>.
		const dir = subPath.includes("/")
			? subPath.slice(0, subPath.lastIndexOf("/"))
			: ""
		const folder = dir ? `${baseFolder}/${dir}` : baseFolder
		const result = await new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(
				{ folder, resource_type: "auto", use_filename: true, unique_filename: true },
				(err, r) => (err ? reject(err) : resolve(r)),
			)
			streamifier.createReadStream(req.file.buffer).pipe(stream)
		})
		res.json({ url: result.secure_url, publicId: result.public_id })
	} catch (e) {
		next(e)
	}
})

// DELETE /api/upload  body { publicId?, path?, url? }  -> { ok: true }
router.delete("/", requireAdmin, async (req, res, next) => {
	try {
		if (!isConfigured()) return res.json({ ok: true })
		configure()
		const { publicId } = req.body || {}
		if (publicId) {
			try {
				await cloudinary.uploader.destroy(publicId)
			} catch {
				/* best-effort delete */
			}
		}
		res.json({ ok: true })
	} catch (e) {
		next(e)
	}
})

export default router
