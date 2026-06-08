// Drop-in replacement for `firebase/app`.
// The real Firebase app is never created; this just satisfies the
// initializeApp / getApp / getApps surface used by src/utils/firebase.ts.

export interface FirebaseApp {
	name: string
	options: Record<string, unknown>
}

const apps: FirebaseApp[] = []

export function initializeApp(
	options: Record<string, unknown> = {},
	name = "[DEFAULT]",
): FirebaseApp {
	const existing = apps.find((a) => a.name === name)
	if (existing) return existing
	const app: FirebaseApp = { name, options }
	apps.push(app)
	return app
}

export function getApps(): FirebaseApp[] {
	return apps
}

export function getApp(name = "[DEFAULT]"): FirebaseApp {
	const app = apps.find((a) => a.name === name)
	if (!app) throw new Error(`No Firebase App '${name}' has been created`)
	return app
}

export default { initializeApp, getApps, getApp }
