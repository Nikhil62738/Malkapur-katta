// Canonical catalog of grantable admin sections.
// Keep in sync with the frontend list in src/constants/permissions.ts.
export const PERMISSIONS = [
	"home",
	"news",
	"explore",
	"events",
	"businesses",
	"videos",
	"gallery",
	"about",
	"contact",
	"submissions",
	"notifications",
	"settings",
]

// Keep only valid, de-duplicated permission keys.
export function sanitizePermissions(input) {
	if (!Array.isArray(input)) return []
	return [...new Set(input.filter((p) => PERMISSIONS.includes(p)))]
}

// Maps a (collection, docId) write target to the permission key required to
// modify it. Returns null when no specific section permission applies.
export function requiredPermission(col, id) {
	switch (col) {
		case "news":
			return "news"
		case "events":
			return "events"
		case "places":
			return "explore"
		case "businesses":
			return "businesses"
		case "gallery":
			return "gallery"
		case "videos":
			return "videos"
		case "notifications":
			return "notifications"
		case "contactMessages":
			return "contact"
		case "submissions":
			return "submissions"
		case "about":
			return "about"
		case "settings":
			if (id === "home") return "home"
			if (id === "contact") return "contact"
			return "settings"
		default:
			return null
	}
}
