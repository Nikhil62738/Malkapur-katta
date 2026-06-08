import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { randomUUID } from "crypto"
import { getModel } from "../models/Doc.js"
import { requireSuperAdmin } from "../middleware/auth.js"
import { PERMISSIONS, sanitizePermissions } from "../utils/permissions.js"

const router = Router()
const Admins = () => getModel("admins")

// Shape returned to clients — never includes passwordHash.
function publicAdmin(a) {
	return {
		id: a._id,
		email: a.email,
		name: a.name || "",
		role: a.role === "superadmin" ? "superadmin" : "admin",
		permissions: Array.isArray(a.permissions) ? a.permissions : [],
		createdAt: a.createdAt,
	}
}

router.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body || {}
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" })
		}
		const admin = await Admins()
			.findOne({ email: String(email).toLowerCase() })
			.lean()
		if (!admin || !admin.passwordHash) {
			return res
				.status(401)
				.json({ error: "Invalid credentials", code: "auth/wrong-password" })
		}
		const ok = await bcrypt.compare(password, admin.passwordHash)
		if (!ok) {
			return res
				.status(401)
				.json({ error: "Invalid credentials", code: "auth/wrong-password" })
		}
		// The configured owner email is always the super admin, even if an older
		// seed created the record with role "admin".
		const ownerEmail = (
			process.env.ADMIN_EMAIL || "admin@malkapurkatta.com"
		).toLowerCase()
		const isOwner = String(admin.email).toLowerCase() === ownerEmail
		const role =
			admin.role === "superadmin" || isOwner ? "superadmin" : "admin"
		const permissions =
			role === "superadmin"
				? PERMISSIONS
				: Array.isArray(admin.permissions)
					? admin.permissions
					: []
		const payload = {
			uid: admin._id,
			email: admin.email,
			name: admin.name || "",
			role,
			permissions,
		}
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN || "7d",
		})
		res.json({ token, user: payload })
	} catch (e) {
		next(e)
	}
})

router.get("/me", (req, res) => {
	if (!req.user) return res.status(401).json({ error: "Unauthorized" })
	res.json({
		uid: req.user.uid,
		email: req.user.email,
		name: req.user.name || "",
		role: req.user.role,
		permissions: req.user.permissions || [],
	})
})

router.post("/forgot-password", (req, res) => {
	const { email } = req.body || {}
	// Stub: wire up real email delivery (SMTP / provider) in production.
	console.log(`[forgot-password] password reset requested for: ${email}`)
	res.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Sub-admin management (super admin only)
// ---------------------------------------------------------------------------

// The list of permission keys an admin can grant.
router.get("/permissions", requireSuperAdmin, (_req, res) => {
	res.json({ permissions: PERMISSIONS })
})

// List all admin accounts (super admin + sub-admins).
router.get("/admins", requireSuperAdmin, async (_req, res, next) => {
	try {
		const rows = await Admins().find().lean()
		res.json({ admins: rows.map(publicAdmin) })
	} catch (e) {
		next(e)
	}
})

// Create a new sub-admin with a set of section permissions.
router.post("/admins", requireSuperAdmin, async (req, res, next) => {
	try {
		const { email, password, name, permissions } = req.body || {}
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" })
		}
		const normalized = String(email).toLowerCase()
		const existing = await Admins().findOne({ email: normalized }).lean()
		if (existing) {
			return res
				.status(409)
				.json({ error: "An admin with this email already exists" })
		}
		const passwordHash = await bcrypt.hash(String(password), 10)
		const doc = await Admins().create({
			_id: randomUUID(),
			email: normalized,
			name: name || normalized.split("@")[0],
			passwordHash,
			role: "admin",
			permissions: sanitizePermissions(permissions),
		})
		res.status(201).json({ admin: publicAdmin(doc.toObject()) })
	} catch (e) {
		next(e)
	}
})

// Update a sub-admin's name, permissions, and/or password.
router.put("/admins/:id", requireSuperAdmin, async (req, res, next) => {
	try {
		const { id } = req.params
		const target = await Admins().findById(id).lean()
		if (!target) return res.status(404).json({ error: "Admin not found" })
		if (target.role === "superadmin") {
			return res
				.status(403)
				.json({ error: "The super admin account cannot be modified here" })
		}
		const { name, permissions, password } = req.body || {}
		const update = {}
		if (typeof name === "string") update.name = name
		if (permissions !== undefined) {
			update.permissions = sanitizePermissions(permissions)
		}
		if (password) update.passwordHash = await bcrypt.hash(String(password), 10)
		const doc = await Admins()
			.findByIdAndUpdate(id, { $set: update }, { new: true })
			.lean()
		res.json({ admin: publicAdmin(doc) })
	} catch (e) {
		next(e)
	}
})

// Delete a sub-admin.
router.delete("/admins/:id", requireSuperAdmin, async (req, res, next) => {
	try {
		const { id } = req.params
		if (String(id) === String(req.user.uid)) {
			return res.status(400).json({ error: "You cannot delete your own account" })
		}
		const target = await Admins().findById(id).lean()
		if (!target) return res.status(404).json({ error: "Admin not found" })
		if (target.role === "superadmin") {
			return res
				.status(403)
				.json({ error: "The super admin account cannot be deleted" })
		}
		await Admins().findByIdAndDelete(id)
		res.json({ ok: true })
	} catch (e) {
		next(e)
	}
})

export default router
