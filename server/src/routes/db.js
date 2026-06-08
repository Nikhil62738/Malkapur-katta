import { Router } from "express"
import { randomUUID } from "crypto"
import { getModel } from "../models/Doc.js"
import { deepMerge } from "../utils/merge.js"
import { requiredPermission } from "../utils/permissions.js"

const router = Router()

// Collections only an admin may read.
const ADMIN_READ = new Set(["contactMessages", "submissions"])
// Collections anonymous visitors may create documents in (e.g. contact form).
const PUBLIC_CREATE = new Set(["contactMessages", "users"])
// Merge writes allowed for anonymous visitors, restricted to these top-level
// keys. `null` means any merge is allowed (used for per-user profile docs).
const PUBLIC_MERGE_KEYS = { users: null, polls: ["votes"] }
// The admins collection stores password hashes and is managed only through
// /api/auth/admins. It is never exposed via this generic data API.
const PROTECTED_COLLECTIONS = new Set(["admins"])

function isAdmin(req) {
	return !!(
		req.user &&
		(req.user.role === "admin" || req.user.role === "superadmin")
	)
}

// Whether the current admin may access (read/write) the given target. Super
// admins may do anything; sub-admins need the matching section permission.
function adminCanAccess(req, col, id) {
	if (!req.user) return false
	if (req.user.role === "superadmin") return true
	if (req.user.role !== "admin") return false
	const perm = requiredPermission(col, id)
	if (!perm) return true
	return Array.isArray(req.user.permissions) && req.user.permissions.includes(perm)
}

function publicMergeAllowed(col, data, merge) {
	if (!merge) return false
	if (!Object.prototype.hasOwnProperty.call(PUBLIC_MERGE_KEYS, col)) return false
	const allowed = PUBLIC_MERGE_KEYS[col]
	if (allowed === null) return true
	return Object.keys(data || {}).every((k) => allowed.includes(k))
}

function serialize(obj) {
	const { _id, __v, ...rest } = obj
	return { id: _id, ...rest }
}

function blocked(col, res) {
	if (PROTECTED_COLLECTIONS.has(col)) {
		res
			.status(403)
			.json({ error: "This collection is managed via /api/auth/admins" })
		return true
	}
	return false
}

// GET /api/db/:col  -> { docs: [...] }
router.get("/:col", async (req, res, next) => {
	try {
		const { col } = req.params
		if (blocked(col, res)) return
		if (ADMIN_READ.has(col) && !adminCanAccess(req, col, null)) {
			return res.status(401).json({ error: "Unauthorized" })
		}
		const rows = await getModel(col).find().lean()
		res.json({ docs: rows.map(serialize) })
	} catch (e) {
		next(e)
	}
})

// GET /api/db/:col/:id  -> { doc: {...} | null }
router.get("/:col/:id", async (req, res, next) => {
	try {
		const { col, id } = req.params
		if (blocked(col, res)) return
		if (ADMIN_READ.has(col) && !adminCanAccess(req, col, id)) {
			return res.status(401).json({ error: "Unauthorized" })
		}
		const row = await getModel(col).findById(id).lean()
		res.json({ doc: row ? serialize(row) : null })
	} catch (e) {
		next(e)
	}
})

// POST /api/db/:col  body { id?, data }  -> { id }
router.post("/:col", async (req, res, next) => {
	try {
		const { col } = req.params
		if (blocked(col, res)) return
		const body = req.body || {}
		const id = body.id || randomUUID()
		if (!PUBLIC_CREATE.has(col) && !adminCanAccess(req, col, id)) {
			return res.status(401).json({ error: "Unauthorized" })
		}
		const resolved = deepMerge({}, body.data || {})
		await getModel(col).findByIdAndUpdate(
			id,
			{ $set: { ...resolved, _id: id } },
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		)
		res.json({ id })
	} catch (e) {
		next(e)
	}
})

// PUT /api/db/:col/:id?merge=true  body { data }  -> { id }
router.put("/:col/:id", async (req, res, next) => {
	try {
		const { col, id } = req.params
		if (blocked(col, res)) return
		const merge = req.query.merge === "true"
		const data = (req.body && req.body.data) || {}
		if (!adminCanAccess(req, col, id) && !publicMergeAllowed(col, data, merge)) {
			return res.status(401).json({ error: "Unauthorized" })
		}
		const model = getModel(col)
		if (merge) {
			const existing = await model.findById(id).lean()
			const base = existing ? serialize(existing) : {}
			delete base.id
			delete base.createdAt
			delete base.updatedAt
			const merged = deepMerge(base, data)
			await model.findByIdAndUpdate(
				id,
				{ $set: { ...merged, _id: id } },
				{ upsert: true, new: true },
			)
		} else {
			const resolved = deepMerge({}, data)
			await model.findOneAndReplace(
				{ _id: id },
				{ ...resolved, _id: id },
				{ upsert: true },
			)
		}
		res.json({ id })
	} catch (e) {
		next(e)
	}
})

// DELETE /api/db/:col/:id  -> { ok: true }
router.delete("/:col/:id", async (req, res, next) => {
	try {
		const { col, id } = req.params
		if (blocked(col, res)) return
		if (!adminCanAccess(req, col, id)) {
			return res.status(401).json({ error: "Unauthorized" })
		}
		await getModel(col).findByIdAndDelete(id)
		res.json({ ok: true })
	} catch (e) {
		next(e)
	}
})

export default router
