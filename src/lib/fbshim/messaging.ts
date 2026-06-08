// Drop-in replacement for `firebase/messaging`.
// FCM web push is not wired to the custom Express backend, so messaging is
// reported as unsupported and the app gracefully skips it. The in-app Web
// Notifications used by utils/notifications.ts work independently of this.

export interface Messaging {
	__type: "messaging"
}

export function getMessaging(_app?: unknown): Messaging {
	return { __type: "messaging" }
}

export async function isSupported(): Promise<boolean> {
	return false
}

export async function getToken(
	_messaging?: unknown,
	_options?: unknown,
): Promise<string> {
	return ""
}

export function onMessage(
	_messaging: unknown,
	_next: (payload: unknown) => void,
): () => void {
	return () => {}
}

export default { getMessaging, isSupported, getToken, onMessage }
