// Canonical list of grantable admin sections.
// Keep in sync with the backend list in server/src/utils/permissions.js.
export interface PermissionDef {
	key: string
	label: string
	description: string
}

export const PERMISSION_DEFS: PermissionDef[] = [
	{ key: "home", label: "Home Page", description: "Hero, headlines & homepage layout" },
	{ key: "news", label: "News", description: "Create & manage news articles" },
	{ key: "explore", label: "Explore Malkapur", description: "Places to visit & explore" },
	{ key: "events", label: "Events & Festivals", description: "Local events and festivals" },
	{ key: "businesses", label: "Business Directory", description: "Local business listings" },
	{ key: "videos", label: "Videos & Reels", description: "Video and reel content" },
	{ key: "gallery", label: "Gallery", description: "Photo gallery" },
	{ key: "about", label: "About Page", description: "About content & team" },
	{ key: "contact", label: "Contact", description: "Contact info & visitor messages" },
	{ key: "submissions", label: "Submissions", description: "Citizen reporter submissions" },
	{ key: "notifications", label: "Notifications", description: "Push & site notifications" },
	{ key: "settings", label: "Site Settings", description: "General site configuration" },
]

export const ALL_PERMISSION_KEYS = PERMISSION_DEFS.map((p) => p.key)

export function permissionLabel(key: string): string {
	const found = PERMISSION_DEFS.find((p) => p.key === key)
	return found ? found.label : key
}
