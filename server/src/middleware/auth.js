import jwt from "jsonwebtoken"

// Reads + verifies a Bearer token if present, attaching the payload to req.user.
// Never rejects — routes decide whether auth is required.
export function authOptional(req, _res, next) {
	const header = req.headers.authorization || ""
	const token = header.startsWith("Bearer ") ? header.slice(7) : null
	if (token) {
		try {
			req.user = jwt.verify(token, process.env.JWT_SECRET)
		} catch {
			/* invalid/expired token — treated as anonymous */
		}
	}
	next()
}

export function isAdminUser(user) {
	return !!(user && (user.role === "admin" || user.role === "superadmin"))
}

// Requires any admin-level account (sub-admin or super admin).
export function requireAdmin(req, res, next) {
	if (isAdminUser(req.user)) return next()
	return res
		.status(401)
		.json({ error: "Unauthorized", code: "auth/unauthorized" })
}

// Requires the super admin (the owner account that manages sub-admins).
export function requireSuperAdmin(req, res, next) {
	if (req.user && req.user.role === "superadmin") return next()
	return res
		.status(403)
		.json({ error: "Forbidden: super admin only", code: "auth/forbidden" })
}
